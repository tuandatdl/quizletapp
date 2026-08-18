import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { once } from "node:events";

const run = (command, args, env) => new Promise((resolveRun, reject) => {
  const child = spawn(command, args, { cwd: process.cwd(), env, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  child.on("error", reject);
  child.on("exit", (code) => code === 0 ? resolveRun(output) : reject(new Error(`${command} ${args.join(" ")} failed (${code})\n${output}`)));
});

const availablePort = () => new Promise((resolvePort, reject) => {
  const socket = createServer();
  socket.on("error", reject);
  socket.listen(0, "127.0.0.1", () => {
    const address = socket.address();
    const port = typeof address === "object" && address ? address.port : 0;
    socket.close(() => resolvePort(port));
  });
});

const waitForReady = async (baseUrl, output) => {
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/ready`);
      if (response.ok && (await response.json()).status === "ready") return;
    } catch (error) { lastError = error; }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Server did not become ready: ${String(lastError)}\n${output()}`);
};

const request = async (baseUrl, path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${text}`);
  return { response, body };
};

const startServer = async (env, baseUrl) => {
  const child = spawn("node", ["dist/src/server.js"], { cwd: process.cwd(), env, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  await waitForReady(baseUrl, () => output);
  return { child, output: () => output };
};

const stopServer = async (server) => {
  const exited = once(server.child, "exit");
  server.child.kill("SIGTERM");
  const [code, signal] = await Promise.race([
    exited,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Graceful shutdown timed out\n${server.output()}`)), 12_000))
  ]);
  if (code !== 0 || signal) throw new Error(`Production server did not stop cleanly: code=${code} signal=${signal}\n${server.output()}`);
};

if (!existsSync(resolve("dist/client/index.html")) || !existsSync(resolve("dist/src/server.js"))) {
  throw new Error("Compiled production assets are missing; run npm run build first");
}

const scratchDir = await mkdtemp(join(tmpdir(), "tu-trinh-production-"));
const databasePath = join(scratchDir, "production.db");
const backupDir = join(scratchDir, "backups");
const port = await availablePort();
const baseUrl = `http://127.0.0.1:${port}`;
const productionEnv = {
  ...process.env,
  NODE_ENV: "production",
  DATABASE_URL: databasePath,
  APP_ORIGIN: baseUrl,
  STATIC_DIR: resolve("dist/client"),
  HOST: "127.0.0.1",
  PORT: String(port),
  TRUST_PROXY: "false",
  LOG_LEVEL: "warn",
  ALLOW_DEMO_SEED: "false",
  BACKUP_DIR: backupDir
};
delete productionEnv.APP_ENV;
let server;

try {
  await run("node", ["dist/src/db/migrate.js"], productionEnv);
  await run("node", ["dist/src/db/migrate.js"], productionEnv);
  server = await startServer(productionEnv, baseUrl);

  const health = await request(baseUrl, "/health");
  if (health.body.environment !== "production") throw new Error("Health did not report production environment");
  const home = await fetch(`${baseUrl}/`);
  const direct = await fetch(`${baseUrl}/reading/00000000-0000-4000-8000-000000000000`);
  if (!home.ok || !direct.ok || !(await direct.text()).includes("id=\"root\"")) throw new Error("SPA static serving/history fallback failed");
  const homeHtml = await home.text();
  const assetPath = homeHtml.match(/(?:src|href)="(\/assets\/[^"]+)"/)?.[1];
  if (!assetPath) throw new Error("Hashed frontend asset was not found in index.html");
  const asset = await fetch(`${baseUrl}${assetPath}`);
  if (!asset.ok || !asset.headers.get("cache-control")?.includes("immutable")) throw new Error("Static immutable cache policy failed");
  const missingApi = await fetch(`${baseUrl}/api/does-not-exist`);
  if (missingApi.status !== 404 || !(await missingApi.headers.get("content-type"))?.includes("application/json")) throw new Error("Unknown API route did not return JSON 404");

  const unique = Date.now().toString(36);
  const email = `production-${unique}@example.test`;
  const password = "ProductionSmoke123!";
  const registration = await request(baseUrl, "/api/auth/register", {
    method: "POST", headers: { "content-type": "application/json", origin: baseUrl }, body: JSON.stringify({ name: "Production Smoke", email, password })
  });
  const token = registration.body.data.token;
  const authHeaders = { authorization: `Bearer ${token}`, "content-type": "application/json", origin: baseUrl };
  await request(baseUrl, "/api/vocabulary", { method: "POST", headers: authHeaders, body: JSON.stringify({ language: "en", term: `durable-${unique}`, meaningVi: "bền vững", source: "MANUAL", metadata: {} }) });
  await request(baseUrl, "/api/readings", { method: "POST", headers: authHeaders, body: JSON.stringify({ language: "en", title: `Production ${unique}`, content: "This production record must survive a graceful restart." }) });
  await request(baseUrl, "/api/progress/dashboard", { headers: { authorization: `Bearer ${token}`, origin: baseUrl } });
  const demo = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json", origin: baseUrl }, body: JSON.stringify({ email: "demo@tutrinhlanguage.local", password: "Demo123!" }) });
  if (demo.status !== 401) throw new Error("Production database unexpectedly contained demo credentials");

  await stopServer(server);
  server = await startServer(productionEnv, baseUrl);
  const login = await request(baseUrl, "/api/auth/login", { method: "POST", headers: { "content-type": "application/json", origin: baseUrl }, body: JSON.stringify({ email, password }) });
  const restartToken = login.body.data.token;
  const afterRestart = await request(baseUrl, "/api/vocabulary", { headers: { authorization: `Bearer ${restartToken}`, origin: baseUrl } });
  if (!afterRestart.body.data.some((item) => item.term === `durable-${unique}`)) throw new Error("Data did not persist across restart");

  const backupOutput = await run("node", ["scripts/db-backup.mjs"], productionEnv);
  const backupLine = backupOutput.trim().split("\n").findLast((line) => line.startsWith("{"));
  const backupPath = JSON.parse(backupLine).backupPath;
  await request(baseUrl, "/api/vocabulary", { method: "POST", headers: { authorization: `Bearer ${restartToken}`, "content-type": "application/json", origin: baseUrl }, body: JSON.stringify({ language: "en", term: `after-backup-${unique}`, meaningVi: "sau sao lưu", source: "MANUAL", metadata: {} }) });
  await stopServer(server);
  server = undefined;

  await run("node", ["scripts/db-restore.mjs", "--backup", backupPath, "--database", databasePath, "--confirm", "RESTORE"], productionEnv);
  server = await startServer(productionEnv, baseUrl);
  const restoredLogin = await request(baseUrl, "/api/auth/login", { method: "POST", headers: { "content-type": "application/json", origin: baseUrl }, body: JSON.stringify({ email, password }) });
  const restoredVocabulary = await request(baseUrl, "/api/vocabulary", { headers: { authorization: `Bearer ${restoredLogin.body.data.token}`, origin: baseUrl } });
  if (!restoredVocabulary.body.data.some((item) => item.term === `durable-${unique}`)) throw new Error("Restored snapshot lost pre-backup data");
  if (restoredVocabulary.body.data.some((item) => item.term === `after-backup-${unique}`)) throw new Error("Restore did not roll back post-backup mutation");

  console.log(JSON.stringify({ status: "ok", productionStart: true, staticServing: true, spaFallback: true, migrationRepeat: true, noDemoSeed: true, gracefulShutdown: true, persistenceRestart: true, backupRestore: true }));
} finally {
  if (server?.child && !server.child.killed) {
    try { await stopServer(server); } catch { server.child.kill("SIGKILL"); }
  }
  await rm(scratchDir, { recursive: true, force: true });
}
