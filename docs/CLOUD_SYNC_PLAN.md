# Cloud Sync Plan

## Current production behavior

The GitHub Pages build is deliberately local-first. Vocabulary, readings, progress, settings, quiz history, and game sessions are stored in the browser's IndexedDB database (`tu-trinh-language`). They are scoped to the browser profile and origin, so they **do not automatically appear on another device**. The Settings page provides JSON export and import as the supported transfer and recovery path today.

No account, remote database, synchronization service, or cross-device merge is currently enabled. This document must not be read as a claim that cloud sync has shipped.

## Recommended free-tier architecture

Use Supabase Auth plus Postgres for user data, while retaining the current Cloudflare Worker solely for language AI requests.

```
IndexedDB (offline source of truth)
        │
        ├── immediate local writes
        ▼
SyncCoordinator / RemoteSyncAdapter
        │ authenticated HTTPS, incremental cursor
        ▼
Supabase Auth + Postgres with Row Level Security
```

Supabase's free tier is a practical fit because it supplies managed authentication, Postgres, and Row Level Security without running a new server. The public browser key is acceptable only with correctly enforced RLS; the service-role key must never be placed in this repository or the Pages build.

## Data and conflict rules

The prepared `RemoteSyncAdapter` boundary in `src/frontend/persistence/sync.ts` is intentionally provider-neutral. A production adapter should synchronize the portable stores: `settings`, `vocabulary`, `readings`, `activities`, and `quizHistory`.

Each remote record should contain `user_id`, `store`, `record_id`, `payload`, `updated_at`, `revision`, and `deleted_at`. The initial policy should be per-record last-write-wins using server timestamps, with tombstones retained for 30 days so deletes propagate. If two edits are detected within a short conflict window, retain both versions in a conflict log and show a non-destructive resolution prompt; never silently erase local vocabulary.

## Rollout and migration

1. Add optional sign-in (email magic link is the smallest initial flow) and explain that data remains local until the learner elects to sync.
2. On first sign-in, back up the local portable stores, upload them in chunks, and only mark a sync cursor after server acknowledgement.
3. On later starts, pull remote changes, merge by record revision, then push local pending changes. Offline writes remain usable and queue for the next successful sync.
4. Offer a download-before-disconnect action and an account-data deletion flow that removes remote data only after confirmation.
5. Add integration tests for offline queueing, first-device upload, second-device download, concurrent edits, and deletion propagation before enabling the feature flag for users.

## Required decisions before implementation

The owner must create the Supabase project, select the auth UX and retention policy, configure the Pages environment with only public client settings, and approve the RLS schema. Until then, export/import is the correct cross-device workflow.
