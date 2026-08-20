import { describe, expect, it, vi } from "vitest";
import {
  AiGateway,
  AiGatewayExhaustedError,
  AiProviderError,
  type AiGatewayCache,
  type AiGatewayRequest,
  type AiProvider,
  type AiProviderName,
} from "../cloudflare/worker/src/aiGateway.js";

const request: AiGatewayRequest = {
  operation: "enrichment",
  systemPrompt: "Return JSON only.",
  userPrompt: "customer",
  schema: { type: "object" },
  maxTokens: 100,
  workersModel: "test-workers-model",
};

function provider(name: AiProviderName, complete: (...args: any[]) => Promise<unknown>, configured = true): AiProvider {
  return { name, isConfigured: () => configured, complete: (gatewayRequest) => complete(gatewayRequest) };
}

function validateCustomer(value: unknown): { term: string; meaningVi: string } {
  if (!value || typeof value !== "object") throw new TypeError("AI output is invalid.");
  const item = value as { term?: unknown; meaningVi?: unknown };
  if (item.term !== "customer") throw new TypeError("AI vocabulary item does not match input term.");
  if (typeof item.meaningVi !== "string") throw new TypeError("AI output is missing required fields.");
  return { term: item.term, meaningVi: item.meaningVi };
}

function memoryCache(initial = new Map<string, unknown>()): AiGatewayCache {
  return {
    get: async (key) => initial.get(key),
    put: async (key, value) => { initial.set(key, value); },
  };
}

describe("Multi-provider AI gateway fallback matrix", () => {
  it("A: uses Gemini success without calling fallback providers", async () => {
    const gemini = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const openai = vi.fn();
    const workers = vi.fn();
    const result = await new AiGateway([
      provider("gemini", gemini), provider("openai", openai), provider("workers-ai", workers),
    ]).run(request, validateCustomer);

    expect(result).toMatchObject({ provider: "gemini", fallbackCount: 0, cacheHit: false });
    expect(openai).not.toHaveBeenCalled();
    expect(workers).not.toHaveBeenCalled();
  });

  it("B: falls back from Gemini 429/rate limit to OpenAI", async () => {
    const gemini = vi.fn().mockRejectedValue(new AiProviderError("gemini", "RATE_LIMITED", "429"));
    const openai = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const workers = vi.fn();
    const result = await new AiGateway([
      provider("gemini", gemini), provider("openai", openai), provider("workers-ai", workers),
    ]).run(request, validateCustomer);

    expect(result).toMatchObject({ provider: "openai", fallbackCount: 1 });
    expect(workers).not.toHaveBeenCalled();
  });

  it("C: falls back Gemini quota -> OpenAI quota -> Workers AI", async () => {
    const gemini = vi.fn().mockRejectedValue(new AiProviderError("gemini", "QUOTA_EXCEEDED", "quota"));
    const openai = vi.fn().mockRejectedValue(new AiProviderError("openai", "QUOTA_EXCEEDED", "quota"));
    const workers = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      provider("gemini", gemini), provider("openai", openai), provider("workers-ai", workers),
    ]).run(request, validateCustomer);

    expect(result).toMatchObject({ provider: "workers-ai", fallbackCount: 2 });
  });

  it("D: returns a controlled exhausted error when all providers fail", async () => {
    const gateway = new AiGateway([
      provider("gemini", vi.fn().mockRejectedValue(new AiProviderError("gemini", "QUOTA_EXCEEDED", "quota"))),
      provider("openai", vi.fn().mockRejectedValue(new AiProviderError("openai", "UPSTREAM_5XX", "500"))),
      provider("workers-ai", vi.fn().mockRejectedValue(new AiProviderError("workers-ai", "NETWORK_ERROR", "network"))),
    ]);

    await expect(gateway.run(request, validateCustomer)).rejects.toBeInstanceOf(AiGatewayExhaustedError);
  });

  it("E: falls back after Gemini malformed structured output", async () => {
    const gemini = vi.fn().mockResolvedValue({ term: "customer" });
    const openai = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      provider("gemini", gemini), provider("openai", openai), provider("workers-ai", vi.fn()),
    ]).run(request, validateCustomer);

    expect(result.provider).toBe("openai");
    expect(result.attempts[0]).toMatchObject({ provider: "gemini", failure: "MALFORMED_RESPONSE" });
  });

  it("F: rejects a Gemini wrong-term response and falls back by normalized identity", async () => {
    const gemini = vi.fn().mockResolvedValue({ term: "car", meaningVi: "xe hơi" });
    const openai = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      provider("gemini", gemini), provider("openai", openai), provider("workers-ai", vi.fn()),
    ]).run(request, validateCustomer);

    expect(result).toMatchObject({ provider: "openai", value: { term: "customer" } });
    expect(result.attempts[0]).toMatchObject({ failure: "IDENTITY_MISMATCH" });
  });

  it("G: rejects an OpenAI wrong-term response and falls back to Workers AI", async () => {
    const gemini = vi.fn().mockRejectedValue(new AiProviderError("gemini", "RATE_LIMITED", "429"));
    const openai = vi.fn().mockResolvedValue({ term: "go", meaningVi: "đi" });
    const workers = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      provider("gemini", gemini), provider("openai", openai), provider("workers-ai", workers),
    ]).run(request, validateCustomer);

    expect(result).toMatchObject({ provider: "workers-ai", value: { term: "customer" } });
    expect(result.attempts[1]).toMatchObject({ provider: "openai", failure: "IDENTITY_MISMATCH" });
  });

  it("H: treats a Gemini timeout as eligible for fallback", async () => {
    const gemini = vi.fn().mockRejectedValue(new AiProviderError("gemini", "TIMEOUT", "timeout"));
    const openai = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      { ...provider("gemini", gemini), retryOnce: gemini }, provider("openai", openai), provider("workers-ai", vi.fn()),
    ]).run(request, validateCustomer);

    expect(result.provider).toBe("openai");
    expect(gemini).toHaveBeenCalledTimes(2);
  });

  it("I: skips providers that are not configured", async () => {
    const gemini = vi.fn();
    const openai = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      provider("gemini", gemini, false), provider("openai", openai), provider("workers-ai", vi.fn()),
    ]).run(request, validateCustomer);

    expect(result.provider).toBe("openai");
    expect(gemini).not.toHaveBeenCalled();
  });

  it("J: validates a cache hit and makes zero provider calls", async () => {
    const cache = memoryCache(new Map([["customer-key", { term: "customer", meaningVi: "khách hàng" }]]));
    const gemini = vi.fn();
    const result = await new AiGateway([
      provider("gemini", gemini), provider("openai", vi.fn()), provider("workers-ai", vi.fn()),
    ], cache).run({ ...request, cacheKey: "customer-key" }, validateCustomer);

    expect(result).toMatchObject({ provider: "cache", cacheHit: true, value: { term: "customer" } });
    expect(gemini).not.toHaveBeenCalled();
  });
});
