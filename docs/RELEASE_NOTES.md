# TÚ TRINH LANGUAGE 0.9.0

Production candidate release for private/personal deployment after local user acceptance.

## Product capabilities

- English and Chinese learning with Vietnamese explanations.
- Manual vocabulary management and Quick Add preview/partial bulk creation.
- English IPA/CEFR and Chinese pinyin/tone/HSK metadata support.
- Flashcards with server-owned spaced-repetition state.
- Reading library, sentence/token selection tools and saved reading vocabulary.
- Reading playback contract for browser SpeechSynthesis and provider audio.
- Local pronunciation recording, shadowing, quizzes and learning games.
- Progress dashboard, goals, settings and responsive mobile navigation.

## Production work

- Same-origin Fastify static serving with SPA history fallback and immutable asset caching.
- Fail-fast environment validation, JSON health/readiness, structured/redacted logging and graceful shutdown.
- Strict origin policy, security headers, request limits and differentiated authentication/provider rate limits.
- SQLite WAL, foreign keys, busy timeout, restrictive permissions, incremental checksummed migrations and session indexes.
- Online-safe timestamped backup, guarded restore, persistence/restart/restore smoke coverage.
- Multi-stage non-root Docker image, CI workflow, generic deployment runbook and release artifact checksum.
- Production demo seeding disabled by default and demo quick-fill removed from production frontend builds.

## Known limitations

- Concrete cloud adapters are not bundled. Automatic translation/enrichment, cloud TTS and AI pronunciation scoring remain unavailable until an adapter is implemented and injected.
- The process-local rate limiter and SQLite topology target a single application instance.
- Browser bearer sessions remain in localStorage; avoid unreviewed third-party scripts.
- Account export/deletion UI is not yet available and should be addressed before a broad public multi-user launch.
