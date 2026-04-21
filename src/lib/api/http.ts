"use client";

import { QueryClient } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ?? "https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;

  const res = await fetch(`${API_BASE}${url}`, {
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
      
      return fetchWithAuth(url, {
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
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "API Error");
  }

  return res.json();
}

export const api = {
  get: (url: string) => fetchWithAuth(url),
  post: (url: string, body?: unknown) =>
    fetchWithAuth(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: (url: string, body: unknown) =>
    fetchWithAuth(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: (url: string) => fetchWithAuth(url, { method: "DELETE" }),
  upload: async (url: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const res = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});
