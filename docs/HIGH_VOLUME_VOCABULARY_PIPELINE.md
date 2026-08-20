# High-volume vocabulary pipeline

## Audited limits

- The existing Quick Add parser and server bulk-preview route retain their 100-item/10,000-character compatibility limit.
- The Worker enrichment endpoint accepts at most 25 terms and a 32 KB payload.
- The Worker KV cache is unchanged: `AI_CACHE`, normalized validated batch payloads, and a 604,800-second TTL.
- The bulk persistence API retains a 100-item contract. The client saves in 20-item sequential chunks instead of widening it.

## Phase I orchestration

Imports larger than 100 items use 20-term preview batches with a maximum concurrency of two. The first input spelling/order is retained, English duplicates are collapsed case-insensitively, and Chinese import dedupe does not collapse internal spacing. Existing local vocabulary and drafts with an explicit Vietnamese meaning are skipped before enrichment.

Completed batches remain visible when another batch fails. Failed analysis batches use bounded 1s/2s retry backoff and can be retried without rerunning ready, invalid, existing, or saved rows. Cancellation advances the local generation token so late results cannot mutate a newer job.

Preview rendering is paginated to 50 rows. This avoids mounting thousands of editable cards or chips concurrently while retaining per-row editing and topic controls.

## Cache and checkpoint decision

Phase I does not alter Worker cache granularity: one normalized validated result per Worker enrichment batch. Local import dedupe and existing-vocabulary detection reduce requests before a batch is sent; repeated batches continue to reuse the existing Worker KV cache.

No in-progress IndexedDB checkpoint is persisted. Temporary jobs are intentionally local UI state: they contain editable user drafts and transient failure state, must never enter cloud sync, and would add recovery/migration complexity without background execution. Completed vocabulary remains governed by the existing IndexedDB and Cloud Sync paths.
