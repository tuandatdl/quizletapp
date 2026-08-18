import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import type { FastifyReply, FastifyRequest } from "fastify";

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

export function assertStaticBuild(staticDir: string): void {
  if (!existsSync(resolve(staticDir, "index.html"))) {
    throw new Error(`Frontend build is missing at ${staticDir}; run npm run build before production start`);
  }
}

export function sendStaticOrSpa(request: FastifyRequest, reply: FastifyReply, staticDir: string): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  let pathname: string;
  try { pathname = decodeURIComponent(new URL(request.url, "http://local").pathname); }
  catch { return false; }
  if (pathname.includes("\0")) return false;

  const root = resolve(staticDir);
  const requested = pathname === "/" ? resolve(root, "index.html") : resolve(root, `.${pathname}`);
  const insideRoot = requested === root || requested.startsWith(`${root}${sep}`);
  const exactFile = insideRoot && existsSync(requested) && statSync(requested).isFile();
  if (exactFile) {
    sendFile(request, reply, requested, pathname.startsWith("/assets/"));
    return true;
  }
  if (extname(pathname)) return false;
  const indexPath = resolve(root, "index.html");
  if (!existsSync(indexPath)) return false;
  sendFile(request, reply, indexPath, false);
  return true;
}

function sendFile(request: FastifyRequest, reply: FastifyReply, path: string, immutable: boolean): void {
  const size = statSync(path).size;
  reply.type(contentTypes[extname(path).toLowerCase()] || "application/octet-stream");
  reply.header("content-length", String(size));
  reply.header("cache-control", immutable ? "public, max-age=31536000, immutable" : "no-cache");
  if (request.method === "HEAD") reply.send();
  else reply.send(createReadStream(path));
}
