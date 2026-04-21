"use client";

const API_BASE = "/api/proxy";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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
    const errorPayload = await safeParseBody(response);
    const message =
      extractApiErrorMessage(errorPayload) ||
      (typeof errorPayload === "string" && errorPayload.trim()) ||
      response.statusText ||
      "API request failed";
    throw new Error(message);
  }

  const payload = await safeParseBody(response);
  return payload as T;
}

export const http = {
  get: <T>(path: string) => fetchJson<T>(path, "GET"),
  post: <T>(path: string, body?: unknown) => fetchJson<T>(path, "POST", body),
  put: <T>(path: string, body: unknown) => fetchJson<T>(path, "PUT", body),
  patch: <T>(path: string, body: unknown) => fetchJson<T>(path, "PATCH", body),
  delete: <T>(path: string) => fetchJson<T>(path, "DELETE"),
};
