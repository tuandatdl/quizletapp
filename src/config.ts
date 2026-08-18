import { isAbsolute, resolve } from "node:path";

export interface AppConfig {
  appEnv: "development" | "test" | "production";
  databaseUrl: string;
  host: string;
  port: number;
  sessionTtlDays: number;
  appOrigin: string | null;
  staticDir: string;
  trustProxy: boolean;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
  bodyLimitBytes: number;
  audioBodyLimitBytes: number;
  generalRateLimit: number;
  authRateLimit: number;
  providerRateLimit: number;
  rateLimitWindowMs: number;
  shutdownTimeoutMs: number;
  databaseBusyTimeoutMs: number;
  allowDemoSeed: boolean;
  translationConfigured: boolean;
  ttsConfigured: boolean;
  pronunciationConfigured: boolean;
  vocabularyEnrichmentConfigured: boolean;
}

function positiveNumber(value: string | undefined, fallback: number, name: string, integer = false): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0 || (integer && !Number.isInteger(parsed))) {
    throw new Error(`${name} must be a positive${integer ? " integer" : " number"}`);
  }
  return parsed;
}

function booleanValue(value: string | undefined, fallback: boolean, name: string): boolean {
  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be true or false`);
}

function environment(env: NodeJS.ProcessEnv): AppConfig["appEnv"] {
  const value = env.NODE_ENV ?? env.APP_ENV ?? "development";
  if (value !== "development" && value !== "test" && value !== "production") {
    throw new Error("NODE_ENV/APP_ENV must be development, test, or production");
  }
  if (env.NODE_ENV && env.APP_ENV && env.NODE_ENV !== env.APP_ENV) {
    throw new Error("NODE_ENV and APP_ENV must match when both are set");
  }
  return value;
}

function origin(value: string | undefined, required: boolean): string | null {
  if (!value?.trim()) {
    if (required) throw new Error("APP_ORIGIN is required in production");
    return null;
  }
  let parsed: URL;
  try { parsed = new URL(value); }
  catch { throw new Error("APP_ORIGIN must be a valid absolute http(s) origin"); }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== value.replace(/\/$/, "")) {
    throw new Error("APP_ORIGIN must contain only scheme, host, and optional port");
  }
  return parsed.origin;
}

function logLevel(value: string | undefined): AppConfig["logLevel"] {
  const level = value ?? "info";
  if (!["fatal", "error", "warn", "info", "debug", "trace", "silent"].includes(level)) {
    throw new Error("LOG_LEVEL is invalid");
  }
  return level as AppConfig["logLevel"];
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const appEnv = environment(env);
  const rawDatabaseUrl = env.DATABASE_URL?.trim();
  if (appEnv === "production" && (!rawDatabaseUrl || rawDatabaseUrl === ":memory:")) {
    throw new Error("DATABASE_URL must be a persistent database path in production");
  }
  if (appEnv === "production" && rawDatabaseUrl && !isAbsolute(rawDatabaseUrl)) {
    throw new Error("DATABASE_URL must be an absolute path in production");
  }
  const databaseUrl = rawDatabaseUrl === ":memory:" ? ":memory:" : resolve(rawDatabaseUrl || "./data/tu-trinh-language.db");
  const port = positiveNumber(env.PORT, 3000, "PORT", true);
  if (port > 65_535) throw new Error("PORT must be at most 65535");
  return {
    appEnv,
    databaseUrl,
    host: env.HOST?.trim() || (appEnv === "production" ? "0.0.0.0" : "127.0.0.1"),
    port,
    sessionTtlDays: positiveNumber(env.SESSION_TTL_DAYS, 30, "SESSION_TTL_DAYS"),
    appOrigin: origin(env.APP_ORIGIN, appEnv === "production"),
    staticDir: resolve(env.STATIC_DIR?.trim() || "./dist/client"),
    trustProxy: booleanValue(env.TRUST_PROXY, false, "TRUST_PROXY"),
    logLevel: logLevel(env.LOG_LEVEL),
    bodyLimitBytes: positiveNumber(env.BODY_LIMIT_BYTES, 1_000_000, "BODY_LIMIT_BYTES", true),
    audioBodyLimitBytes: positiveNumber(env.AUDIO_BODY_LIMIT_BYTES, 16_000_000, "AUDIO_BODY_LIMIT_BYTES", true),
    generalRateLimit: positiveNumber(env.GENERAL_RATE_LIMIT, appEnv === "development" ? 1_000 : 300, "GENERAL_RATE_LIMIT", true),
    authRateLimit: positiveNumber(env.AUTH_RATE_LIMIT, appEnv === "development" ? 100 : 10, "AUTH_RATE_LIMIT", true),
    providerRateLimit: positiveNumber(env.PROVIDER_RATE_LIMIT, appEnv === "development" ? 300 : 30, "PROVIDER_RATE_LIMIT", true),
    rateLimitWindowMs: positiveNumber(env.RATE_LIMIT_WINDOW_MS, 60_000, "RATE_LIMIT_WINDOW_MS", true),
    shutdownTimeoutMs: positiveNumber(env.SHUTDOWN_TIMEOUT_MS, 10_000, "SHUTDOWN_TIMEOUT_MS", true),
    databaseBusyTimeoutMs: positiveNumber(env.DATABASE_BUSY_TIMEOUT_MS, 5_000, "DATABASE_BUSY_TIMEOUT_MS", true),
    allowDemoSeed: booleanValue(env.ALLOW_DEMO_SEED, false, "ALLOW_DEMO_SEED"),
    translationConfigured: Boolean(env.TRANSLATION_PROVIDER && env.TRANSLATION_API_KEY),
    ttsConfigured: Boolean(env.TTS_PROVIDER && env.TTS_API_KEY),
    pronunciationConfigured: Boolean(env.PRONUNCIATION_PROVIDER && env.PRONUNCIATION_API_KEY),
    vocabularyEnrichmentConfigured: Boolean(env.VOCABULARY_ENRICHMENT_PROVIDER && env.VOCABULARY_ENRICHMENT_API_KEY)
  };
}
