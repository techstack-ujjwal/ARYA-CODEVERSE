import { APIResponse, UserRole } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000/api/v1"
    : "http://localhost:8000/api/v1");

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const getAuthToken = (): string => {
  if (typeof window === "undefined") return "test_token_admin";
  const storedRole = (localStorage.getItem("eval_user_role") as UserRole) || "admin";
  const customToken = localStorage.getItem("eval_custom_token");
  if (customToken) return customToken;
  return `test_token_${storedRole}`;
};

export const getStoredRole = (): UserRole => {
  if (typeof window === "undefined") return "admin";
  return (localStorage.getItem("eval_user_role") as UserRole) || "admin";
};

export const setStoredRole = (role: UserRole) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("eval_user_role", role);
    window.dispatchEvent(new Event("eval_auth_changed"));
  }
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg =
        data?.detail || data?.message || data?.error || `HTTP error ${res.status}`;
      throw new ApiError(errorMsg, res.status, data);
    }

    return data as APIResponse<T>;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err?.message || "Failed to communicate with evaluation engine backend",
      500,
      err
    );
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body || {}),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  upload: <T>(endpoint: string, formData: FormData, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    }),
};
