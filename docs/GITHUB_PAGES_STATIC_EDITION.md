# GitHub Pages Static Edition R1

## Architecture

The application now has two explicit runtime modes:

- `server`: the existing React → Fastify → SQLite architecture. This remains the default.
- `static`: React/Vite → `StaticApiRouter` → `IndexedDbAdapter`, with Cloudflare Worker + Workers AI used only for language enrichment and translation.

The frontend API modules keep their existing contract. `src/frontend/api/client.ts` chooses the transport at the boundary, so pages and domain UX are not duplicated. Static mode never needs Fastify to be online.

## Local data and profile

Static mode uses a local profile named `Tú Trinh`; it has no password and is not presented as secure server authentication. Vocabulary, SRS state, readings/sentences, quiz history, activity/progress, settings, pronunciation history and enrichment cache have versioned IndexedDB stores.

Data is local to one browser profile. Chrome on a Mac and a phone browser do not share IndexedDB. R1 transfer between devices is JSON backup/import; automatic cross-device sync is deferred to `CLOUD_SYNC_R1`.

## Backup and restore

Settings → **Dữ liệu** provides:

- **Xuất bản sao lưu**: downloads `tu-trinh-language-backup-YYYY-MM-DD.json`.
- **Nhập bản sao lưu**: validates format/schema/record IDs, previews counts, then offers merge or replace. Duplicate IDs merge deterministically; malformed JSON is rejected as data and never executed.
- **Xóa dữ liệu trên thiết bị**: requires typing the Vietnamese confirmation phrase.

Transient browser/cache metadata and active game/quiz sessions are excluded from exported backups.

## Automatic language service

Set the public Worker endpoint at build time:

```bash
VITE_RUNTIME_MODE=static \
VITE_PAGES_BASE_PATH=/REPOSITORY/ \
VITE_LANGUAGE_API_URL=https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev \
npm run build:pages
```

No model/API secret is compiled into browser assets. Quick Add preserves comma/newline-delimited phrases, batches at most 25 terms, enriches automatically after parsing, validates results, and caches them under `language + normalized term + vocabulary-enrichment-v1`. Failed items can be retried individually or together. A rich-enrichment failure falls back to translation-only data when translation succeeds.

## Local English TTS

The default English audio engine is Local: Piper runs in a browser Worker and
downloads `en_US-lessac-medium` on first use. The downloaded model is kept in
versioned Cache Storage; the synthesized audio reuses the existing IndexedDB
audio cache. It does not call `/v1/tts` or use device SpeechSynthesis in LOCAL
mode. `AUTO` tries Local, then Cloud, then the browser voice; `CLOUD` and
`BROWSER` remain strict. No voice binary is part of this repository. See
[`LOCAL_TTS_MODEL_LICENSES.md`](./LOCAL_TTS_MODEL_LICENSES.md) before changing
the configured model URL or adding another language.

Reading creation saves the passage before attempting optional automatic translation. Full-passage and selected-text translation use the Worker, and saving a selected word/phrase automatically enriches it. If the network or AI call fails, saved local content remains intact and can be retried.

Workers AI JSON Mode is used, but the Worker validates every model response because Cloudflare explicitly notes that schema compliance is not guaranteed: <https://developers.cloudflare.com/workers-ai/features/json-mode/>.

The configured default models are available within Workers AI's general Free-plan allocation as of 2026-08-18. Cloudflare documents 10,000 free Neurons/day and identifies only a small separate set of paid-only models: <https://developers.cloudflare.com/workers-ai/platform/pricing/>.

## Worker security and deployment

The deployable project is `cloudflare/worker`.

1. Set `ALLOWED_ORIGINS` in `wrangler.toml` to `https://USERNAME.github.io` (and explicit local development origins only when needed).
2. Keep the AI binding named `AI`.
3. Optionally configure a Cloudflare Rate Limiting binding named `RATE_LIMITER`; the Worker also has a per-isolate basic fallback.
4. From `cloudflare/worker`, run `npm install`, `npm run typecheck`, then `npm run deploy` after operator login.

The Worker rejects unknown origins, oversized bodies, too many/oversized terms, arbitrary keys such as `prompt`, and malformed model output. It constructs prompts internally and does not store user vocabulary.

## GitHub Pages

`npm run build:pages` sets static runtime explicitly. Vite uses `VITE_PAGES_BASE_PATH` (default `/quizletapp/`) and the app uses `HashRouter`, so deep links do not depend on a Pages history fallback.

`.github/workflows/pages.yml` runs locked install, typecheck, all tests, Pages build and `smoke:static`, then uploads/deploys with official GitHub Pages actions. Define repository variable `VITE_LANGUAGE_API_URL` before release; the workflow deliberately fails closed when it is empty, so Pages cannot publish a build without automatic translation. For a user/organization root Pages repository, set `VITE_PAGES_BASE_PATH=/`; otherwise the workflow derives `/<repository>/`.

In repository Settings → Pages, select **GitHub Actions** as the publishing source. Actual GitHub push/deploy and Cloudflare deployment require operator authentication and are intentionally not performed by this implementation.

## Offline behavior and limitations

Previously stored study data, flashcards, quizzes/games, progress, readings, browser SpeechSynthesis and local microphone recording remain usable without Fastify. Enrichment/translation shows an offline/service error and never fabricates a translation. The static edition does not include server-side authentication, cloud sync, server TTS or AI pronunciation scoring.

Browser storage can be cleared by the user/browser/OS, so regular backup is recommended.
