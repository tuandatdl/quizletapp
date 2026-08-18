import { rm } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

const target = resolve("dist");
if (basename(target) !== "dist" || dirname(target) !== process.cwd()) {
  throw new Error(`Refusing to clean unexpected build path: ${target}`);
}
await rm(target, { recursive: true, force: true });
