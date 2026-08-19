import type { StoreName, StoredRecord } from "./types.js";

export const SYNCABLE_STORES = [
  "settings",
  "vocabulary",
  "readings",
  "activities",
  "quizHistory",
] as const satisfies readonly StoreName[];

export type SyncableStore = (typeof SYNCABLE_STORES)[number];

export function isSyncableStore(value: unknown): value is SyncableStore {
  return typeof value === "string" && (SYNCABLE_STORES as readonly string[]).includes(value);
}

export type SyncStatus =
  | "UNCONFIGURED"
  | "SIGNED_OUT"
  | "IDLE"
  | "SYNCING"
  | "PENDING_CHANGES"
  | "OFFLINE"
  | "ERROR"
  | "ACCOUNT_MISMATCH";

export interface SyncChange {
  store: SyncableStore;
  id: string;
  updatedAt: string;
  deleted?: boolean;
  record?: StoredRecord;
  revision?: number;
}

export interface SyncQueueItem extends StoredRecord {
  id: string; // `${store}:${recordId}`
  store: SyncableStore;
  recordId: string;
  updatedAt: string;
  deleted: boolean;
  record?: StoredRecord;
}

export interface SyncConflict extends StoredRecord {
  id: string; // `${store}:${recordId}`
  store: SyncableStore;
  recordId: string;
  localRecord?: StoredRecord;
  remoteRecord?: StoredRecord;
  conflictAt: string;
  resolvedAt?: string;
  resolution: "local" | "remote" | "last-write-wins";
}

export interface SyncMeta extends StoredRecord {
  id: "sync-meta";
  localDatasetOwnerUserId: string | null;
  lastCursor: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: SyncStatus;
  lastSyncError: string | null;
}

export interface SyncResult {
  success: boolean;
  pulledCount: number;
  pushedCount: number;
  conflictsCount: number;
  error?: string;
}

export interface RemoteSyncAdapter {
  pull(cursor?: string): Promise<{ changes: SyncChange[]; cursor?: string }>;
  push(changes: SyncChange[]): Promise<{ acknowledgedIds: string[]; cursor?: string }>;
}

export interface SyncCoordinator {
  sync(adapter?: RemoteSyncAdapter, force?: boolean): Promise<SyncResult>;
  getStatus(): SyncStatus;
  getMeta(): Promise<SyncMeta>;
  queueLocalChange(store: SyncableStore, recordId: string, record?: StoredRecord, deleted?: boolean): Promise<void>;
  getPendingCount(): Promise<number>;
  getConflicts(): Promise<SyncConflict[]>;
  resolveConflict(conflictId: string, choice: "local" | "remote"): Promise<void>;
  disconnect(): Promise<void>;
  onStatusChange(listener: (status: SyncStatus) => void): () => void;
}
