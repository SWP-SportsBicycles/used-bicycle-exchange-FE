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

// Endpoints that should NOT trigger forceLogout on 401.
// These are "browsing" endpoints that should degrade gracefully.
const SOFT_FAIL_PATH_PREFIXES = [
  "/api/buyer-listing",
  "/api/wishlist",
];

function normalizePath(url: string): string {
  return url.startsWith("/") ? url : `/${url}`;
}

function isPublicAuthPath(url: string): boolean {
  return PUBLIC_AUTH_PATH_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function isSoftFailPath(url: string): boolean {
  return SOFT_FAIL_PATH_PREFIXES.some((prefix) => url.startsWith(prefix));
}

let refreshPromise: Promise<string | null> | null = null;
let logoutInProgress = false;

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

async function forceLogout() {
  if (typeof window === "undefined") {
    return;
  }

  if (logoutInProgress) {
    return;
  }

  logoutInProgress = true;
  localStorage.removeItem("accessToken");
  window.location.href = "/auth/login";
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const renewRes = await fetch(`${API_BASE}/api/Auth/renew-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!renewRes.ok) {
      return null;
    }

    const data = await renewRes.json().catch(() => null);
    const nextToken =
      data && typeof data.accessToken === "string" && data.accessToken.trim()
        ? data.accessToken
        : null;

    if (nextToken && typeof window !== "undefined") {
      localStorage.setItem("accessToken", nextToken);
    }

    return nextToken;
  })()
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function fetchWithAuth<T>(url: string, options: RequestInit = {}, hasRetried = false): Promise<T> {
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
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
  }



  if (res.status === 401 && !skipAuthHeader) {
    const softFail = isSoftFailPath(normalizedUrl);

    if (hasRetried || !token) {
      // For browsing endpoints, DON'T force logout — just throw so
      // React Query can show an empty/error state gracefully.
      if (!softFail) {
        await forceLogout();
      }
      throw new Error("Không có quyền truy cập hoặc phiên đăng nhập đã hết hạn.");
    }

    const nextToken = await refreshAccessToken();

    if (!nextToken) {
      if (!softFail) {
        await forceLogout();
      }
      throw new Error("Không có quyền truy cập hoặc phiên đăng nhập đã hết hạn.");
    }

    return fetchWithAuth<T>(
      normalizedUrl,
      {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${nextToken}`,
        },
      },
      true,
    );
  }

  if (!res.ok) {
    const errorPayload = await safeParseBody(res);
    const message =
      extractApiErrorMessage(errorPayload) ||
      (typeof errorPayload === "string" && errorPayload.trim()) ||
      res.statusText ||
      "Yêu cầu xử lý thất bại. Vui lòng thử lại sau.";
    throw new Error(message);
  }

  const payload = await safeParseBody(res);

  // Backend wraps responses in { isSucess/isSuccess/success, data, ... }.
  // NOTE: BE has a typo — "isSucess" (missing 'c'). We handle all variants.
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const hasWrapper =
      ("isSucess" in obj || "isSuccess" in obj || "success" in obj) &&
      "data" in obj;

    if (hasWrapper) {
      const isOk = obj.isSucess ?? obj.isSuccess ?? obj.success;

      // BE sometimes returns { success: false, message: "..." } on HTTP 200.
      if (isOk === false) {
        const msg =
          (typeof obj.message === "string" && obj.message.trim()) ||
          "Thao tác không thành công.";
        throw new Error(msg);
      }

      return obj.data as T;
    }
  }

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
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
  }

  if (!response.ok) {
    const errorPayload = await safeParseBody(response);
    const apiMsg = extractApiErrorMessage(errorPayload);
    const rawMsg = typeof errorPayload === "string" && errorPayload.trim() ? errorPayload.trim() : "";
    const message: string = apiMsg || rawMsg || response.statusText || "Tải lên thất bại. Vui lòng thử lại sau.";
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
    if (!res.ok) throw new Error("Tải lên thất bại. Vui lòng thử lại sau.");
    return res.json() as Promise<T>;
  },
};

// Backward-compatible alias while callers migrate to the canonical `http` symbol.
export const api = http;