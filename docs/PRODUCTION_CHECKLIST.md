# Production checklist

## Before deployment

- [ ] Use Node.js 24 LTS or build the provided Docker image.
- [ ] Run `npm ci`, `npm run verify`, `npm run build`, and `npm run smoke:production`.
- [ ] Set `NODE_ENV=production`.
- [ ] Set the exact HTTPS `APP_ORIGIN`.
- [ ] Store `DATABASE_URL` on persistent writable storage, outside the image/build directory.
- [ ] Store `BACKUP_DIR` on private persistent storage, never under the static directory.
- [ ] Set provider secrets only in the deployment secret store; verify no `.env` is in the artifact.
- [ ] Decide each AI provider state intentionally; unavailable providers must remain degraded, not fake.
- [ ] Keep `ALLOW_DEMO_SEED=false` and confirm no demo credentials exist.
- [ ] Leave `TRUST_PROXY=false` unless direct access is restricted to a trusted reverse proxy.
- [ ] Configure HTTPS and compression at the reverse proxy/edge.
- [ ] Configure disk-space, restart and backup monitoring.

## Release

- [ ] Run `npm run db:backup` against the current database.
- [ ] Run `npm run db:migrate:production` before starting the new application.
- [ ] Start the compiled server with `npm start` or the container default command.
- [ ] Verify `GET /health` returns 200.
- [ ] Verify `GET /ready` returns 200.
- [ ] Verify `/`, `/reading`, and `/reading/:id` refresh without server 404.
- [ ] Verify unknown `/api/*` returns a JSON 404.
- [ ] Register a new user and verify login/logout.
- [ ] Create and reload vocabulary and reading data.
- [ ] Test microphone recording over HTTPS.
- [ ] Confirm translation, TTS, pronunciation and enrichment availability states match configured adapters.

## Recovery

- [ ] Perform a restore drill using a disposable database before first public release.
- [ ] Keep the application stopped during restore.
- [ ] Preserve the automatic pre-restore safety backup.
- [ ] Re-run migrations after restore.
- [ ] Re-check `/ready`, login and persisted learning data.
