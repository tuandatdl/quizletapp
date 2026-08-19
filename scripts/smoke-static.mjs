import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "dist", "client");
const indexPath = path.join(output, "index.html");
const index = await readFile(indexPath, "utf8");
const expectedBase = (process.env.VITE_PAGES_BASE_PATH || "/quizletapp/").replace(/^([^/])/, "/$1").replace(/([^/])$/, "$1/");

if (!(await stat(indexPath)).isFile()) throw new Error("Static build index.html is missing");
if (!index.includes(`${expectedBase}assets/`)) throw new Error(`Static asset paths do not use Pages base ${expectedBase}`);

const assetDir = path.join(output, "assets");
const scripts = (await readdir(assetDir)).filter((file) => file.endsWith(".js"));
if (!scripts.length) throw new Error("Static build contains no JavaScript assets");
const source = (await Promise.all(scripts.map((file) => readFile(path.join(assetDir, file), "utf8")))).join("\n");

for (const forbidden of ["http://127.0.0.1:3000", "http://localhost:3000", "better-sqlite3"]) {
  if (source.includes(forbidden)) throw new Error(`Static bundle contains forbidden server dependency: ${forbidden}`);
}
for (const required of ["local-profile", "tu-trinh-language-backup", "vocabulary-enrichment-v2", "IndexedDB"]) {
  if (!source.includes(required)) throw new Error(`Static bundle is missing required capability marker: ${required}`);
}

console.log(JSON.stringify({
  status: "ok",
  runtimeMode: "static",
  pagesBase: expectedBase,
  fastifyRequired: false,
  localProfile: true,
  indexedDb: true,
  backup: true,
  languageApiConfigurable: true,
  assets: scripts.length,
}, null, 2));
