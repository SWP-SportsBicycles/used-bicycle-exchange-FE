"use client";

const API_BASE = "/api/proxy";

const PUBLIC_AUTH_PATH_PREFIXES = [
  "/api/Auth/signin",
  "/api/Auth/signup",
  "/api/Auth/google-login",
  "/api/Auth/verify-otp",
  "/api/Auth/resend-otp",
  "/api/Auth/forgot-password",
  "/api/Auth/reset-password-by-link",
  "/api/Auth/renew-token",
];

function normalizePath(url: string): string {
  return url.startsWith("/") ? url : `/${url}`;
}

function isPublicAuthPath(url: string): boolean {
  return PUBLIC_AUTH_PATH_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function extractApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybe = payload as Record<string, unknown>;

  if (typeof maybe.message === "string" && maybe.message.trim()) {
    return maybe.message;
  }

  if (typeof maybe.error === "string" && maybe.error.trim()) {
    return maybe.error;
  }

  if (typeof maybe.title === "string" && maybe.title.trim()) {
    return maybe.title;
  }

  if (maybe.errors && typeof maybe.errors === "object") {
    const errors = maybe.errors as Record<string, unknown>;
    const messages = Object.values(errors)
      .flatMap((value) => {
        if (Array.isArray(value)) {
          return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
        }
        if (typeof value === "string" && value.trim()) {
          return [value];
        }
        return [];
      })
      .map((item) => item.trim());

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return null;
}

async function safeParseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  return text.trim() ? text : null;
}

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;
  const normalizedUrl = normalizePath(url);
  const skipAuthHeader = isPublicAuthPath(normalizedUrl);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${normalizedUrl}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(!skipAuthHeader && token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: "include", // for refresh token cookie
    });
  } catch {
    throw new Error("Unable to connect to API. Please check backend service and network.");
  }

  if (res.status === 401 && !skipAuthHeader) {
    const renewRes = await fetch(`${API_BASE}/api/Auth/renew-token`, {
      method: "POST",
      credentials: "include",
    });
    if (renewRes.ok) {
      const data = await renewRes.json();
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      
      return fetchWithAuth(normalizedUrl, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.accessToken}`,
        }
      });
    }
    localStorage.removeItem("accessToken");
    window.location.href = "/auth/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const errorPayload = await safeParseBody(res);
    const message =
      extractApiErrorMessage(errorPayload) ||
      (typeof errorPayload === "string" && errorPayload.trim()) ||
      res.statusText ||
      "API request failed";
    throw new Error(message);
  }

  const payload = await safeParseBody(res);
  return payload as T;
}

/** Gửi FormData (multipart/form-data) — KHÔNG set Content-Type thủ công để browser tự handle boundary */
export async function httpMultipart<T>(path: string, form: FormData, options?: { method?: RequestInit["method"] }): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${normalizedPath}`, {
      method: options?.method || "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // NOTE: Không set Content-Type — browser tự thêm multipart/form-data + boundary
      },
      body: form,
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to connect to API. Please check backend service and network.");
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message =
      (errorPayload && typeof errorPayload.message === "string" && errorPayload.message) ||
      response.statusText ||
      "Upload failed";
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const http = {
  get: <T>(url: string) => fetchWithAuth<T>(url),
  post: <T>(url: string, body?: unknown) =>
    fetchWithAuth<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body: unknown) =>
    fetchWithAuth<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) =>
    fetchWithAuth<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(url: string) => fetchWithAuth<T>(url, { method: "DELETE" }),
  upload: async <T>(url: string, file: File): Promise<T> => {
    const formData = new FormData();
    formData.append("file", file);
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const res = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json() as Promise<T>;
  },
};

// Backward-compatible alias while callers migrate to the canonical `http` symbol.
export const api = http;
