import { chmod, copyFile, rm, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { backup, DatabaseSync } from "node:sqlite";

const value = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const backupArg = value("--backup");
const databaseArg = value("--database");
if (!backupArg || !databaseArg || value("--confirm") !== "RESTORE") {
  throw new Error("Usage: npm run db:restore -- --backup <file> --database <file> --confirm RESTORE");
}
const backupPath = resolve(backupArg);
const databasePath = resolve(databaseArg);
if (backupPath === databasePath) throw new Error("Backup and database paths must be different");
if (!existsSync(backupPath)) throw new Error("Selected backup does not exist");

const selected = new DatabaseSync(backupPath, { readOnly: true });
try {
  const result = selected.prepare("PRAGMA quick_check").get();
  if (!result || Object.values(result)[0] !== "ok") throw new Error("Selected backup failed integrity check");
} finally {
  selected.close();
}

let safetyBackup = null;
if (existsSync(databasePath)) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  safetyBackup = resolve(dirname(databasePath), `${databasePath.split("/").pop()}.pre-restore-${stamp}.bak`);
  const current = new DatabaseSync(databasePath);
  try { await backup(current, safetyBackup); }
  finally { current.close(); }
  await chmod(safetyBackup, 0o600);
}

const temporaryPath = `${databasePath}.restore-${process.pid}.tmp`;
await copyFile(backupPath, temporaryPath);
await chmod(temporaryPath, 0o600);
await rm(`${databasePath}-wal`, { force: true });
await rm(`${databasePath}-shm`, { force: true });
await rm(databasePath, { force: true });
await rename(temporaryPath, databasePath);

const restored = new DatabaseSync(databasePath, { readOnly: true });
try {
  const result = restored.prepare("PRAGMA quick_check").get();
  if (!result || Object.values(result)[0] !== "ok") throw new Error("Restored database failed integrity check");
} finally {
  restored.close();
}
console.log(JSON.stringify({ status: "ok", restoredFrom: backupPath, safetyBackup }));
