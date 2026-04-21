"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ?? "https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net";

function normalizePath(url: string): string {
  return url.startsWith("/") ? url : `/${url}`;
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
  const res = await fetch(`${API_BASE}${normalizedUrl}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: "include", // for refresh token cookie
  });

  if (res.status === 401) {
    const renewRes = await fetch(`${API_BASE}/api/Auth/renew-token`, {
      method: "POST",
      credentials: "include",
    });
    if (renewRes.ok) {
      const data = await renewRes.json();
      localStorage.setItem("accessToken", data.accessToken);
      
      return fetchWithAuth(normalizedUrl, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.accessToken}`,
        }
      });
    }
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

export const http = {
  get: <T>(url: string) => fetchWithAuth<T>(url),
  post: <T>(url: string, body?: unknown) =>
    fetchWithAuth<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body: unknown) =>
    fetchWithAuth<T>(url, { method: "PUT", body: JSON.stringify(body) }),
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
