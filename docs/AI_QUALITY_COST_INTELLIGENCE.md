# AI quality and cost intelligence

## Scope and privacy

Phase J adds ephemeral, provider-neutral diagnostics. It does not add an
analytics database, Cloud Sync records, a telemetry request, or a user-facing
billing surface. Worker logs contain only operation-level counters and safe
provider failure codes; they never contain raw terms, Vietnamese definitions,
context sentences, identities, credentials, or authorization headers.

The normal vocabulary and translation API responses are unchanged.

## Existing validation pipeline

The Worker is the authoritative validation boundary:

- `createEnrichmentSchema` fixes language, exact candidate terms and batch
  cardinality (`minItems`/`maxItems`).
- `validateEnrichmentItems` enforces exact term identity, required lexical
  fields, valid English IPA/CEFR, batch IPA isolation, Chinese normalization,
  and removal of Chinese-only fields from English output.
- The prompt preserves input order and explicitly prohibits omission, merging,
  renaming, translation, or adding terms.
- Context participates in the cache identity and guides primary-sense
  selection, so river-bank and financial-bank requests cannot share a result.
- The gateway validates a provider result before caching it. A cached result is
  independently revalidated before use.
- Gemini has bounded retry only for transient network failures. Structured,
  identity and hard validation failures can fall back once to Workers AI; an
  `UNCERTAIN` lexical classification is accepted and does not create retries.
- Quick Add preserves user supplied meaning, POS, synonyms and assigned topics.
  AI suggestions remain opt-in and changing topics never calls enrichment.

The frontend's `validateEnrichment` remains a defensive transport/cache guard,
not a second source of truth. Its provider-confidence normalization now matches
the Worker: only finite values in `[0, 1]` survive. The Worker remains the only
place that authorizes an AI output or writes the KV cache.

## Quality signal

`AiQualitySignal` is internal metadata:

```ts
{
  status: "accepted" | "accepted_with_warning" | "rejected",
  applicationQualityScore?: number,
  providerConfidenceCount: number,
  issues: string[],
  validationPasses: string[],
  validationFailures: string[]
}
```

For accepted enrichment, the deterministic score is 0–100 and only describes
observed completeness: exact identity, cardinality, language, required fields,
English IPA/CEFR or Chinese normalization, senses, and lexical certainty. It
never overrides hard validation. A rejected provider payload does not become an
accepted low score: validation rejects it before the signal is emitted.

`lexicalConfidence` is provider-owned. It is preserved only when supplied as a
finite number in `[0,1]`; no provider confidence is synthesized. The
application score is deliberately separate from provider confidence.

## Gateway and cache metrics

Each completed Worker operation logs a safe `ai_gateway_completed` summary:

- operation, selected provider, item count, latency, cache hit/miss/read/write
  health and fallback count;
- for enrichment only: language, a context-present boolean, quality counts and
  aggregate quality signal;
- safe attempt records (provider, latency, machine failure code);
- Gemini token metadata when Gemini returned it.

KV failures and logging failures fail open. A cache read/write or metrics error
cannot fail a valid learning request. A KV hit invokes no provider. The existing
seven-day KV TTL remains unchanged.

## Usage and cost

Gemini `usageMetadata` is normalized only when safely present:

`inputTokens`, `outputTokens`, `totalTokens`, `unit: "tokens"`.

Workers AI does not claim token equivalence; it may only report a provider-native
unit when one becomes available. Cost is optional and isolated in Worker vars:
`AI_PRICING_VERSION`, `GEMINI_INPUT_PRICE_PER_MILLION`, and
`GEMINI_OUTPUT_PRICE_PER_MILLION`. Without both measured Gemini input/output
tokens and valid configured prices, `estimatedCostUsd` is omitted rather than
reported as a false zero.

## High-volume job metrics

High-volume imports create a local-only `high_volume_ai_job_summary` with exact
input/unique/duplicate/existing/user-complete/enrichment counts and actual batch,
retry and failure counts. Provider-specific batch counts are intentionally
omitted in the browser when the normal API response cannot measure them exactly;
the Worker logs carry the authoritative selected-provider/cache metrics. The
summary is neither saved nor synchronized.

The resulting call-reduction order remains: input dedupe, existing-vocabulary
skip, user-complete structured skip, then Worker KV cache. No auto-reanalysis is
introduced.
