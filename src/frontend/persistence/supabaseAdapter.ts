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
  change_seq: string | number;
  updated_at: string;
  deleted_at: string | null;
}

export class SupabaseRemoteSyncAdapter implements RemoteSyncAdapter {
  static readonly PULL_PAGE_SIZE = 200;
  constructor(
    private readonly client: SupabaseClient,
    private readonly user: User,
  ) {}

  async pull(cursor?: string): Promise<{ changes: SyncChange[]; cursor?: string; hasMore: boolean }> {
    let query = this.client
      .from("user_sync_records")
      .select("store, record_id, payload, revision, change_seq, updated_at, deleted_at")
      .eq("user_id", this.user.id)
      .order("change_seq", { ascending: true })
      .limit(SupabaseRemoteSyncAdapter.PULL_PAGE_SIZE);

    if (cursor) {
      query = query.gt("change_seq", cursor);
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
        changeSeq: String(row.change_seq),
        updatedAt: row.updated_at,
        deleted: Boolean(row.deleted_at),
        record: row.payload ? (row.payload as any) : undefined,
        revision: row.revision,
      });
    }

    // Advance from the raw final row so an unknown future store cannot stall
    // this client at the same cursor forever.
    const finalRow = rows[rows.length - 1];
    const nextCursor = finalRow ? String(finalRow.change_seq) : cursor;
    return {
      changes,
      cursor: nextCursor,
      hasMore: rows.length === SupabaseRemoteSyncAdapter.PULL_PAGE_SIZE,
    };
  }

  async push(changes: SyncChange[]): Promise<{ acknowledgedKeys: string[] }> {
    if (changes.length === 0) {
      return { acknowledgedKeys: [] };
    }

    // The database trigger owns revision, write timestamp, tombstone time and
    // change sequence. Do not let device clocks order cloud writes.
    const rows = changes.map((change) => ({
      user_id: this.user.id,
      store: change.store,
      record_id: change.id,
      payload: change.deleted ? null : (change.record as Record<string, unknown> ?? null),
    }));

    // Bounded chunking (e.g. 50 items per chunk to prevent payload size issues)
    const CHUNK_SIZE = 50;
    const acknowledgedKeys: string[] = [];

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const { data, error } = await this.client
        .from("user_sync_records")
        .upsert(chunk, {
          onConflict: "user_id,store,record_id",
          ignoreDuplicates: false,
        })
        .select("store, record_id");

      if (error) {
        throw new Error(`Lỗi khi đồng bộ lên máy chủ đám mây: ${error.message}`);
      }

      for (const row of data ?? []) {
        if (isSyncableStore(row.store) && typeof row.record_id === "string") {
          acknowledgedKeys.push(`${row.store}:${row.record_id}`);
        }
      }
    }

    return { acknowledgedKeys };
  }
}
