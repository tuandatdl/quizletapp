import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppConfig } from "../config.js";
import { errors } from "../shared/errors.js";

interface RateRecord { count: number; resetAt: number }

export class RequestRateLimiter {
  private readonly records = new Map<string, RateRecord>();

  constructor(private readonly config: AppConfig) {}

  check(request: FastifyRequest, reply: FastifyReply): void {
    const route = request.routeOptions.url || request.url.split("?", 1)[0] || "unknown";
    if (!route.startsWith("/api/")) return;
    const { bucket, limit } = this.policy(route);
    const key = `${bucket}:${request.ip}`;
    const now = Date.now();
    let record = this.records.get(key);
    if (!record || record.resetAt <= now) {
      record = { count: 0, resetAt: now + this.config.rateLimitWindowMs };
      this.records.set(key, record);
    }
    record.count += 1;
    reply.header("x-ratelimit-limit", String(limit));
    reply.header("x-ratelimit-remaining", String(Math.max(0, limit - record.count)));
    reply.header("x-ratelimit-reset", String(Math.ceil(record.resetAt / 1000)));
    if (record.count > limit) {
      reply.header("retry-after", String(Math.max(1, Math.ceil((record.resetAt - now) / 1000))));
      throw errors.rateLimited();
    }
    if (this.records.size > 5_000) this.cleanup(now);
  }

  private policy(route: string): { bucket: string; limit: number } {
    if (route === "/api/auth/login" || route === "/api/auth/register") {
      return { bucket: "auth", limit: this.config.authRateLimit };
    }
    if (route.includes("/translate") || route === "/api/tts" || route === "/api/pronunciation/assess" || route === "/api/vocabulary/bulk-preview") {
      return { bucket: "provider", limit: this.config.providerRateLimit };
    }
    return { bucket: "api", limit: this.config.generalRateLimit };
  }

  private cleanup(now: number): void {
    for (const [key, record] of this.records) if (record.resetAt <= now) this.records.delete(key);
  }
}
