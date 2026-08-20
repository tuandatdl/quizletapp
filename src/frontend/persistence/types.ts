export const INDEXED_DB_NAME = "tu-trinh-language";
export const INDEXED_DB_SCHEMA_VERSION = 3;

export const STORE_NAMES = [
  "profile",
  "settings",
  "vocabulary",
  "readings",
  "activities",
  "quizHistory",
  "quizSessions",
  "gameSessions",
  "pronunciationHistory",
  "enrichmentCache",
  "meta",
  "syncQueue",
  "syncConflicts",
  "collections",
] as const;

export type StoreName = (typeof STORE_NAMES)[number];

export interface StoredRecord {
  id: string;
  [key: string]: unknown;
}

export interface PersistenceAdapter {
  readonly schemaVersion: number;
  get<T>(store: StoreName, id: string): Promise<T | undefined>;
  getAll<T>(store: StoreName): Promise<T[]>;
  put<T extends StoredRecord>(store: StoreName, value: T): Promise<T>;
  delete(store: StoreName, id: string): Promise<void>;
  clear(store: StoreName): Promise<void>;
  clearAll(): Promise<void>;
}

export interface StaticBackup {
  format: "tu-trinh-language-backup";
  schemaVersion: number;
  exportedAt: string;
  data: {
    profile: unknown[];
    settings: unknown[];
    vocabulary: unknown[];
    readings: unknown[];
    activities: unknown[];
    quizHistory: unknown[];
    collections?: unknown[];
  };
}
