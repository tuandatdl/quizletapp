# Production deployment

## Supported topology

```text
Internet
  -> HTTPS reverse proxy / load balancer
  -> Fastify (single origin)
       /api/*   private JSON API
       /health  liveness
       /ready   database/migration readiness
       /*       Vite build from dist/client with SPA fallback
```

Fastify serves the compiled frontend in production. Development continues to use Vite on port 5173 with its API proxy. Unknown `/api/*` paths always return JSON and never fall back to `index.html`.

Compression should be enabled at the reverse proxy or platform edge. Do not expose Fastify directly to the public internet without HTTPS and request filtering.

## Runtime and release version

- Release: `0.9.0`. This is intentionally pre-1.0 because cloud provider adapters are not included.
- Production runtime: Node.js 24 LTS. `node:sqlite` backup support requires Node 22.16 or newer; the repository and container standardize on Node 24.
- SQLite requires one writable persistent filesystem. Do not run multiple application replicas against a network-shared SQLite file.

## Environment

Required in production:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV=production` | Enables production validation, static serving and sanitized errors. |
| `DATABASE_URL` | Persistent SQLite file, for example `/data/tu-trinh-language.db`. `:memory:` is rejected. |
| `APP_ORIGIN` | Exact public origin, for example `https://learn.example.com`. Paths are rejected. |

Operational configuration:

| Variable | Default | Notes |
| --- | --- | --- |
| `HOST` | `0.0.0.0` in production | Bind address. |
| `PORT` | `3000` | Integer from 1 through 65535. |
| `STATIC_DIR` | `./dist/client` | Must contain `index.html` at production start. |
| `LOG_LEVEL` | `info` | Pino level: fatal/error/warn/info/debug/trace/silent. |
| `TRUST_PROXY` | `false` | Set `true` only when direct traffic can come solely from the trusted proxy. |
| `SESSION_TTL_DAYS` | `30` | Bearer-session expiry. |
| `DATABASE_BUSY_TIMEOUT_MS` | `5000` | SQLite lock wait. |
| `BODY_LIMIT_BYTES` | `1000000` | General JSON body limit. |
| `AUDIO_BODY_LIMIT_BYTES` | `16000000` | Pronunciation audio request limit. |
| `GENERAL_RATE_LIMIT` | `300` | Requests per IP/window for ordinary APIs. |
| `AUTH_RATE_LIMIT` | `10` | Combined login/register requests per IP/window. |
| `PROVIDER_RATE_LIMIT` | `30` | Cloud-dependent requests per IP/window. |
| `RATE_LIMIT_WINDOW_MS` | `60000` | In-memory limiter window. |
| `SHUTDOWN_TIMEOUT_MS` | `10000` | Safety deadline for SIGTERM/SIGINT shutdown. |
| `BACKUP_DIR` | `./backups` | Private, persistent, non-static backup location. |
| `BACKUP_RETENTION_COUNT` | unset | Pruning occurs only when explicitly set to a positive integer. |

`APP_ENV` remains accepted for backward-compatible local workflows. If both `NODE_ENV` and `APP_ENV` are supplied they must match.

Optional provider pairs are `TRANSLATION_PROVIDER`/`TRANSLATION_API_KEY`, `TTS_PROVIDER`/`TTS_API_KEY`, `PRONUNCIATION_PROVIDER`/`PRONUNCIATION_API_KEY`, and `VOCABULARY_ENRICHMENT_PROVIDER`/`VOCABULARY_ENRICHMENT_API_KEY`. Missing values do not block startup. This repository still needs concrete adapters before these variables can activate a provider.

## Host deployment

```bash
npm ci
npm run build
NODE_ENV=production DATABASE_URL=/persistent/tu-trinh-language.db APP_ORIGIN=https://learn.example.com npm run db:migrate:production
NODE_ENV=production DATABASE_URL=/persistent/tu-trinh-language.db APP_ORIGIN=https://learn.example.com npm start
```

Startup never seeds demo data and never applies migrations silently. It fails closed when migrations or the frontend build are missing. A new user registers normally. `db:seed` is a development/demo command; production execution is blocked unless `ALLOW_DEMO_SEED=true` is explicitly supplied.

For the prebuilt `.tgz` release artifact, extract it and use `npm ci --omit=dev`; its runtime package maps `npm run db:migrate` directly to the compiled migration entry point. Do not run `npm run build` inside the prebuilt artifact.

## SQLite durability

Every connection enables foreign keys, WAL and a 5-second busy timeout. The process uses a restrictive umask; database directories/files are tightened to `0700`/`0600`. Migrations are ordered, transactional and recorded with SHA-256 checksums. Applied migration files must never be edited; add a new numbered migration instead.

The deploy procedure is always build -> migrate -> start. Keep the database and backups outside the image/build directory on persistent storage. Monitor disk space for the database, WAL and backups.

## Backup and restore

Create an online-consistent, timestamped SQLite backup:

```bash
DATABASE_URL=/data/tu-trinh-language.db BACKUP_DIR=/backups npm run db:backup
```

The script uses SQLite's backup API and verifies `PRAGMA quick_check`; it does not naïvely copy an active WAL database. Backups are `0600`. Optional retention is explicit, for example `BACKUP_RETENTION_COUNT=14`.

Restore is intentionally destructive and requires explicit paths and confirmation:

1. Stop the application and verify no writer remains.
2. Back up the current database.
3. Run:

   ```bash
   npm run db:restore -- --backup /backups/selected.db --database /data/tu-trinh-language.db --confirm RESTORE
   ```

4. The script validates the selected backup and creates a timestamped pre-restore safety backup beside the database.
5. Run migrations, start the application, then verify `/ready` and login.

Backups contain email addresses and private learning activity. Never serve the backup directory over HTTP; storage encryption, off-site replication and access control belong to the deployment platform.

## Docker

```bash
docker build -t tu-trinh-language:0.9.0 .
docker volume create tutrinh-data
docker volume create tutrinh-backups

docker run --rm \
  -e NODE_ENV=production \
  -e APP_ORIGIN=https://learn.example.com \
  -v tutrinh-data:/data \
  tu-trinh-language:0.9.0 npm run db:migrate:production

docker run -d --name tu-trinh-language \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e APP_ORIGIN=https://learn.example.com \
  -v tutrinh-data:/data \
  -v tutrinh-backups:/backups \
  tu-trinh-language:0.9.0
```

The runtime is non-root and includes a `/ready` health check. `/data` and `/backups` must be persistent volumes. The image contains no `.env`, database or provider secret.

## Operations and security

- `/health` is liveness and does not depend on optional providers.
- `/ready` verifies database access, migration completeness and migration checksums.
- SIGTERM/SIGINT stops accepting requests, closes Fastify, checkpoints WAL and closes SQLite. The default deadline is 10 seconds.
- Logs are structured JSON with request IDs. Authorization/cookie headers, passwords and audio payload fields are redacted.
- API and health responses use `Cache-Control: no-store`; hashed Vite assets are immutable for one year; `index.html` is no-cache.
- CSP permits the existing Google Fonts hosts, same-origin APIs, blob/data audio and same-origin microphone use. Public microphone recording requires HTTPS (localhost is the development exception).
- The built-in rate limiter is process-local. A multi-instance deployment would require an edge/distributed limiter and a database topology change; that is outside this SQLite release.
- Bearer tokens are stored by the browser in localStorage. CSP and React escaping reduce XSS exposure, but any future third-party scripts must be reviewed carefully.
- Account export/deletion UI is not implemented. Treat it as a product requirement before broad public multi-user deployment.

## Provider-degraded mode

Without adapters, manual vocabulary, Quick Add parsing/manual completion, flashcards, reading, browser SpeechSynthesis, local recording, quiz, games, progress and settings remain available. Automatic translation, enrichment, cloud TTS and AI pronunciation scoring report their availability and return `SERVICE_NOT_CONFIGURED`; no fabricated output is produced.
