import type { ApiResponse } from "../types/api";
import { buildRequestHeaders } from "../../shared/http";
import { isStaticRuntime } from "../runtime/runtime";
import { getStaticApiRouter } from "../static/staticApiRouter";

const TOKEN_KEY = "tutrinh_token";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: any;

  constructor(code: string, message: string, status: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

export function getFriendlyErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "SERVICE_NOT_CONFIGURED":
        return error.message || "Tính năng này hiện chưa được cấu hình trên máy chủ.";
      case "UNAUTHORIZED":
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      case "VALIDATION_ERROR":
        return error.message || "Dữ liệu nhập vào không hợp lệ.";
      case "NOT_FOUND":
        return error.message || "Không tìm thấy dữ liệu yêu cầu.";
      case "CONFLICT":
        return error.message || "Dữ liệu đã tồn tại hoặc xảy ra xung đột.";
      case "RATE_LIMITED":
        return "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.";
      case "EXTERNAL_SERVICE_ERROR":
        return "Lỗi kết nối dịch vụ bên ngoài. Vui lòng thử lại sau.";
      default:
        return error.message || "Đã xảy ra lỗi không xác định.";
    }
  }
  return error?.message || "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.";
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (isStaticRuntime()) {
    return getStaticApiRouter().request<T>(endpoint, options);
  }

  const token = getStoredToken();
  const hasBody = options.body !== undefined && options.body !== null;
  const headers = buildRequestHeaders(options.headers as Record<string, string> | undefined, hasBody);

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const url = `${baseUrl}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError("NETWORK_ERROR", "Không thể kết nối máy chủ", 0, err);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  let json: any = null;
  const text = await response.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }

  if (!response.ok) {
    const errorCode = json?.error?.code || (response.status === 401 ? "UNAUTHORIZED" : "INTERNAL_ERROR");
    const errorMessage = json?.error?.message || response.statusText || "Lỗi yêu cầu";
    const details = json?.error?.details;

    if (response.status === 401) {
      setStoredToken(null);
      window.dispatchEvent(new CustomEvent("tutrinh:unauthorized"));
    }

    throw new ApiError(errorCode, errorMessage, response.status, details);
  }

  // Fastify returns { state: "success" | "empty", data: T } or direct payload
  if (json && typeof json === "object" && "data" in json && "state" in json) {
    return (json as ApiResponse<T>).data;
  }

  return json as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: "GET", ...options }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: "DELETE", ...options }),
};
