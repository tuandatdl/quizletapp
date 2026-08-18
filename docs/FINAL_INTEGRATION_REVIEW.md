# Final Integration Review

Date: 2026-08-18
Product: TÚ TRINH LANGUAGE
Scope: backend, frontend, API contract, persistence, security ownership, local development, compiled production server, and clean-database bootstrap

## Review scope

The review traced every frontend API module against the Fastify routes and Zod schemas, inspected the core services and UI state contexts, exercised all core domains through HTTP integration tests, ran a live Vite/API proxy smoke, built both targets, and booted the compiled server against a newly migrated and seeded temporary SQLite database. No existing development database was removed or replaced.

The in-app browser environment reported no available browser instance. Consequently, DOM interaction claims are based on code inspection plus live history-fallback/proxy requests, not automated visual clicks. Real-device microphone, installed SpeechSynthesis voice, focus, and viewport acceptance remain manual acceptance items.

## Baseline

- `npm run verify`: passed before changes; 5 test files and 14 tests.
- `npm run build`: passed before changes; client JavaScript was approximately 418 kB / 110 kB gzip.
- Reproduced production boot failure: the original `npm start` referenced a file that the compiler did not emit.
- Reproduced query coercion failure: the strings `due=false` and `random=false` parsed as true.

## Architecture and contract review

The architecture remains appropriate: Fastify is transport-only, Zod validates external input, core services own state transitions, and SQLite owns durable state. Frontend API calls match backend method/path combinations and unwrap the `{state,data}` envelope consistently. `Language`, `ReviewAction`, and `VocabularyStatus` frontend primitives now derive from shared schema types; runtime integration tests protect the larger mapped response types from drift.

All session answers and scores remain server-owned. Public quiz and game session payloads do not expose correct answers. Unknown `/api` routes return the unified JSON error contract, while Vite serves SPA history fallback for non-API routes.

## Issues found and fixed

### INT-P1-001 — compiled server could not start

- Severity: P1
- Root cause: `npm start` pointed at `dist/server.js`, but TypeScript emits `dist/src/server.js`.
- Files affected: `package.json`, `scripts/smoke-fresh-db.mjs`
- Fix: corrected the entry point and added a clean-database smoke that boots through the exact production command.

### INT-P1-002 — false query flags became true

- Severity: P1
- Root cause: `z.coerce.boolean()` follows JavaScript truthiness for non-empty strings.
- Files affected: `src/shared/schemas.ts`, `tests/final-integration.test.ts`
- Fix: parse only explicit boolean/`"true"`/`"false"` values and reject other strings.

### INT-P1-003 — incomplete reading/pronunciation ownership checks

- Severity: P1
- Root cause: selected-vocabulary save and pronunciation assessment accepted related reading IDs without resolving them in the caller's ownership scope.
- Files affected: `src/app.ts`, `src/core/pronunciation.ts`, `src/core/providers.ts`, `src/shared/schemas.ts`
- Fix: resolve reading ownership before selection save; verify reading and sentence ownership/relationship before provider invocation or persistence.

### INT-P1-004 — listening/tone session contract leaked or omitted answers

- Severity: P1
- Root cause: listening prompts contained the term; game current items included `answer`; Chinese tone questions only read one metadata shape and could generate an empty answer.
- Files affected: `src/core/quiz.ts`, `src/frontend/types/api.ts`, quiz/game pages
- Fix: introduced public `audioText`, hid stored answers, used non-revealing prompts, and derived tone answers from either `tone` or `toneData` while rejecting unusable questions.

### INT-P1-005 — selection save could fabricate meaning

- Severity: P1
- Root cause: the reading UI used a placeholder Vietnamese meaning when translation data was absent.
- Files affected: `src/frontend/pages/reading/ReadingDetailPage.tsx`
- Fix: save is unavailable until a real meaning exists; unconfigured translation shows a friendly state and never writes invented content.

### INT-P2-001 — audio and recording lifecycle gaps

- Severity: P2
- Root cause: playback speed settings were bypassed; speech/audio could overlap; requests and media tracks were not consistently cancelled; recording capability and MIME validation were incomplete.
- Files affected: `AudioButton.tsx`, pronunciation/shadowing pages, TTS/pronunciation API modules, provider schema
- Fix: applied configured speed, serialized playback, added abort/unmount cleanup, stopped media tracks, validated capability/base64/MIME, and prevented cancelled recordings from reappearing asynchronously.

### INT-P2-002 — settings/language/theme hydration drift

- Severity: P2
- Root cause: optimistic local updates could survive failed persistence and theme changes were not synchronized across contexts.
- Files affected: language/theme contexts, header, settings/quiz/game/progress pages
- Fix: backend persistence errors now propagate; stored settings synchronize theme and active language-dependent screens; system-theme changes continue to be observed.

### INT-P2-003 — invalid/loading and responsive accessibility edges

- Severity: P2
- Root cause: an invalid reading could remain a skeleton; focus trapping/return and narrow two-column layouts were incomplete; selection toolbar positioning could overflow.
- Files affected: reading detail, modal, mobile navigation, vocabulary/reading/settings/progress pages, shared CSS
- Fix: explicit error state, ESC/focus trap/focus return, keyboard-operable cards and controls, mobile grid collapse, compact header/nav rules, and clamped selection toolbar.

### INT-P2-004 — sentence abbreviation splitting

- Severity: P2
- Root cause: the English splitter treated common titles such as `Dr.` as sentence endings.
- Files affected: `src/core/reading.ts`, integration tests
- Fix: protect common abbreviations during splitting while preserving period/question/exclamation/newline behavior.

### INT-P2-005 — environment/proxy ambiguity

- Severity: P2
- Root cause: one variable was used conceptually for browser API base and Vite proxy target, and numeric runtime settings accepted `NaN`/invalid values.
- Files affected: `vite.config.ts`, `src/config.ts`, `.env.example`, `README.md`
- Fix: added `VITE_DEV_PROXY_TARGET`, retained optional `VITE_API_BASE_URL`, and fail early on invalid port/session TTL.

## End-to-end results

- Auth: register, duplicate/invalid registration, valid/invalid login, `/api/me`, logout/revocation, and protected ownership passed.
- Vocabulary: English and Chinese create/read/update/favorite/review/delete, metadata, normalization, duplicate idempotency, and same-term cross-language separation passed.
- Flashcards/SRS: normal, due, random, empty, English, Chinese, all four actions, durable reload, intervals, repetitions, timestamps, counters, and invariants passed.
- Reading: English/Chinese create/list/get/update/delete, persisted sentences/tokens, punctuation/newline/abbreviation splitting passed.
- Selection: word/phrase/sentence classification, size validation, provider response, provenance save, duplicate save, and foreign-reading rejection passed.
- TTS: unconfigured server response and no fake URL passed; UI fallback lifecycle was audited statically.
- Pronunciation: unconfigured no-write path, malformed MIME/base64, controlled provider mapping, recent/weakest persistence, and foreign-reading rejection passed.
- Shadowing: start, correct attempt advance, next sentence, completion, wrong sentence, duplicate advance, and completed-session rejection passed.
- Quiz: required English/Chinese types, hidden answer, listening audio text, tone metadata, scoring/index/completion, empty-data behavior, and ownership passed.
- Games: all five types, hidden answer, server validation/score/index/completion, listening audio text, and ownership passed.
- Progress/Today: persisted review/quiz/activity aggregation, streak qualification, settings targets, daily goal, both languages, pinyin, and shadowing targets passed.
- Settings: language, boolean display preferences, theme, speed, autoplay, goal and per-domain targets persisted with runtime boolean shapes.

## Tests added

`tests/final-integration.test.ts` covers runtime contracts, security matrix, both language domains, all session types, invalid inputs, provider behavior, activity/settings, and clean error shapes. `tests/srs.test.ts` adds algorithm invariants. `scripts/smoke-fresh-db.mjs` is the repeatable final clean-database gate.

## Final commands and results

```text
npm run verify       PASS — 6 files, 34 tests
npm run build        PASS — server and client
npm run smoke:fresh  PASS — migration, seed, compiled production start,
                              demo login, dashboard, 4 vocabulary, 2 readings
```

Production client output is approximately 426 kB / 112.5 kB gzip with no accidental large dependency found. The only repeated runtime warning is Node's documented `node:sqlite` experimental warning.

Live development smoke returned HTML 200 for `/`, protected/direct SPA paths, invalid client paths, and JSON 200 through the `/health` proxy. Demo login through the Vite `/api` proxy returned a token. Stopping `npm run dev` closed both ports 3000 and 5173.

## Known limitations

- UTC is the persistence boundary for activity/streak days.
- Chinese tokenization is heuristic rather than dictionary-based.
- Game timers are not authoritatively enforced by the server; all answer and score state is authoritative.
- The five game types share a generic prompt/answer presentation rather than specialized match-board/memory-board mechanics.
- External Google Fonts may fail offline, but CSS includes platform and Chinese fallbacks.
- Browser automation was unavailable in this review environment; real-browser microphone/voice/device and visual viewport checks remain local acceptance work.

## Run and production notes

For development, migrate and seed once, then run `npm run dev` and open port 5173. For production, serve `dist/client` as an SPA and reverse-proxy `/api` and `/health` to `npm start` on the same origin. Cross-origin frontend deployment is not enabled by default; no permissive CORS policy was added.

No cloud adapter is bundled. Provider environment placeholders do not create an implementation. Unconfigured boot is supported and deliberate.

## Release readiness

No P0 or P1 issue remains after the final verification. The repository is ready for local product acceptance, subject to the explicitly manual browser/device acceptance items above.
