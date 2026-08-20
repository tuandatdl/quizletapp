# Cloud Sync production acceptance

## Scope and protocol

Cloud Sync is local-first: IndexedDB is always the working dataset, and an offline mutation is compacted into one queue entry per `store:id`. The cloud only synchronizes `settings`, `vocabulary`, `readings`, `activities`, and `quizHistory`.

The production cursor is `user_sync_records.change_seq`, a server-assigned, strictly increasing bigint. Pulls are ascending by `(user_id, change_seq)`, are limited to 200 rows, and continue until `hasMore` is false. The client persists only the final server cursor after every page applies successfully. It never derives a cursor from `updated_at` or a browser clock.

Apply these migrations in order before deploying the static client:

1. `supabase/migrations/20260819000000_cloud_sync.sql`
2. `supabase/migrations/20260820000000_cloud_sync_server_cursor.sql`

The second migration preserves the existing RLS policies. Its trigger assigns `change_seq`, `updated_at`, `revision`, and tombstone time on every insert/update; browser-supplied values for those fields are ignored.

## Concurrency decision

This release uses server-ordered last-write-wins (Design B), not client-clock LWW and not client-provided revisions. The server is authoritative for write order. During a pull, if a queued local mutation collides with a newly received server change, the cloud version is applied deterministically and the local version/tombstone is retained in `syncConflicts`. The Settings screen explains the automatic choice and lets the user explicitly keep the local version, which queues a new server-ordered mutation, or keep the cloud version.

This is deliberately not a silent merge: nested JSON payloads are whole-record values, so field-level merges would be unsafe without a record-specific merge contract.

## Safety behaviour

- First-device upload is allowed only after a complete pull proves that the remote dataset is empty.
- A browser that already belongs to account A retains `localDatasetOwnerUserId` after sign-out. Logging in as B is blocked as `ACCOUNT_MISMATCH`; it cannot reinterpret A's data as B's first device.
- An unowned browser with local data and a nonempty remote account is blocked before either dataset is changed. Use a fresh browser profile or clear/export local data deliberately before loading that account.
- Remote deletions are durable tombstones (`payload = null`, server-assigned `deleted_at`) and are not physically deleted by the client. A concurrent local edit versus a tombstone is recorded as a conflict, so it cannot silently resurrect the record.
- A failed pull/push leaves the local queue intact. Reconnection triggers a debounced retry; manual sync is also available in Settings.
- Push acknowledgement uses `store:id`, preventing a record named the same in two stores from being incorrectly removed from the queue.

## Operator checks

Before a release, verify in Supabase SQL Editor:

```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'user_sync_records'
  and column_name = 'change_seq';

select tgname from pg_trigger
where tgrelid = 'public.user_sync_records'::regclass and not tgisinternal;
```

RLS must remain enabled and owner-only policies from the first migration must remain in place. The frontend requires only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; never place `service_role` credentials in a client build.

## Required manual two-device acceptance

Automated tests cannot prove a real Supabase session, browser storage boundary, Magic Link, and deployed Pages artifact together. Run this after migration and deployment, using two distinct browser profiles/devices and the same account:

1. Device A: create and sync `go`, `car`, `live`, `total`.
2. Device B (fresh profile): sign in, sync, and verify all four appear exactly once.
3. Device B: create `apple`, sync. Device A: sync and verify `apple` appears.
4. Device A: delete `car`, sync. Device B: sync and verify `car` is gone.
5. Offline on B: change `live`, reconnect, sync, and verify it reaches A.
6. Make different offline edits to the same record on A and B. Sync both; verify the Settings conflict notice appears, cloud version is shown, and each resolution control behaves as described.
7. Sign out on a browser that owns local data, then sign in as a different account. Verify `ACCOUNT_MISMATCH` blocks automatic mixing/upload.

Only after all seven checks pass may release status be marked `READY_FOR_PRODUCTION_CLOUD_SYNC`.
