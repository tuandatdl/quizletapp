# TÚ TRINH LANGUAGE

Local-first English and Chinese learning application with a React UI. It supports a Fastify + SQLite server mode and a GitHub Pages static mode backed by browser IndexedDB. Vietnamese is the explanation language.

## Requirements

- Node.js 24 LTS (local verification also runs on Node 25.2.1; production uses the LTS line)
- npm

`node:sqlite` may print an experimental warning on current Node releases. The warning is expected and does not fail builds or tests.

## First local run

```bash
cp .env.example .env
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://127.0.0.1:5173`. The single `npm run dev` command starts the API on `127.0.0.1:3000` and Vite on port `5173`; stopping it terminates both children.

Demo credentials after seeding:

```text
demo@tutrinhlanguage.local
Demo123!
```

Migration and seed scripts are idempotent. To run only one process, use `npm run dev:server` or `npm run dev:client`.

## Verification

```bash
npm run verify
npm run build
npm run smoke:fresh
npm run smoke:production
npm run build:pages
npm run smoke:static
```

`smoke:fresh` creates and removes a temporary database, migrates and seeds it, starts the compiled server through the production `npm start` command, then checks health, demo login, dashboard, vocabulary, and readings. It does not modify the configured development database.

For the free static deployment architecture, local-only storage, Cloudflare Worker setup and backup/import workflow, see [GitHub Pages Static Edition](docs/GITHUB_PAGES_STATIC_EDITION.md).

## Production

Fastify serves `dist/client` and `/api/*` from one origin; Vite remains development-only. Production startup validates persistent SQLite configuration, the exact public origin, applied migrations and compiled frontend assets.

```bash
npm ci
npm run build
NODE_ENV=production DATABASE_URL=/persistent/tu-trinh-language.db APP_ORIGIN=https://learn.example.com npm run db:migrate:production
NODE_ENV=production DATABASE_URL=/persistent/tu-trinh-language.db APP_ORIGIN=https://learn.example.com npm start
```

Do not run `db:seed` in production. See [deployment instructions](docs/DEPLOYMENT.md), the [production checklist](docs/PRODUCTION_CHECKLIST.md), and [release notes](docs/RELEASE_NOTES.md). The production release artifact can be generated with `npm run release:artifact` after a successful build.

## Providers

Translation, server TTS, and pronunciation use interfaces in `src/core/providers.ts`; quick-vocabulary enrichment uses `src/core/vocabulary-enrichment.ts`. This repository does not include concrete cloud adapters. Provider-like environment values alone do not activate a service; an adapter must be implemented and injected at application composition. With no adapter, the app boots normally, reports providers as unavailable, never fabricates output, and the UI shows the unavailable state. Browser SpeechSynthesis is an explicitly labelled local fallback for playback only. Quick vocabulary still parses, deduplicates, and previews terms without a provider; enrichment must be reviewed before the partial bulk-create endpoint is called.

## Architecture and contract

`src/app.ts` owns HTTP transport, `src/shared` owns reusable validation and primitive types, `src/core` owns business rules, and `src/db` owns persistence. Learning progress, SRS, quiz/game scoring, and shadowing transitions are server-owned.

The API source of truth is [docs/FRONTEND_INTEGRATION_CONTRACT.md](docs/FRONTEND_INTEGRATION_CONTRACT.md). The completed integration review is [docs/FINAL_INTEGRATION_REVIEW.md](docs/FINAL_INTEGRATION_REVIEW.md).

SQLite language-specific vocabulary attributes live in `metadata_json`. Recommended keys are `ipa`, `cefr`, `toeicLevel`, and `synonyms` for English; `simplified`, `traditional`, `pinyin`, `toneData`, `hskLevel`, `strokeCount`, `sentencePinyin`, and `tone` for Chinese.
