import { describe, expect, it, vi } from "vitest";
import {
  AiGateway,
  AiGatewayExhaustedError,
  AiProviderError,
  GeminiProvider,
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

describe("Gemini and Workers AI gateway fallback matrix", () => {
  it("A: uses a KV cache hit without calling Gemini or Workers AI", async () => {
    const cache = memoryCache(new Map([["customer-key", { term: "customer", meaningVi: "khách hàng" }]]));
    const gemini = vi.fn();
    const workers = vi.fn();
    const result = await new AiGateway([
      provider("gemini", gemini), provider("workers-ai", workers),
    ], cache).run({ ...request, cacheKey: "customer-key" }, validateCustomer);

    expect(result).toMatchObject({ provider: "cache", cacheHit: true, attempts: [] });
    expect(gemini).not.toHaveBeenCalled();
    expect(workers).not.toHaveBeenCalled();
  });

  it("B: uses Gemini on a KV miss without calling Workers AI", async () => {
    const gemini = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const workers = vi.fn();
    const result = await new AiGateway([
      provider("gemini", gemini), provider("workers-ai", workers),
    ]).run(request, validateCustomer);

    expect(result).toMatchObject({ provider: "gemini", fallbackCount: 0, cacheHit: false });
    expect(workers).not.toHaveBeenCalled();
  });

  it("C: falls back from Gemini quota exhaustion to Workers AI", async () => {
    const gemini = vi.fn().mockRejectedValue(new AiProviderError("gemini", "QUOTA_EXCEEDED", "quota"));
    const workers = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      provider("gemini", gemini), provider("workers-ai", workers),
    ]).run(request, validateCustomer);

    expect(result).toMatchObject({ provider: "workers-ai", fallbackCount: 1 });
    expect(workers).toHaveBeenCalledTimes(1);
  });

  it("D: falls back from Gemini timeout to Workers AI", async () => {
    const gemini = vi.fn().mockRejectedValue(new AiProviderError("gemini", "TIMEOUT", "timeout"));
    const workers = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      provider("gemini", gemini), provider("workers-ai", workers),
    ]).run(request, validateCustomer);

    expect(result).toMatchObject({ provider: "workers-ai", fallbackCount: 1 });
  });

  it("E: falls back after Gemini malformed structured output", async () => {
    const gemini = vi.fn().mockResolvedValue({ term: "customer" });
    const workers = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      provider("gemini", gemini), provider("workers-ai", workers),
    ]).run(request, validateCustomer);

    expect(result.provider).toBe("workers-ai");
    expect(result.attempts[0]).toMatchObject({ provider: "gemini", failure: "MALFORMED_RESPONSE" });
  });

  it("F: falls back from Gemini identity mismatch to Workers AI", async () => {
    const gemini = vi.fn().mockResolvedValue({ term: "car", meaningVi: "xe hơi" });
    const workers = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      provider("gemini", gemini), provider("workers-ai", workers),
    ]).run(request, validateCustomer);

    expect(result).toMatchObject({ provider: "workers-ai", value: { term: "customer" } });
    expect(result.attempts[0]).toMatchObject({ failure: "IDENTITY_MISMATCH" });
  });

  it("G: falls back from Gemini model unavailability to Workers AI", async () => {
    const gemini = vi.fn().mockRejectedValue(new AiProviderError("gemini", "MODEL_NOT_AVAILABLE", "unavailable"));
    const workers = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng" });
    const result = await new AiGateway([
      provider("gemini", gemini), provider("workers-ai", workers),
    ]).run(request, validateCustomer);

    expect(result).toMatchObject({ provider: "workers-ai", value: { term: "customer" } });
    expect(result.attempts[0]).toMatchObject({ provider: "gemini", failure: "MODEL_NOT_AVAILABLE" });
  });

  it("H: returns a controlled exhausted error when Gemini and Workers AI both fail", async () => {
    const gateway = new AiGateway([
      provider("gemini", vi.fn().mockRejectedValue(new AiProviderError("gemini", "QUOTA_EXCEEDED", "quota"))),
      provider("workers-ai", vi.fn().mockRejectedValue(new AiProviderError("workers-ai", "NETWORK_ERROR", "network"))),
    ]);

    await expect(gateway.run(request, validateCustomer)).rejects.toBeInstanceOf(AiGatewayExhaustedError);
  });
});

describe("Provider compatibility payloads", () => {
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

  it("records only safe Gemini HTTP status and machine code for provider failures", async () => {
    const geminiFetcher = vi.fn(async () => jsonResponse({ error: { status: "INVALID_ARGUMENT", message: "Invalid request schema" } }, 400)) as unknown as typeof fetch;

    await expect(new GeminiProvider({ apiKey: "test-key", model: "gemini-2.5-flash-lite", fetcher: geminiFetcher }).complete(request))
      .rejects.toMatchObject({ code: "VALIDATION_ERROR", details: { httpStatus: 400, upstreamCode: "INVALID_ARGUMENT" } });
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
    const namespace = kvNamespace(vi.fn().mockResolvedValue(JSON.stringify({ term: "customer", meaningVi: "khách hàng" })));
    const gemini = vi.fn();
    const result = await new AiGateway([provider("gemini", gemini)], createKvAiGatewayCache(namespace)).run({ ...request, cacheKey: "customer-key" }, validateCustomer);

    expect(result).toMatchObject({ provider: "cache", cacheHit: true });
    expect(gemini).not.toHaveBeenCalled();
    expect(namespace.put).not.toHaveBeenCalled();
  });

  it("KV_CACHE_STORES_VALIDATED_OUTPUT_ONLY and hydrates a separately validated cached value", async () => {
    const namespace = kvNamespace(vi.fn().mockResolvedValue(JSON.stringify("khách hàng")));
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
    const namespace = kvNamespace(vi.fn().mockResolvedValue("not valid JSON"));
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
