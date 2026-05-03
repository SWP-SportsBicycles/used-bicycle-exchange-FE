/**
 * Tests for seller-api type definitions and API method structure.
 * @module lib/api/seller-api
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("seller-api", () => {
  let sellerApi: typeof import("@/lib/api/seller-api").sellerApi;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    localStorage.clear();
    localStorage.setItem("accessToken", "seller-token");
    vi.resetModules();
    const mod = await import("@/lib/api/seller-api");
    sellerApi = mod.sellerApi;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("getListings", () => {
    it("should call correct endpoint with pagination", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            isSuccess: true,
            data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 },
          }),
        text: () => Promise.resolve(""),
      });
      globalThis.fetch = mockFetch;

      await sellerApi.getListings(2, 20);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("pageNumber=2"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("pageSize=20"),
        expect.anything(),
      );
    });
  });

  describe("getOrders", () => {
    it("should call SellerOrder endpoint", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            isSuccess: true,
            data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 },
          }),
        text: () => Promise.resolve(""),
      });
      globalThis.fetch = mockFetch;

      await sellerApi.getOrders(1, 10);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/proxy/api/SellerOrder"),
        expect.anything(),
      );
    });
  });

  describe("confirmOrder", () => {
    it("should POST to confirm endpoint", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ isSuccess: true, data: null }),
        text: () => Promise.resolve(""),
      });
      globalThis.fetch = mockFetch;

      await sellerApi.confirmOrder("order-abc");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("order-abc/confirm"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("shipOrder", () => {
    it("should POST to seller-shipment create endpoint", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ isSuccess: true, data: null }),
        text: () => Promise.resolve(""),
      });
      globalThis.fetch = mockFetch;

      await sellerApi.shipOrder("order-xyz");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("seller-shipment/order-xyz/create"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("deleteListing", () => {
    it("should DELETE a listing by ID", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
        json: () => Promise.reject(new Error("no body")),
        text: () => Promise.resolve(""),
      });
      globalThis.fetch = mockFetch;

      await sellerApi.deleteListing("listing-del-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("seller-listing/listing-del-1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});
