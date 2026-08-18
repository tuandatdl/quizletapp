import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppConfig } from "../config.js";
import { errors } from "../shared/errors.js";

const developmentOrigins = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173"
]);

export function enforceOrigin(request: FastifyRequest, reply: FastifyReply, config: AppConfig): void {
  const requestOrigin = request.headers.origin;
  if (!requestOrigin) return;
  const allowed = requestOrigin === config.appOrigin || (config.appEnv !== "production" && developmentOrigins.has(requestOrigin));
  if (!allowed) throw errors.forbidden();
  reply.header("access-control-allow-origin", requestOrigin);
  reply.header("vary", "Origin");
  reply.header("access-control-allow-methods", "GET,HEAD,POST,PATCH,PUT,DELETE,OPTIONS");
  reply.header("access-control-allow-headers", "Authorization,Content-Type,X-Request-Id");
  reply.header("access-control-max-age", "600");
}

export function applySecurityHeaders(request: FastifyRequest, reply: FastifyReply, config: AppConfig): void {
  reply.header("x-content-type-options", "nosniff");
  reply.header("x-frame-options", "DENY");
  reply.header("referrer-policy", "strict-origin-when-cross-origin");
  reply.header("permissions-policy", "microphone=(self), camera=(), geolocation=()");
  reply.header("content-security-policy", [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob: https:",
    "connect-src 'self'"
  ].join("; "));
  if (config.appEnv === "production" && config.appOrigin?.startsWith("https://")) {
    reply.header("strict-transport-security", "max-age=31536000; includeSubDomains");
  }
  if (request.url.startsWith("/api/") || request.url === "/health" || request.url === "/ready") {
    reply.header("cache-control", "no-store");
  }
  reply.header("x-request-id", request.id);
}
