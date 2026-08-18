FROM node:24-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    STATIC_DIR=/app/dist/client \
    DATABASE_URL=/data/tu-trinh-language.db \
    BACKUP_DIR=/backups \
    LOG_LEVEL=info
WORKDIR /app

RUN groupadd --system --gid 10001 tutrinh \
    && useradd --system --uid 10001 --gid tutrinh --home-dir /app --shell /usr/sbin/nologin tutrinh \
    && mkdir -p /data /backups \
    && chown -R tutrinh:tutrinh /app /data /backups

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=tutrinh:tutrinh /app/dist ./dist
COPY --chown=tutrinh:tutrinh migrations ./migrations
COPY --chown=tutrinh:tutrinh scripts/db-backup.mjs scripts/db-restore.mjs ./scripts/

USER tutrinh
EXPOSE 3000
VOLUME ["/data", "/backups"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "dist/src/server.js"]
