/**
 * Tests for the HTTP client module.
 * Covers: fetchWithAuth, error extraction, response unwrapping, retry logic.
 * @module lib/api/http
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We test the exported `http` object
// Must mock fetch globally since the module calls `fetch()` directly

describe("http client", () => {
  let http: typeof import("@/lib/api/http").http;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    localStorage.clear();
    vi.clearAllMocks();

    // Dynamic import to get fresh module state for each test
    vi.resetModules();
    const mod = await import("@/lib/api/http");
    http = mod.http;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // ---------- Successful requests ----------

  it("should make GET request and unwrap { isSucess, data } response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ isSucess: true, data: { id: "123" } }),
      text: () => Promise.resolve(""),
    });

    const result = await http.get<{ id: string }>("/api/test");
    expect(result).toEqual({ id: "123" });
  });

  it("should make GET request and unwrap { isSuccess, data } variant", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ isSuccess: true, data: [1, 2, 3] }),
      text: () => Promise.resolve(""),
    });

    const result = await http.get<number[]>("/api/test");
    expect(result).toEqual([1, 2, 3]);
  });

  it("should return raw payload when no wrapper detected", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ name: "Test", value: 42 }),
      text: () => Promise.resolve(""),
    });

    const result = await http.get<{ name: string; value: number }>("/api/raw");
    expect(result).toEqual({ name: "Test", value: 42 });
  });

  it("should handle 204 No Content response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
      json: () => Promise.reject(new Error("no body")),
      text: () => Promise.resolve(""),
    });

    const result = await http.delete("/api/resource/1");
    expect(result).toBeNull();
  });

  // ---------- POST with body ----------

  it("should POST with JSON body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ isSuccess: true, data: { created: true } }),
      text: () => Promise.resolve(""),
    });
    globalThis.fetch = mockFetch;

    await http.post("/api/items", { name: "Test" });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/proxy/api/items",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      }),
    );
  });

  // ---------- Authorization header ----------

  it("should include Authorization header when token exists", async () => {
    localStorage.setItem("accessToken", "my-jwt-token");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ isSuccess: true, data: null }),
      text: () => Promise.resolve(""),
    });
    globalThis.fetch = mockFetch;

    // Re-import with token present
    vi.resetModules();
    const mod = await import("@/lib/api/http");
    await mod.http.get("/api/protected");

    const callHeaders = mockFetch.mock.calls[0][1]?.headers;
    expect(callHeaders?.Authorization).toBe("Bearer my-jwt-token");
  });

  it("should NOT include Authorization header for public auth paths", async () => {
    localStorage.setItem("accessToken", "my-jwt-token");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ accessToken: "new-token" }),
      text: () => Promise.resolve(""),
    });
    globalThis.fetch = mockFetch;

    vi.resetModules();
    const mod = await import("@/lib/api/http");
    await mod.http.post("/api/Auth/signin", { email: "a", password: "b" });

    const callHeaders = mockFetch.mock.calls[0][1]?.headers;
    expect(callHeaders?.Authorization).toBeUndefined();
  });

  // ---------- Error handling ----------

  it("should throw error with message from API error response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ message: "Email đã tồn tại" }),
      text: () => Promise.resolve(""),
    });

    await expect(http.post("/api/Auth/signup", {})).rejects.toThrow(
      "Email đã tồn tại",
    );
  });

  it("should extract error from nested errors object", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      headers: new Headers({ "content-type": "application/json" }),
      json: () =>
        Promise.resolve({
          errors: {
            Email: ["Email is required"],
            Password: ["Password must be at least 6 characters"],
          },
        }),
      text: () => Promise.resolve(""),
    });

    await expect(http.post("/api/test", {})).rejects.toThrow(
      "Email is required",
    );
  });

  it("should throw on network failure", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(http.get("/api/fail")).rejects.toThrow(
      "Unable to connect to API",
    );
  });

  it("should throw when BE returns success=false on HTTP 200", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: () =>
        Promise.resolve({
          success: false,
          data: null,
          message: "Thao tác không thành công",
        }),
      text: () => Promise.resolve(""),
    });

    await expect(http.get("/api/trick")).rejects.toThrow(
      "Thao tác không thành công",
    );
  });

  // ---------- Fallback to statusText ----------

  it("should use statusText when no message in error body", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
    });

    await expect(http.get("/api/error")).rejects.toThrow(
      "Internal Server Error",
    );
  });
});
