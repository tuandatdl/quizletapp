export type AiProviderName = "gemini" | "openai" | "workers-ai";
export type AiGatewaySource = AiProviderName | "cache";

export type AiFailureCode =
  | "BAD_REQUEST"
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "UPSTREAM_5XX"
  | "MALFORMED_RESPONSE"
  | "IDENTITY_MISMATCH"
  | "NOT_CONFIGURED"
  | "AUTH_ERROR"
  | "VALIDATION_ERROR"
  | "MODEL_NOT_AVAILABLE";

export interface AiBinding {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

export interface AiGatewayRequest {
  operation: "enrichment" | "translation";
  systemPrompt: string;
  userPrompt: string;
  schema: Record<string, unknown>;
  maxTokens: number;
  cacheKey?: string;
  workersModel: string;
}

export interface AiGatewayCache {
  get(key: string): Promise<unknown | undefined>;
  put(key: string, value: unknown): Promise<void>;
}

export interface KvNamespaceBinding {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options: { expirationTtl: number }): Promise<void>;
}

export interface AiProvider {
  readonly name: AiProviderName;
  isConfigured(): boolean;
  complete(request: AiGatewayRequest): Promise<unknown>;
  retryOnce?(request: AiGatewayRequest): Promise<unknown>;
}

export interface GatewayAttempt {
  provider: AiProviderName;
  failure?: AiFailureCode;
  latencyMs: number;
  httpStatus?: number;
  upstreamCode?: string;
}

export interface AiProviderFailureDetails {
  httpStatus?: number;
  upstreamCode?: string;
}

export interface AiGatewayResult<T> {
  value: T;
  provider: AiGatewaySource;
  fallbackCount: number;
  cacheHit: boolean;
  attempts: GatewayAttempt[];
}

export class AiProviderError extends Error {
  constructor(
    public readonly provider: AiProviderName,
    public readonly code: AiFailureCode,
    message: string,
    public readonly details: AiProviderFailureDetails = {},
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

export class AiGatewayExhaustedError extends Error {
  constructor(public readonly attempts: GatewayAttempt[]) {
    super("Không còn nhà cung cấp AI khả dụng.");
    this.name = "AiGatewayExhaustedError";
  }
}

type FetchLike = typeof fetch;

interface HttpProviderConfig {
  apiKey?: string;
  model?: string;
  fetcher?: FetchLike;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8_000;

function safeMessage(value: unknown): string {
  return value instanceof Error ? value.message.slice(0, 300) : "Upstream AI request failed";
}

function parseJson(value: string, provider: AiProviderName): unknown {
  try {
    return JSON.parse(value.trim().replace(/^```(?:json)?\s*/iu, "").replace(/\s*```$/u, ""));
  } catch {
    throw new AiProviderError(provider, "MALFORMED_RESPONSE", "AI trả về JSON không hợp lệ.");
  }
}

export function structuredPayload(value: unknown, provider: AiProviderName): unknown {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const result = value as Record<string, unknown>;
    if (typeof result.response === "string") return parseJson(result.response, provider);
    if (result.response && typeof result.response === "object") return result.response;
  }
  if (typeof value === "string") return parseJson(value, provider);
  return value;
}

function safeMachineCode(provider: AiProviderName, message: string): string | undefined {
  try {
    const value = JSON.parse(message);
    if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
    const error = (value as Record<string, unknown>).error;
    if (!error || typeof error !== "object" || Array.isArray(error)) return undefined;
    const details = error as Record<string, unknown>;
    const candidate = provider === "gemini" ? details.status ?? details.code : details.code ?? details.type;
    const code = typeof candidate === "string" || typeof candidate === "number" ? String(candidate) : undefined;
    return code && /^[A-Za-z0-9_.:-]{1,80}$/u.test(code) ? code : undefined;
  } catch {
    return undefined;
  }
}

function classifyHttpFailure(provider: AiProviderName, status: number, message: string): AiProviderError {
  const normalized = message.toLowerCase();
  const details = { httpStatus: status, upstreamCode: safeMachineCode(provider, message) };
  if (status === 401 || status === 403) return new AiProviderError(provider, "AUTH_ERROR", "AI provider authentication failed.", details);
  if (status === 429) {
    return new AiProviderError(provider, /quota|resource exhausted|billing/u.test(normalized) ? "QUOTA_EXCEEDED" : "RATE_LIMITED", "AI provider rate limit reached.", details);
  }
  if (status === 404 || /model.*(?:not found|unavailable)|model_not_found|unsupported.*model/iu.test(normalized)) {
    return new AiProviderError(provider, "MODEL_NOT_AVAILABLE", "AI provider model is unavailable.", details);
  }
  if (status === 400 || status === 422) {
    const code = /schema|validation|invalid[_ -]?(?:argument|parameter|request)/iu.test(normalized) ? "VALIDATION_ERROR" : "BAD_REQUEST";
    return new AiProviderError(provider, code, "AI provider rejected the request format.", details);
  }
  if (status >= 500) return new AiProviderError(provider, "UPSTREAM_5XX", "AI provider is temporarily unavailable.", details);
  return new AiProviderError(provider, "BAD_REQUEST", "AI provider rejected the request.", details);
}

function safeWorkersAiDetails(message: string): AiProviderFailureDetails {
  const code = message.match(/\bAiError:\s*(\d{3,5})\b/iu)?.[1];
  return code ? { upstreamCode: code } : {};
}

function classifyFailure(provider: AiProviderName, caught: unknown): AiProviderError {
  if (caught instanceof AiProviderError) return caught;
  if (caught instanceof DOMException && caught.name === "AbortError") return new AiProviderError(provider, "TIMEOUT", "AI provider request timed out.");
  const message = safeMessage(caught);
  const details = provider === "workers-ai" ? safeWorkersAiDetails(message) : {};
  if (/quota|allocation|neurons|resource exhausted|billing/iu.test(message)) return new AiProviderError(provider, "QUOTA_EXCEEDED", "AI provider quota is exhausted.", details);
  if (/timeout|abort/iu.test(message)) return new AiProviderError(provider, "TIMEOUT", "AI provider request timed out.");
  if (/identity|does not match input term|term mismatch/iu.test(message)) return new AiProviderError(provider, "IDENTITY_MISMATCH", "AI response did not preserve requested term identity.");
  if (/missing|required|schema|invalid output|malformed|json/iu.test(message)) return new AiProviderError(provider, "MALFORMED_RESPONSE", "AI response failed structured validation.");
  return new AiProviderError(provider, "NETWORK_ERROR", "AI provider network request failed.", details);
}

function canFallback(code: AiFailureCode): boolean {
  return ["AUTH_ERROR", "BAD_REQUEST", "MODEL_NOT_AVAILABLE", "QUOTA_EXCEEDED", "RATE_LIMITED", "TIMEOUT", "NETWORK_ERROR", "UPSTREAM_5XX", "MALFORMED_RESPONSE", "IDENTITY_MISMATCH", "VALIDATION_ERROR"].includes(code);
}

function canRetry(code: AiFailureCode): boolean {
  return ["TIMEOUT", "NETWORK_ERROR", "UPSTREAM_5XX"].includes(code);
}

async function fetchWithTimeout(fetcher: FetchLike, url: string, init: RequestInit, timeoutMs: number, provider: AiProviderName): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetcher(url, { ...init, signal: controller.signal });
  } catch (caught) {
    throw classifyFailure(provider, caught);
  } finally {
    clearTimeout(timer);
  }
}

async function responseJson(response: Response, provider: AiProviderName): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!response.ok) throw classifyHttpFailure(provider, response.status, text);
  const value = parseJson(text, provider);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AiProviderError(provider, "MALFORMED_RESPONSE", "AI provider returned an invalid response envelope.");
  }
  return value as Record<string, unknown>;
}

export function toGeminiCompatibleSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toGeminiCompatibleSchema);
  if (!value || typeof value !== "object") return value;
  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(source)) {
    if (key !== "const") result[key] = toGeminiCompatibleSchema(child);
  }
  if (Object.hasOwn(source, "const")) {
    const constant = toGeminiCompatibleSchema(source.const);
    if (Array.isArray(result.enum)) {
      result.enum = result.enum.filter((candidate) => JSON.stringify(candidate) === JSON.stringify(constant));
    } else {
      result.enum = [constant];
    }
  }
  return result;
}

function textFromGemini(value: Record<string, unknown>): string {
  const candidates = value.candidates;
  if (!Array.isArray(candidates) || !candidates[0] || typeof candidates[0] !== "object") throw new AiProviderError("gemini", "MALFORMED_RESPONSE", "Gemini returned no candidate.");
  const content = (candidates[0] as Record<string, unknown>).content;
  const parts = content && typeof content === "object" ? (content as Record<string, unknown>).parts : undefined;
  if (!Array.isArray(parts)) throw new AiProviderError("gemini", "MALFORMED_RESPONSE", "Gemini returned no content.");
  const text = parts.flatMap((part) => part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string" ? [(part as Record<string, string>).text] : []).join("");
  if (!text) throw new AiProviderError("gemini", "MALFORMED_RESPONSE", "Gemini returned empty content.");
  return text;
}

function textFromOpenAi(value: Record<string, unknown>): string {
  const choices = value.choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") throw new AiProviderError("openai", "MALFORMED_RESPONSE", "OpenAI returned no choice.");
  const message = (choices[0] as Record<string, unknown>).message;
  const content = message && typeof message === "object" ? (message as Record<string, unknown>).content : undefined;
  if (typeof content !== "string" || !content.trim()) throw new AiProviderError("openai", "MALFORMED_RESPONSE", "OpenAI returned empty content.");
  return content;
}

export class GeminiProvider implements AiProvider {
  readonly name = "gemini" as const;
  private readonly fetcher: FetchLike;
  private readonly timeoutMs: number;

  constructor(private readonly config: HttpProviderConfig) {
    this.fetcher = config.fetcher ?? fetch;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  isConfigured(): boolean {
    return Boolean(this.config.apiKey && this.config.model);
  }

  async complete(request: AiGatewayRequest): Promise<unknown> {
    if (!this.isConfigured()) throw new AiProviderError(this.name, "NOT_CONFIGURED", "Gemini is not configured.");
    try {
      const response = await fetchWithTimeout(
        this.fetcher,
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.config.model!)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": this.config.apiKey! },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: request.systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: request.userPrompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: request.maxTokens,
              responseMimeType: "application/json",
              responseJsonSchema: toGeminiCompatibleSchema(request.schema),
            },
          }),
        },
        this.timeoutMs,
        this.name,
      );
      return parseJson(textFromGemini(await responseJson(response, this.name)), this.name);
    } catch (caught) {
      throw classifyFailure(this.name, caught);
    }
  }

  async retryOnce(request: AiGatewayRequest): Promise<unknown> {
    return this.complete(request);
  }
}

export class OpenAiProvider implements AiProvider {
  readonly name = "openai" as const;
  private readonly fetcher: FetchLike;
  private readonly timeoutMs: number;

  constructor(private readonly config: HttpProviderConfig) {
    this.fetcher = config.fetcher ?? fetch;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  isConfigured(): boolean {
    return Boolean(this.config.apiKey && this.config.model);
  }

  async complete(request: AiGatewayRequest): Promise<unknown> {
    if (!this.isConfigured()) throw new AiProviderError(this.name, "NOT_CONFIGURED", "OpenAI is not configured.");
    try {
      const response = await fetchWithTimeout(
        this.fetcher,
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey!}` },
          body: JSON.stringify({
            model: this.config.model,
            max_completion_tokens: request.maxTokens,
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: request.userPrompt },
            ],
            response_format: { type: "json_schema", json_schema: { name: `tutrinh_${request.operation}`, strict: true, schema: request.schema } },
          }),
        },
        this.timeoutMs,
        this.name,
      );
      return parseJson(textFromOpenAi(await responseJson(response, this.name)), this.name);
    } catch (caught) {
      throw classifyFailure(this.name, caught);
    }
  }

  async retryOnce(request: AiGatewayRequest): Promise<unknown> {
    return this.complete(request);
  }
}

export class WorkersAiProvider implements AiProvider {
  readonly name = "workers-ai" as const;

  constructor(private readonly ai?: AiBinding) {}

  isConfigured(): boolean {
    return Boolean(this.ai);
  }

  async complete(request: AiGatewayRequest): Promise<unknown> {
    if (!this.ai) throw new AiProviderError(this.name, "NOT_CONFIGURED", "Workers AI is not configured.");
    try {
      return structuredPayload(await this.ai.run(request.workersModel, {
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        max_tokens: request.maxTokens,
        response_format: { type: "json_schema", json_schema: request.schema },
      }), this.name);
    } catch (caught) {
      throw classifyFailure(this.name, caught);
    }
  }

}

export class AiGateway {
  constructor(private readonly providers: AiProvider[], private readonly cache?: AiGatewayCache) {}

  private async writeCache(key: string, value: unknown): Promise<void> {
    if (!this.cache) return;
    try {
      await this.cache.put(key, value);
    } catch {
      console.warn(JSON.stringify({ event: "ai_gateway_cache_write_failed" }));
    }
  }

  async run<T>(request: AiGatewayRequest, validate: (value: unknown) => T, validateCached: (value: unknown) => T = validate): Promise<AiGatewayResult<T>> {
    if (request.cacheKey && this.cache) {
      let cached: unknown | undefined;
      try {
        cached = await this.cache.get(request.cacheKey);
      } catch {
        console.warn(JSON.stringify({ event: "ai_gateway_cache_read_failed" }));
      }
      if (cached !== undefined) {
        try {
          return { value: validateCached(cached), provider: "cache", fallbackCount: 0, cacheHit: true, attempts: [] };
        } catch {
          console.warn(JSON.stringify({ event: "ai_gateway_cache_value_invalid" }));
        }
      }
    }

    const attempts: GatewayAttempt[] = [];
    let fallbackCount = 0;
    for (const provider of this.providers) {
      if (!provider.isConfigured()) continue;
      const startedAt = Date.now();
      try {
        const value = validate(await provider.complete(request));
        attempts.push({ provider: provider.name, latencyMs: Date.now() - startedAt });
        if (request.cacheKey) await this.writeCache(request.cacheKey, value);
        return { value, provider: provider.name, fallbackCount, cacheHit: false, attempts };
      } catch (caught) {
        const failure = classifyFailure(provider.name, caught);
        attempts.push({ provider: provider.name, failure: failure.code, latencyMs: Date.now() - startedAt, ...failure.details });
        if (canRetry(failure.code) && provider.retryOnce) {
          const retryStartedAt = Date.now();
          try {
            const value = validate(await provider.retryOnce(request));
            attempts.push({ provider: provider.name, latencyMs: Date.now() - retryStartedAt });
            if (request.cacheKey) await this.writeCache(request.cacheKey, value);
            return { value, provider: provider.name, fallbackCount, cacheHit: false, attempts };
          } catch (retryCaught) {
            const retryFailure = classifyFailure(provider.name, retryCaught);
            attempts.push({ provider: provider.name, failure: retryFailure.code, latencyMs: Date.now() - retryStartedAt, ...retryFailure.details });
            if (!canFallback(retryFailure.code)) throw new AiGatewayExhaustedError(attempts);
          }
        } else if (!canFallback(failure.code)) {
          throw new AiGatewayExhaustedError(attempts);
        }
        fallbackCount += 1;
      }
    }
    throw new AiGatewayExhaustedError(attempts);
  }
}

export const KV_CACHE_TTL_SECONDS = 604_800;

export function createKvAiGatewayCache(namespace?: KvNamespaceBinding): AiGatewayCache | undefined {
  if (!namespace) return undefined;
  return {
    async get(key) {
      const value = await namespace.get(key);
      return value === null ? undefined : JSON.parse(value);
    },
    async put(key, value) {
      await namespace.put(key, JSON.stringify(value), { expirationTtl: KV_CACHE_TTL_SECONDS });
    },
  };
}

export function gatewayCacheKey(parts: Record<string, unknown>): string {
  return `ai-gateway-v1:${JSON.stringify(parts)}`;
}
