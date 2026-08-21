import {
  INDEXED_DB_SCHEMA_VERSION,
  type PersistenceAdapter,
  type StaticBackup,
  type StoreName,
  type StoredRecord,
} from "./types.js";

import {
  isSyncableStore,
  type SyncableStore,
} from "./sync.js";

const BACKUP_STORES = ["profile", "settings", "vocabulary", "readings", "activities", "quizHistory", "collections"] as const;

export interface BackupPreview {
  schemaVersion: number;
  counts: Record<(typeof BACKUP_STORES)[number], number>;
}

export interface ImportBackupResult {
  preview: BackupPreview;
  touchedRecords: Array<{ store: SyncableStore; record: StoredRecord }>;
  skippedRecords: Array<{ store: StoreName; record: StoredRecord; reason?: string }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateBackup(value: unknown): StaticBackup {
  if (!isRecord(value) || value.format !== "tu-trinh-language-backup") {
    throw new Error("Tệp không phải bản sao lưu LEXIS.");
  }
  if (typeof value.schemaVersion !== "number" || value.schemaVersion < 1 || value.schemaVersion > INDEXED_DB_SCHEMA_VERSION) {
    throw new Error(`Phiên bản bản sao lưu ${String(value.schemaVersion)} chưa được hỗ trợ.`);
  }
  if (!isRecord(value.data)) throw new Error("Bản sao lưu thiếu dữ liệu.");
  for (const store of BACKUP_STORES) {
    if (store === "collections" && value.schemaVersion < 3 && value.data[store] === undefined) continue;
    if (!Array.isArray(value.data[store])) throw new Error(`Dữ liệu ${store} không hợp lệ.`);
    for (const item of value.data[store]) {
      if (!isRecord(item) || typeof item.id !== "string" || !item.id) {
        throw new Error(`Bản ghi ${store} không hợp lệ.`);
      }
    }
  }
  if (!Array.isArray(value.data.collections)) value.data.collections = [];
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
    counts: Object.fromEntries(BACKUP_STORES.map((store) => [store, backup.data[store]?.length ?? 0])) as BackupPreview["counts"],
  };
}

export async function importBackup(
  adapter: PersistenceAdapter,
  raw: unknown,
  mode: "merge" | "replace",
): Promise<ImportBackupResult> {
  const backup = validateBackup(raw);
  const touchedRecords: Array<{ store: SyncableStore; record: StoredRecord }> = [];
  const skippedRecords: Array<{ store: StoreName; record: StoredRecord; reason?: string }> = [];

  if (mode === "replace") {
    for (const store of BACKUP_STORES) await adapter.clear(store);
  }

  for (const store of BACKUP_STORES) {
    const vocabularyKey = (item: Record<string, unknown>) =>
      typeof item.language === "string" && typeof item.normalizedTerm === "string" ? `${item.language}:${item.normalizedTerm}` : undefined;

    // Map existing normalized vocabulary keys to their record IDs
    const existingVocabMap = new Map<string, string>();
    if (store === "vocabulary" && mode === "merge") {
      const existingVocab = await adapter.getAll<Record<string, unknown>>("vocabulary");
      for (const v of existingVocab) {
        const key = vocabularyKey(v);
        if (key && typeof v.id === "string") {
          existingVocabMap.set(key, v.id);
        }
      }
    }

    const seenBackupVocabKeys = new Set<string>();

    for (const item of (backup.data[store] ?? []) as StoredRecord[]) {
      if (store === "vocabulary") {
        const record = item as Record<string, unknown>;
        const duplicateKey = vocabularyKey(record);

        if (duplicateKey) {
          if (mode === "merge") {
            const existingId = existingVocabMap.get(duplicateKey);
            if (existingId !== undefined) {
              if (existingId === item.id) {
                // Same normalized vocabulary identity with the SAME record id:
                // Treat as touched, allow/update the record, and include in touchedRecords
                await adapter.put(store as StoreName, item);
                if (isSyncableStore(store)) {
                  touchedRecords.push({ store, record: item });
                }
                continue;
              } else {
                // Same normalized identity exists under a DIFFERENT id:
                // Preserve duplicate protection, do not create duplicate
                skippedRecords.push({ store: store as StoreName, record: item, reason: "duplicate_normalized_term" });
                continue;
              }
            }

            if (seenBackupVocabKeys.has(duplicateKey)) {
              skippedRecords.push({ store: store as StoreName, record: item, reason: "duplicate_normalized_term_in_backup" });
              continue;
            }

            existingVocabMap.set(duplicateKey, item.id);
            seenBackupVocabKeys.add(duplicateKey);
          } else {
            // Replace mode: check duplicates within backup itself
            if (seenBackupVocabKeys.has(duplicateKey)) {
              skippedRecords.push({ store: store as StoreName, record: item, reason: "duplicate_normalized_term_in_backup" });
              continue;
            }
            seenBackupVocabKeys.add(duplicateKey);
          }
        }
      }

      await adapter.put(store as StoreName, item);
      if (isSyncableStore(store)) {
        touchedRecords.push({ store, record: item });
      }
    }
  }

  return {
    preview: previewBackup(backup),
    touchedRecords,
    skippedRecords,
  };
}

export function backupFileName(date = new Date()): string {
  return `tu-trinh-language-backup-${date.toISOString().slice(0, 10)}.json`;
}
