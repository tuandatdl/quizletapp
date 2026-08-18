import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";

const run = (command, args, env) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd: process.cwd(), env, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  child.on("error", reject);
  child.on("exit", (code) => code === 0 ? resolve(output) : reject(new Error(`${command} ${args.join(" ")} failed (${code})\n${output}`)));
});

const availablePort = () => new Promise((resolve, reject) => {
  const socket = createServer();
  socket.on("error", reject);
  socket.listen(0, "127.0.0.1", () => {
    const address = socket.address();
    const port = typeof address === "object" && address ? address.port : 0;
    socket.close(() => resolve(port));
  });
});

const waitForHealth = async (baseUrl) => {
  let lastError;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not become healthy: ${String(lastError)}`);
};

const stopServer = async (child) => {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, "exit");
  child.kill("SIGTERM");
  const [code, signal] = await Promise.race([
    exited,
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error("Fresh smoke server shutdown timed out")), 12_000);
      timer.unref();
    }),
  ]);
  if (code !== 0 || signal) throw new Error(`Fresh smoke server did not stop cleanly: code=${code} signal=${signal}`);
};

const scratchDir = await mkdtemp(join(tmpdir(), "tu-trinh-fresh-"));
const databasePath = join(scratchDir, "fresh.db");
const port = await availablePort();
const testEnv = { ...process.env, APP_ENV: "test", DATABASE_URL: databasePath, HOST: "127.0.0.1", PORT: String(port) };
let server;

try {
  await run("npm", ["run", "db:migrate"], testEnv);
  await run("npm", ["run", "db:seed"], testEnv);
  server = spawn("node", ["dist/src/server.js"], { cwd: process.cwd(), env: testEnv, stdio: ["ignore", "pipe", "pipe"] });
  let serverOutput = "";
  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });
  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForHealth(baseUrl);

  const login = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "demo@tutrinhlanguage.local", password: "Demo123!" }) });
  if (!login.ok) throw new Error(`Demo login failed: ${login.status} ${await login.text()}`);
  const loginBody = await login.json();
  const headers = { authorization: `Bearer ${loginBody.data.token}` };
  const [dashboardResponse, vocabularyResponse, readingsResponse] = await Promise.all([
    fetch(`${baseUrl}/api/progress/dashboard`, { headers }),
    fetch(`${baseUrl}/api/vocabulary`, { headers }),
    fetch(`${baseUrl}/api/readings`, { headers }),
  ]);
  if (![dashboardResponse, vocabularyResponse, readingsResponse].every((response) => response.ok)) throw new Error("One or more authenticated smoke endpoints failed");
  const dashboard = await dashboardResponse.json();
  const vocabulary = await vocabularyResponse.json();
  const readings = await readingsResponse.json();
  if (vocabulary.data.length !== 4 || readings.data.length !== 2) throw new Error(`Unexpected seed counts: vocabulary=${vocabulary.data.length}, readings=${readings.data.length}`);
  if (dashboard.data.languages.en.totalWords !== 2 || dashboard.data.languages.zh.totalWords !== 2) throw new Error("Dashboard seed aggregation mismatch");
  console.log(JSON.stringify({ status: "ok", migration: true, seed: true, productionStart: true, demoLogin: true, vocabulary: vocabulary.data.length, readings: readings.data.length }));
} finally {
  if (server) await stopServer(server);
  await rm(scratchDir, { recursive: true, force: true });
}
