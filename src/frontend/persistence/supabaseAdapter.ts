import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { RemoteSyncAdapter, SyncChange, SyncableStore } from "./sync.js";
import { isSyncableStore } from "./sync.js";

export interface SupabaseSyncRecordRow {
  id?: string;
  user_id: string;
  store: string;
  record_id: string;
  payload: Record<string, unknown> | null;
  revision: number;
  updated_at: string;
  deleted_at: string | null;
}

export class SupabaseRemoteSyncAdapter implements RemoteSyncAdapter {
  constructor(
    private readonly client: SupabaseClient,
    private readonly user: User,
  ) {}

  async pull(cursor?: string): Promise<{ changes: SyncChange[]; cursor?: string }> {
    let query = this.client
      .from("user_sync_records")
      .select("store, record_id, payload, revision, updated_at, deleted_at")
      .eq("user_id", this.user.id)
      .order("updated_at", { ascending: true })
      .limit(200);

    if (cursor) {
      query = query.gt("updated_at", cursor);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Lỗi khi tải dữ liệu từ máy chủ đám mây: ${error.message}`);
    }

    const rows = (data || []) as SupabaseSyncRecordRow[];
    const changes: SyncChange[] = [];

    for (const row of rows) {
      if (!isSyncableStore(row.store)) continue;
      changes.push({
        store: row.store as SyncableStore,
        id: row.record_id,
        updatedAt: row.updated_at,
        deleted: Boolean(row.deleted_at),
        record: row.payload ? (row.payload as any) : undefined,
        revision: row.revision,
      });
    }

    const nextCursor = changes.length > 0 ? changes[changes.length - 1]!.updatedAt : cursor;
    return { changes, cursor: nextCursor };
  }

  async push(changes: SyncChange[]): Promise<{ acknowledgedIds: string[]; cursor?: string }> {
    if (changes.length === 0) {
      return { acknowledgedIds: [] };
    }

    const now = new Date().toISOString();
    const rows: SupabaseSyncRecordRow[] = changes.map((change) => ({
      user_id: this.user.id,
      store: change.store,
      record_id: change.id,
      payload: change.deleted ? null : (change.record as Record<string, unknown> ?? null),
      revision: change.revision ?? 1,
      updated_at: change.updatedAt || now,
      deleted_at: change.deleted ? (change.updatedAt || now) : null,
    }));

    // Bounded chunking (e.g. 50 items per chunk to prevent payload size issues)
    const CHUNK_SIZE = 50;
    const acknowledgedIds: string[] = [];
    let latestUpdatedAt: string | undefined;

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const { error } = await this.client
        .from("user_sync_records")
        .upsert(chunk, {
          onConflict: "user_id,store,record_id",
          ignoreDuplicates: false,
        });

      if (error) {
        throw new Error(`Lỗi khi đồng bộ lên máy chủ đám mây: ${error.message}`);
      }

      for (const row of chunk) {
        acknowledgedIds.push(row.record_id);
        if (!latestUpdatedAt || row.updated_at > latestUpdatedAt) {
          latestUpdatedAt = row.updated_at;
        }
      }
    }

    return { acknowledgedIds, cursor: latestUpdatedAt };
  }
}
