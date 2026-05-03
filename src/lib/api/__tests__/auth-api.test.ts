/**
 * Tests for auth-api normalizeAuthSession and API method signatures.
 * @module lib/api/auth-api
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("auth-api", () => {
  let authApi: typeof import("@/lib/api/auth-api").authApi;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    localStorage.clear();
    vi.resetModules();
    const mod = await import("@/lib/api/auth-api");
    authApi = mod.authApi;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("signin", () => {
    it("should normalize auth session with accessToken from response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            accessToken: "jwt-token-123",
            refreshToken: "refresh-456",
            user: { id: "u1", fullName: "Test User", email: "t@e.com", role: 2 },
          }),
        text: () => Promise.resolve(""),
      });

      const session = await authApi.signin({ email: "t@e.com", password: "P@ss1" });
      expect(session.accessToken).toBe("jwt-token-123");
      expect(session.refreshToken).toBe("refresh-456");
      expect(session.user?.email).toBe("t@e.com");
    });

    it("should throw when response has no accessToken", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ message: "Something else" }),
        text: () => Promise.resolve(""),
      });

      await expect(authApi.signin({ email: "t@e.com", password: "x" })).rejects.toThrow(
        "access token",
      );
    });

    it("should handle nested data.accessToken format", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            isSucess: true,
            data: {
              accessToken: "nested-token",
              user: { id: "u2", email: "nested@e.com" },
            },
          }),
        text: () => Promise.resolve(""),
      });

      // http.post unwraps { isSucess, data } → normalizeAuthSession receives the data obj
      const session = await authApi.signin({ email: "nested@e.com", password: "P@ss1" });
      expect(session.accessToken).toBe("nested-token");
    });
  });

  describe("googleLogin", () => {
    it("should send idToken and role", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            accessToken: "google-jwt",
            user: { id: "g1", email: "g@gmail.com", role: "buyer" },
          }),
        text: () => Promise.resolve(""),
      });
      globalThis.fetch = mockFetch;

      const session = await authApi.googleLogin("google-id-token", 2);
      expect(session.accessToken).toBe("google-jwt");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.idToken).toBe("google-id-token");
      expect(body.role).toBe(2);
    });
  });

  describe("getMe", () => {
    it("should call /api/Auth/me", async () => {
      localStorage.setItem("accessToken", "valid-token");
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            isSuccess: true,
            data: { id: "me-1", email: "me@e.com", fullName: "Me" },
          }),
        text: () => Promise.resolve(""),
      });
      globalThis.fetch = mockFetch;

      vi.resetModules();
      const mod = await import("@/lib/api/auth-api");
      const result = await mod.authApi.getMe();
      expect(result).toEqual({ id: "me-1", email: "me@e.com", fullName: "Me" });
    });
  });
});
