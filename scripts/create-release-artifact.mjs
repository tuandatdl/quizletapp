import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8"));
const required = ["dist/src/server.js", "dist/client/index.html", "migrations", "package.json", "package-lock.json"];
for (const path of required) if (!existsSync(resolve(path))) throw new Error(`Release input is missing: ${path}`);

const releaseDir = resolve("release");
await mkdir(releaseDir, { recursive: true });
const stagingRoot = await mkdtemp(join(tmpdir(), "tu-trinh-release-"));
const staging = join(stagingRoot, "tu-trinh-language");
await mkdir(staging);
const entries = [
  "dist",
  "migrations",
  "scripts/db-backup.mjs",
  "scripts/db-restore.mjs",
  "package.json",
  "package-lock.json",
  ".env.example",
  "README.md",
  "docs/DEPLOYMENT.md",
  "docs/PRODUCTION_CHECKLIST.md",
  "docs/RELEASE_NOTES.md"
];
try {
  for (const entry of entries) {
    if (!existsSync(resolve(entry))) throw new Error(`Release input is missing: ${entry}`);
    const destination = join(staging, entry);
    await mkdir(resolve(destination, ".."), { recursive: true });
    await cp(resolve(entry), destination, { recursive: true });
  }
  const stagedPackagePath = join(staging, "package.json");
  const stagedPackage = JSON.parse(await readFile(stagedPackagePath, "utf8"));
  stagedPackage.scripts = {
    start: "node dist/src/server.js",
    "db:migrate": "node dist/src/db/migrate.js",
    "db:migrate:production": "node dist/src/db/migrate.js",
    "db:backup": "node scripts/db-backup.mjs",
    "db:restore": "node scripts/db-restore.mjs"
  };
  await writeFile(stagedPackagePath, `${JSON.stringify(stagedPackage, null, 2)}\n`);
  const artifact = resolve(releaseDir, `tu-trinh-language-${packageJson.version}.tgz`);
  await new Promise((resolveTar, reject) => {
    const child = spawn("tar", ["-czf", artifact, "-C", stagingRoot, basename(staging)], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolveTar() : reject(new Error(`tar exited with ${code}`)));
  });
  const checksum = createHash("sha256").update(await readFile(artifact)).digest("hex");
  await writeFile(`${artifact}.sha256`, `${checksum}  ${basename(artifact)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ status: "ok", artifact, sha256: checksum }));
} finally {
  await rm(stagingRoot, { recursive: true, force: true });
}
