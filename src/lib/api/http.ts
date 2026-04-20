"use client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function fetchJson<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

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

export const http = {
  get: <T>(path: string) => fetchJson<T>(path, "GET"),
  post: <T>(path: string, body?: unknown) => fetchJson<T>(path, "POST", body),
  put: <T>(path: string, body: unknown) => fetchJson<T>(path, "PUT", body),
  patch: <T>(path: string, body: unknown) => fetchJson<T>(path, "PATCH", body),
  delete: <T>(path: string) => fetchJson<T>(path, "DELETE"),
};
