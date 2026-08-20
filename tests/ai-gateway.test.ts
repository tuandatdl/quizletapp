import { describe, expect, it, vi } from "vitest";
import {
  AiGateway,
  AiGatewayExhaustedError,
  AiProviderError,
  GeminiProvider,
  OpenAiProvider,
  KV_CACHE_TTL_SECONDS,
  createKvAiGatewayCache,
  gatewayCacheKey,
  toGeminiCompatibleSchema,
  type AiGatewayCache,
  type AiGatewayRequest,
  type AiProvider,
  type AiProviderName,
  type KvNamespaceBinding,
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

function kvNamespace(get: KvNamespaceBinding["get"], put = vi.fn(async () => undefined)): KvNamespaceBinding & { put: ReturnType<typeof vi.fn> } {
  return { get, put };
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
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

describe("Provider compatibility payloads", () => {
  it("OPENAI_GPT5_MINI_NO_TEMPERATURE and OPENAI_STRUCTURED_OUTPUT_PRESERVED", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => jsonResponse({ choices: [{ message: { content: '{"term":"customer","meaningVi":"khách hàng"}' } }] }));
    const schema = { type: "object", properties: { term: { type: "string" } }, required: ["term"], additionalProperties: false };
    await new OpenAiProvider({ apiKey: "test-key", model: "gpt-5-mini", fetcher: fetcher as unknown as typeof fetch }).complete({ ...request, schema });

    const init = fetcher.mock.calls[0]![1]!;
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body).not.toHaveProperty("temperature");
    expect(body).not.toHaveProperty("top_p");
    expect(body.response_format).toEqual({ type: "json_schema", json_schema: { name: "tutrinh_enrichment", strict: true, schema } });
  });

  it("GEMINI_CONST_TO_ENUM and GEMINI_SCHEMA_RECURSIVE_TRANSFORM", () => {
    const source = {
      type: "object",
      properties: {
        language: { type: "string", const: "en" },
        nested: { type: "array", items: { type: "object", properties: { language: { type: "string", const: "zh" } } } },
      },
    };
    expect(toGeminiCompatibleSchema(source)).toEqual({
      type: "object",
      properties: {
        language: { type: "string", enum: ["en"] },
        nested: { type: "array", items: { type: "object", properties: { language: { type: "string", enum: ["zh"] } } } },
      },
    });
  });

  it("GEMINI_SCHEMA_DOES_NOT_MUTATE_SOURCE and sends the compatible copy", async () => {
    const schema = { type: "object", properties: { language: { type: "string", const: "zh" } } };
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => jsonResponse({ candidates: [{ content: { parts: [{ text: '{"term":"customer","meaningVi":"khách hàng"}' }] } }] }));
    await new GeminiProvider({ apiKey: "test-key", model: "gemini-2.5-flash-lite", fetcher: fetcher as unknown as typeof fetch }).complete({ ...request, schema });

    expect(schema.properties.language).toEqual({ type: "string", const: "zh" });
    const init = fetcher.mock.calls[0]![1]!;
    const body = JSON.parse(init.body as string) as { generationConfig: { responseJsonSchema: unknown } };
    expect(body.generationConfig.responseJsonSchema).toEqual({ type: "object", properties: { language: { type: "string", enum: ["zh"] } } });
  });

  it("records only safe HTTP status and machine code for provider failures", async () => {
    const geminiFetcher = vi.fn(async () => jsonResponse({ error: { status: "INVALID_ARGUMENT", message: "Invalid request schema" } }, 400)) as unknown as typeof fetch;
    const openAiFetcher = vi.fn(async () => jsonResponse({ error: { type: "insufficient_quota", code: "insufficient_quota", message: "billing unavailable" } }, 429)) as unknown as typeof fetch;

    await expect(new GeminiProvider({ apiKey: "test-key", model: "gemini-2.5-flash-lite", fetcher: geminiFetcher }).complete(request))
      .rejects.toMatchObject({ code: "VALIDATION_ERROR", details: { httpStatus: 400, upstreamCode: "INVALID_ARGUMENT" } });
    await expect(new OpenAiProvider({ apiKey: "test-key", model: "gpt-5-mini", fetcher: openAiFetcher }).complete(request))
      .rejects.toMatchObject({ code: "QUOTA_EXCEEDED", details: { httpStatus: 429, upstreamCode: "insufficient_quota" } });
  });

  it("classifies Workers AI daily allocation exhaustion without logging its raw message", async () => {
    const gateway = new AiGateway([
      provider("workers-ai", vi.fn().mockRejectedValue(new Error("AiError: 4006: daily free allocation of neurons exhausted"))),
    ]);

    await expect(gateway.run(request, validateCustomer)).rejects.toMatchObject({
      attempts: [{ provider: "workers-ai", failure: "QUOTA_EXCEEDED", upstreamCode: "4006" }],
    });
  });
});

describe("Workers KV AI gateway cache", () => {
  it("KV_CACHE_MISS_CALLS_PROVIDER and KV_CACHE_TTL_7_DAYS", async () => {
    const namespace = kvNamespace(vi.fn().mockResolvedValue(null));
    const gemini = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([provider("gemini", gemini)], createKvAiGatewayCache(namespace)).run({ ...request, cacheKey: "customer-key" }, validateCustomer);

    expect(result).toMatchObject({ provider: "gemini", cacheHit: false });
    expect(gemini).toHaveBeenCalledTimes(1);
    expect(namespace.put).toHaveBeenCalledWith("customer-key", JSON.stringify({ term: "customer", meaningVi: "khách hàng" }), { expirationTtl: KV_CACHE_TTL_SECONDS });
    expect(KV_CACHE_TTL_SECONDS).toBe(604_800);
  });

  it("KV_CACHE_HIT_ZERO_PROVIDER_CALLS", async () => {
    const namespace = kvNamespace(vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" }));
    const gemini = vi.fn();
    const result = await new AiGateway([provider("gemini", gemini)], createKvAiGatewayCache(namespace)).run({ ...request, cacheKey: "customer-key" }, validateCustomer);

    expect(result).toMatchObject({ provider: "cache", cacheHit: true });
    expect(gemini).not.toHaveBeenCalled();
    expect(namespace.put).not.toHaveBeenCalled();
  });

  it("KV_CACHE_STORES_VALIDATED_OUTPUT_ONLY and hydrates a separately validated cached value", async () => {
    const namespace = kvNamespace(vi.fn().mockResolvedValue("khách hàng"));
    const gemini = vi.fn();
    const result = await new AiGateway([provider("gemini", gemini)], createKvAiGatewayCache(namespace)).run(
      { ...request, cacheKey: "customer-key" },
      (value) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Provider response must be an object.");
        const meaningVi = (value as { meaningVi?: unknown }).meaningVi;
        if (typeof meaningVi !== "string") throw new TypeError("Provider response is invalid.");
        return meaningVi;
      },
      (cached) => {
        if (typeof cached !== "string") throw new TypeError("Cached response is invalid.");
        return cached;
      },
    );

    expect(result).toMatchObject({ provider: "cache", cacheHit: true, value: "khách hàng" });
    expect(gemini).not.toHaveBeenCalled();
  });

  it("does not cache malformed provider output", async () => {
    const namespace = kvNamespace(vi.fn().mockResolvedValue(null));
    const gateway = new AiGateway([provider("gemini", vi.fn().mockResolvedValue({ term: "customer" }))], createKvAiGatewayCache(namespace));

    await expect(gateway.run({ ...request, cacheKey: "customer-key" }, validateCustomer)).rejects.toBeInstanceOf(AiGatewayExhaustedError);
    expect(namespace.put).not.toHaveBeenCalled();
  });

  it("KV_CORRUPTED_VALUE_IGNORED", async () => {
    const namespace = kvNamespace(vi.fn().mockResolvedValue({ malformed: true }));
    const gemini = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([provider("gemini", gemini)], createKvAiGatewayCache(namespace)).run({ ...request, cacheKey: "customer-key" }, validateCustomer);

    expect(result.provider).toBe("gemini");
    expect(gemini).toHaveBeenCalledTimes(1);
  });

  it("KV_READ_FAILURE_FAILS_OPEN", async () => {
    const namespace = kvNamespace(vi.fn().mockRejectedValue(new Error("KV unavailable")));
    const gemini = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([provider("gemini", gemini)], createKvAiGatewayCache(namespace)).run({ ...request, cacheKey: "customer-key" }, validateCustomer);

    expect(result.provider).toBe("gemini");
    expect(gemini).toHaveBeenCalledTimes(1);
  });

  it("KV_WRITE_FAILURE_FAILS_OPEN", async () => {
    const namespace = kvNamespace(vi.fn().mockResolvedValue(null), vi.fn().mockRejectedValue(new Error("KV unavailable")));
    const gemini = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([provider("gemini", gemini)], createKvAiGatewayCache(namespace)).run({ ...request, cacheKey: "customer-key" }, validateCustomer);

    expect(result).toMatchObject({ provider: "gemini", cacheHit: false });
    expect(gemini).toHaveBeenCalledTimes(1);
  });

  it("KV_KEY_CONTEXT_ISOLATION, KV_KEY_LANGUAGE_ISOLATION, and KV_KEY_TRANSLATION_ISOLATION", () => {
    const river = gatewayCacheKey({ version: "ai-gateway-v1", operation: "enrichment", language: "en", terms: ["bank"], contexts: [{ sentence: "They sat on the river bank." }] });
    const financial = gatewayCacheKey({ version: "ai-gateway-v1", operation: "enrichment", language: "en", terms: ["bank"], contexts: [{ sentence: "She deposited money in the bank." }] });
    const chinese = gatewayCacheKey({ version: "ai-gateway-v1", operation: "enrichment", language: "zh", terms: ["学习"] });
    const translation = gatewayCacheKey({ version: "ai-gateway-v1", operation: "translation", sourceLanguage: "en", targetLanguage: "vi", text: "bank" });

    expect(river).not.toBe(financial);
    expect(river).not.toBe(chinese);
    expect(river).not.toBe(translation);
  });
});
