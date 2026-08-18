import {
  INDEXED_DB_SCHEMA_VERSION,
  type PersistenceAdapter,
  type StaticBackup,
  type StoreName,
  type StoredRecord,
} from "./types";

const BACKUP_STORES = ["profile", "settings", "vocabulary", "readings", "activities", "quizHistory"] as const;

export interface BackupPreview {
  schemaVersion: number;
  counts: Record<(typeof BACKUP_STORES)[number], number>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateBackup(value: unknown): StaticBackup {
  if (!isRecord(value) || value.format !== "tu-trinh-language-backup") {
    throw new Error("Tệp không phải bản sao lưu Tú Trinh Language.");
  }
  if (value.schemaVersion !== INDEXED_DB_SCHEMA_VERSION) {
    throw new Error(`Phiên bản bản sao lưu ${String(value.schemaVersion)} chưa được hỗ trợ.`);
  }
  if (!isRecord(value.data)) throw new Error("Bản sao lưu thiếu dữ liệu.");
  for (const store of BACKUP_STORES) {
    if (!Array.isArray(value.data[store])) throw new Error(`Dữ liệu ${store} không hợp lệ.`);
    for (const item of value.data[store]) {
      if (!isRecord(item) || typeof item.id !== "string" || !item.id) {
        throw new Error(`Bản ghi ${store} không hợp lệ.`);
      }
    }
  }
  return value as unknown as StaticBackup;
}

export async function exportBackup(adapter: PersistenceAdapter): Promise<StaticBackup> {
  const entries = await Promise.all(BACKUP_STORES.map((store) => adapter.getAll(store)));
  return {
    format: "tu-trinh-language-backup",
    schemaVersion: INDEXED_DB_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: Object.fromEntries(BACKUP_STORES.map((store, index) => [store, entries[index] ?? []])) as StaticBackup["data"],
  };
}

export function previewBackup(backup: StaticBackup): BackupPreview {
  return {
    schemaVersion: backup.schemaVersion,
    counts: Object.fromEntries(BACKUP_STORES.map((store) => [store, backup.data[store].length])) as BackupPreview["counts"],
  };
}

export async function importBackup(
  adapter: PersistenceAdapter,
  raw: unknown,
  mode: "merge" | "replace",
): Promise<BackupPreview> {
  const backup = validateBackup(raw);
  if (mode === "replace") {
    for (const store of BACKUP_STORES) await adapter.clear(store);
  }
  for (const store of BACKUP_STORES) {
    const vocabularyKey = (item: Record<string, unknown>) =>
      typeof item.language === "string" && typeof item.normalizedTerm === "string" ? `${item.language}:${item.normalizedTerm}` : undefined;
    const vocabularyKeys = store === "vocabulary"
      ? new Set((await adapter.getAll<Record<string, unknown>>("vocabulary")).map(vocabularyKey).filter((key): key is string => Boolean(key)))
      : undefined;
    for (const item of backup.data[store] as StoredRecord[]) {
      if (store === "vocabulary") {
        const record = item as Record<string, unknown>;
        const duplicateKey = vocabularyKey(record);
        if (duplicateKey && vocabularyKeys!.has(duplicateKey)) continue;
        if (duplicateKey) vocabularyKeys!.add(duplicateKey);
      }
      await adapter.put(store as StoreName, item);
    }
  }
  return previewBackup(backup);
}

export function backupFileName(date = new Date()): string {
  return `tu-trinh-language-backup-${date.toISOString().slice(0, 10)}.json`;
}
