import { ZodError } from "zod";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVICE_NOT_CONFIGURED"
  | "EXTERNAL_SERVICE_ERROR"
  | "PAYLOAD_TOO_LARGE"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number,
    public readonly details: Record<string, unknown> = {}
  ) {
    super(message);
  }
}

export const errors = {
  validation: (message: string, details: Record<string, unknown> = {}) => new AppError("VALIDATION_ERROR", message, 400, details),
  unauthorized: (message = "Authentication required") => new AppError("UNAUTHORIZED", message, 401),
  forbidden: (message = "Origin is not allowed") => new AppError("FORBIDDEN", message, 403),
  notFound: (resource: string) => new AppError("NOT_FOUND", `${resource} not found`, 404),
  conflict: (message: string, details: Record<string, unknown> = {}) => new AppError("CONFLICT", message, 409, details),
  rateLimited: () => new AppError("RATE_LIMITED", "Too many requests", 429),
  payloadTooLarge: () => new AppError("PAYLOAD_TOO_LARGE", "Request payload is too large", 413),
  unavailable: (message = "Service is not ready") => new AppError("SERVICE_UNAVAILABLE", message, 503),
  notConfigured: (service: string) => new AppError("SERVICE_NOT_CONFIGURED", `${service} is not configured`, 503, { service }),
  external: (service: string) => new AppError("EXTERNAL_SERVICE_ERROR", `${service} request failed`, 502, { service })
};

export function errorBody(error: unknown, exposeInternal = false): { error: { code: ErrorCode; message: string; details: Record<string, unknown> } } {
  if (error instanceof ZodError) {
    return { error: { code: "VALIDATION_ERROR", message: "Request validation failed", details: { issues: error.issues } } };
  }
  if (error instanceof AppError) {
    return { error: { code: error.code, message: error.message, details: error.details } };
  }
  return { error: { code: "INTERNAL_ERROR", message: exposeInternal && error instanceof Error ? error.message : "An unexpected error occurred", details: {} } };
}
