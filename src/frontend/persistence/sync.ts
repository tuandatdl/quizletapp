import type { StoreName, StoredRecord } from "./types";

export const SYNCABLE_STORES = ["settings", "vocabulary", "readings", "activities", "quizHistory"] as const satisfies readonly StoreName[];
export type SyncableStore = (typeof SYNCABLE_STORES)[number];

export interface SyncChange {
  store: SyncableStore;
  id: string;
  updatedAt: string;
  deleted?: boolean;
  record?: StoredRecord;
}

export interface RemoteSyncAdapter {
  pull(cursor?: string): Promise<{ changes: SyncChange[]; cursor?: string }>;
  push(changes: SyncChange[]): Promise<{ acknowledgedIds: string[]; cursor?: string }>;
}

/** Future cloud sync boundary: local-first, per-record last-write-wins with a user-visible conflict log. */
export interface SyncCoordinator {
  sync(adapter: RemoteSyncAdapter): Promise<void>;
}
