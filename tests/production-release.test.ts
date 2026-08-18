import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { Database } from "../src/db/database.js";
import { testContext } from "./helpers.js";

describe("production release hardening", () => {
  it("fails fast for invalid production environment and accepts optional providers", () => {
    expect(() => loadConfig({ NODE_ENV: "production", APP_ORIGIN: "https://learn.example" })).toThrow(/DATABASE_URL/);
    expect(() => loadConfig({ NODE_ENV: "production", DATABASE_URL: "/data/app.db" })).toThrow(/APP_ORIGIN/);
    expect(() => loadConfig({ NODE_ENV: "production", DATABASE_URL: "./data/app.db", APP_ORIGIN: "https://learn.example" })).toThrow(/absolute path/);
    expect(() => loadConfig({ NODE_ENV: "production", DATABASE_URL: "/data/app.db", APP_ORIGIN: "not-an-origin" })).toThrow(/APP_ORIGIN/);
    expect(() => loadConfig({ NODE_ENV: "production", APP_ENV: "development", DATABASE_URL: "/data/app.db", APP_ORIGIN: "https://learn.example" })).toThrow(/must match/);
    expect(() => loadConfig({ NODE_ENV: "production", DATABASE_URL: "/data/app.db", APP_ORIGIN: "https://learn.example", PORT: "70000" })).toThrow(/65535/);
    const config = loadConfig({ NODE_ENV: "production", DATABASE_URL: "/data/app.db", APP_ORIGIN: "https://learn.example" });
    expect(config.translationConfigured).toBe(false);
    expect(config.vocabularyEnrichmentConfigured).toBe(false);
    expect(config.host).toBe("0.0.0.0");
  });

  it("serves lightweight health, database readiness, request IDs and security headers", async () => {
    const context = await testContext();
    const health = await context.app.inject({ method: "GET", url: "/health" });
    const ready = await context.app.inject({ method: "GET", url: "/ready" });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toMatchObject({ status: "ok", version: "0.9.0", environment: "test" });
    expect(ready.statusCode).toBe(200);
    expect(ready.json()).toMatchObject({ status: "ready", version: "0.9.0" });
    expect(health.headers["x-content-type-options"]).toBe("nosniff");
    expect(health.headers["x-frame-options"]).toBe("DENY");
    expect(health.headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(health.headers["x-request-id"]).toBeTruthy();
    expect(health.headers["cache-control"]).toBe("no-store");
    await context.close();
  });

  it("throttles repeated login attempts without changing the generic auth error", async () => {
    const db = new Database(":memory:"); db.migrate();
    const base = loadConfig({ APP_ENV: "test", DATABASE_URL: ":memory:" });
    const app = buildApp({ db, config: { ...base, authRateLimit: 2 } });
    const login = () => app.inject({ method: "POST", url: "/api/auth/login", payload: { email: "missing@example.com", password: "wrong-password" } });
    const first = await login();
    const second = await login();
    const throttled = await login();
    expect(first.statusCode).toBe(401);
    expect(second.json().error.message).toBe(first.json().error.message);
    expect(throttled.statusCode).toBe(429);
    expect(throttled.json().error.code).toBe("RATE_LIMITED");
    expect(throttled.headers["retry-after"]).toBeTruthy();
    await app.close(); db.close();
  });

  it("rejects oversized general payloads with a sanitized 413", async () => {
    const db = new Database(":memory:"); db.migrate();
    const base = loadConfig({ APP_ENV: "test", DATABASE_URL: ":memory:" });
    const app = buildApp({ db, config: { ...base, bodyLimitBytes: 128 } });
    const response = await app.inject({ method: "POST", url: "/api/auth/register", payload: { name: "x".repeat(200), email: "big@example.com", password: "password123" } });
    expect(response.statusCode).toBe(413);
    expect(response.json().error).toMatchObject({ code: "PAYLOAD_TOO_LARGE", details: {} });
    await app.close(); db.close();
  });

  it("enforces configured origins without enabling wildcard CORS", async () => {
    const context = await testContext({ config: { appOrigin: "https://learn.example" } });
    const denied = await context.app.inject({ method: "GET", url: "/health", headers: { origin: "https://evil.example" } });
    const allowed = await context.app.inject({ method: "GET", url: "/health", headers: { origin: "https://learn.example" } });
    expect(denied.statusCode).toBe(403);
    expect(denied.json().error.code).toBe("FORBIDDEN");
    expect(allowed.headers["access-control-allow-origin"]).toBe("https://learn.example");
    expect(allowed.headers["access-control-allow-origin"]).not.toBe("*");
    await context.close();
  });

  it("serves production SPA routes and assets but keeps unknown APIs as JSON 404", async () => {
    const directory = mkdtempSync(join(tmpdir(), "tu-trinh-static-"));
    mkdirSync(join(directory, "assets"));
    writeFileSync(join(directory, "index.html"), "<!doctype html><div id=\"root\">app</div>");
    writeFileSync(join(directory, "assets", "app-abc123.js"), "console.log('asset')");
    const db = new Database(":memory:"); db.migrate();
    const config = loadConfig({ NODE_ENV: "production", DATABASE_URL: join(directory, "unused.db"), APP_ORIGIN: "https://learn.example", STATIC_DIR: directory });
    const app = buildApp({ db, config });
    const direct = await app.inject({ method: "GET", url: "/reading/123" });
    const asset = await app.inject({ method: "GET", url: "/assets/app-abc123.js" });
    const api = await app.inject({ method: "GET", url: "/api/missing" });
    expect(direct.statusCode).toBe(200);
    expect(direct.body).toContain("id=\"root\"");
    expect(direct.headers["cache-control"]).toBe("no-cache");
    expect(direct.headers["strict-transport-security"]).toContain("max-age=");
    expect(asset.headers["cache-control"]).toContain("immutable");
    expect(api.statusCode).toBe(404);
    expect(api.headers["content-type"]).toContain("application/json");
    await app.close(); db.close(); rmSync(directory, { recursive: true, force: true });
  });

  it("reports not-ready when the database cannot be queried", async () => {
    const db = new Database(":memory:"); db.migrate();
    const app = buildApp({ db, config: loadConfig({ APP_ENV: "test", DATABASE_URL: ":memory:" }) });
    db.close();
    const response = await app.inject({ method: "GET", url: "/ready" });
    expect(response.statusCode).toBe(503);
    expect(response.json().error).toEqual({ code: "SERVICE_UNAVAILABLE", message: "Service is not ready", details: {} });
    await app.close();
  });

  it("stores only hashed session tokens and revokes them on logout", async () => {
    const context = await testContext();
    const session = context.db.get<{ token_hash: string; expires_at: string }>("SELECT token_hash,expires_at FROM sessions WHERE user_id=?", context.userId)!;
    expect(session.token_hash).not.toBe(context.token);
    expect(session.token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(new Date(session.expires_at).getTime()).toBeGreaterThan(Date.now());
    const logout = await context.app.inject({ method: "POST", url: "/api/auth/logout", headers: context.headers });
    expect(logout.statusCode).toBe(200);
    expect(context.db.get("SELECT id FROM sessions WHERE user_id=?", context.userId)).toBeUndefined();
    await context.close();
  });

  it("stores SQL/XSS-like vocabulary input as inert data", async () => {
    const context = await testContext();
    const term = "<img src=x onerror=alert(1)>'); DROP TABLE users;--";
    const created = await context.app.inject({ method: "POST", url: "/api/vocabulary", headers: context.headers, payload: { language: "en", term, meaningVi: "dữ liệu kiểm thử", source: "MANUAL", metadata: {} } });
    expect(created.statusCode).toBe(201);
    expect(created.json().data.item.term).toBe(term);
    expect(context.db.get<{ count: number }>("SELECT COUNT(*) AS count FROM users")?.count).toBe(1);
    await context.close();
  });

  it("runs tracked migrations repeatedly and records checksums/indexes", () => {
    const db = new Database(":memory:");
    db.migrate(); db.migrate(); db.assertMigrationsApplied();
    const migrations = db.all<{ version: string; checksum: string }>("SELECT version,checksum FROM schema_migrations ORDER BY version");
    const indexes = db.all<{ name: string }>("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_sessions_%'");
    expect(migrations.map((item) => item.version)).toEqual(["001_initial.sql", "002_production_hardening.sql"]);
    expect(migrations.every((item) => /^[a-f0-9]{64}$/.test(item.checksum))).toBe(true);
    expect(indexes).toHaveLength(2);
    db.close();
  });
});
