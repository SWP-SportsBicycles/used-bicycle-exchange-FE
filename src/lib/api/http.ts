"use client";

const API_BASE = "/api/proxy";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function fetchJson<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${normalizedPath}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
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
      "API request failed";
    throw new Error(message);
  }

  return (await response.json()) as T;
}

/** Gửi FormData (multipart/form-data) — KHÔNG set Content-Type thủ công để browser tự handle boundary */
export async function httpMultipart<T>(path: string, form: FormData, options?: { method?: HttpMethod }): Promise<T> {
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
  get: <T>(path: string) => fetchJson<T>(path, "GET"),
  post: <T>(path: string, body?: unknown) => fetchJson<T>(path, "POST", body),
  put: <T>(path: string, body: unknown) => fetchJson<T>(path, "PUT", body),
  patch: <T>(path: string, body: unknown) => fetchJson<T>(path, "PATCH", body),
  delete: <T>(path: string) => fetchJson<T>(path, "DELETE"),
};
