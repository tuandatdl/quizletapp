import { chmod, mkdir, readdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { backup, DatabaseSync } from "node:sqlite";

const databasePath = resolve(process.env.DATABASE_URL?.trim() || "./data/tu-trinh-language.db");
const backupDir = resolve(process.env.BACKUP_DIR?.trim() || "./backups");
if (!existsSync(databasePath)) throw new Error("Database file does not exist");
if (databasePath === backupDir || databasePath.startsWith(`${backupDir}/`)) throw new Error("BACKUP_DIR must not contain the live database");

await mkdir(backupDir, { recursive: true, mode: 0o700 });
await chmod(backupDir, 0o700);
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const suffix = randomBytes(3).toString("hex");
const backupPath = resolve(backupDir, `tu-trinh-language-${stamp}-${suffix}.db`);
const source = new DatabaseSync(databasePath);
try {
  await backup(source, backupPath);
} finally {
  source.close();
}
await chmod(backupPath, 0o600);
const check = new DatabaseSync(backupPath, { readOnly: true });
try {
  const result = check.prepare("PRAGMA quick_check").get();
  if (!result || Object.values(result)[0] !== "ok") throw new Error("Backup integrity check failed");
} finally {
  check.close();
}

let pruned = 0;
if (process.env.BACKUP_RETENTION_COUNT?.trim()) {
  const keep = Number(process.env.BACKUP_RETENTION_COUNT);
  if (!Number.isInteger(keep) || keep < 1) throw new Error("BACKUP_RETENTION_COUNT must be a positive integer");
  const entries = await readdir(backupDir);
  const candidates = await Promise.all(entries.filter((name) => /^tu-trinh-language-.*\.db$/.test(name)).map(async (name) => {
    const path = resolve(backupDir, name);
    return { path, modified: (await stat(path)).mtimeMs };
  }));
  candidates.sort((a, b) => b.modified - a.modified);
  for (const candidate of candidates.slice(keep)) {
    await rm(candidate.path);
    pruned += 1;
  }
}

console.log(JSON.stringify({ status: "ok", backupPath, pruned }));
