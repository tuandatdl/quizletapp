export type AiProviderName = "gemini" | "openai" | "workers-ai";
export type AiGatewaySource = AiProviderName | "cache";

export type AiFailureCode =
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "UPSTREAM_5XX"
  | "MALFORMED_RESPONSE"
  | "IDENTITY_MISMATCH"
  | "NOT_CONFIGURED"
  | "AUTH_ERROR"
  | "VALIDATION_ERROR";

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

function classifyHttpFailure(provider: AiProviderName, status: number, message: string): AiProviderError {
  const normalized = message.toLowerCase();
  if (status === 401 || status === 403) return new AiProviderError(provider, "AUTH_ERROR", "AI provider authentication failed.");
  if (status === 429) {
    return new AiProviderError(provider, /quota|resource exhausted|billing/u.test(normalized) ? "QUOTA_EXCEEDED" : "RATE_LIMITED", "AI provider rate limit reached.");
  }
  if (status >= 500) return new AiProviderError(provider, "UPSTREAM_5XX", "AI provider is temporarily unavailable.");
  return new AiProviderError(provider, "MALFORMED_RESPONSE", "AI provider rejected the request.");
}

function classifyFailure(provider: AiProviderName, caught: unknown): AiProviderError {
  if (caught instanceof AiProviderError) return caught;
  if (caught instanceof DOMException && caught.name === "AbortError") return new AiProviderError(provider, "TIMEOUT", "AI provider request timed out.");
  const message = safeMessage(caught);
  if (/timeout|abort/iu.test(message)) return new AiProviderError(provider, "TIMEOUT", "AI provider request timed out.");
  if (/identity|does not match input term|term mismatch/iu.test(message)) return new AiProviderError(provider, "IDENTITY_MISMATCH", "AI response did not preserve requested term identity.");
  if (/missing|required|schema|invalid output|malformed|json/iu.test(message)) return new AiProviderError(provider, "MALFORMED_RESPONSE", "AI response failed structured validation.");
  return new AiProviderError(provider, "NETWORK_ERROR", "AI provider network request failed.");
}

function canFallback(code: AiFailureCode): boolean {
  return ["QUOTA_EXCEEDED", "RATE_LIMITED", "TIMEOUT", "NETWORK_ERROR", "UPSTREAM_5XX", "MALFORMED_RESPONSE", "IDENTITY_MISMATCH", "VALIDATION_ERROR"].includes(code);
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
              responseJsonSchema: request.schema,
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
            temperature: 0,
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

  async run<T>(request: AiGatewayRequest, validate: (value: unknown) => T): Promise<AiGatewayResult<T>> {
    if (request.cacheKey && this.cache) {
      try {
        const cached = await this.cache.get(request.cacheKey);
        if (cached !== undefined) {
          return { value: validate(cached), provider: "cache", fallbackCount: 0, cacheHit: true, attempts: [] };
        }
      } catch {
        // Ignore corrupted/missing cache entries; provider validation remains authoritative.
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
        if (request.cacheKey && this.cache) await this.cache.put(request.cacheKey, value);
        return { value, provider: provider.name, fallbackCount, cacheHit: false, attempts };
      } catch (caught) {
        const failure = classifyFailure(provider.name, caught);
        attempts.push({ provider: provider.name, failure: failure.code, latencyMs: Date.now() - startedAt });
        if (canRetry(failure.code) && provider.retryOnce) {
          const retryStartedAt = Date.now();
          try {
            const value = validate(await provider.retryOnce(request));
            attempts.push({ provider: provider.name, latencyMs: Date.now() - retryStartedAt });
            if (request.cacheKey && this.cache) await this.cache.put(request.cacheKey, value);
            return { value, provider: provider.name, fallbackCount, cacheHit: false, attempts };
          } catch (retryCaught) {
            const retryFailure = classifyFailure(provider.name, retryCaught);
            attempts.push({ provider: provider.name, failure: retryFailure.code, latencyMs: Date.now() - retryStartedAt });
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

export function createWorkerCache(): AiGatewayCache | undefined {
  const cache = (globalThis as unknown as { caches?: { default?: { match(request: Request): Promise<Response | undefined>; put(request: Request, response: Response): Promise<void> } } }).caches?.default;
  if (!cache) return undefined;
  const requestFor = (key: string) => new Request(`https://tutrinh-ai-cache.invalid/${encodeURIComponent(key)}`);
  return {
    async get(key) {
      const response = await cache.match(requestFor(key));
      return response ? response.json() : undefined;
    },
    async put(key, value) {
      await cache.put(requestFor(key), new Response(JSON.stringify(value), { headers: { "Cache-Control": "public, max-age=604800", "Content-Type": "application/json" } }));
    },
  };
}

export function gatewayCacheKey(parts: Record<string, unknown>): string {
  return `ai-gateway-v1:${JSON.stringify(parts)}`;
}
