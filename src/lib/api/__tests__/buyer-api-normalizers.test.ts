/**
 * Tests for buyer-api normalizers (listing, order, cart, checkout).
 * These test the complex data transformation logic used throughout the app.
 * @module lib/api/buyer-api (normalizers)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("buyer-api normalizers (via buyerApi methods)", () => {
  let buyerApi: typeof import("@/lib/api/buyer-api").buyerApi;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    localStorage.clear();
    localStorage.setItem("accessToken", "test-token");
    vi.resetModules();
    const mod = await import("@/lib/api/buyer-api");
    buyerApi = mod.buyerApi;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("getListings normalization", () => {
    it("should normalize listingId to id", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            isSuccess: true,
            data: {
              items: [{ listingId: "abc-123", title: "Test Bike", price: 5000000 }],
              totalCount: 1,
              pageNumber: 1,
              pageSize: 10,
              totalPages: 1,
            },
          }),
        text: () => Promise.resolve(""),
      });

      const page = await buyerApi.getListings(1, 10);
      expect(page.items[0].id).toBe("abc-123");
    });

    it("should provide placeholder image when no images", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            isSuccess: true,
            data: {
              items: [{ listingId: "no-img", title: "No Image Bike" }],
              totalCount: 1,
              pageNumber: 1,
              pageSize: 10,
              totalPages: 1,
            },
          }),
        text: () => Promise.resolve(""),
      });

      const page = await buyerApi.getListings(1, 10);
      expect(page.items[0].images.length).toBeGreaterThan(0);
      expect(page.items[0].images[0]).toContain("placehold");
    });

    it("should normalize empty list to empty items array", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
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

      const page = await buyerApi.getListings(1, 10);
      expect(page.items).toEqual([]);
      expect(page.totalCount).toBe(0);
    });
  });

  describe("getListingDetail normalization", () => {
    it("should extract data from nested bikes[] array", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            isSuccess: true,
            data: {
              listingId: "detail-1",
              title: "Detail Bike",
              bikes: [
                {
                  bikeId: "bike-inner",
                  brand: "Trek",
                  price: 15000000,
                  category: "road",
                  condition: "excellent",
                  frameSize: "L",
                  frameMaterial: "Carbon",
                  groupset: "SRAM Force",
                  serialNumber: "SN-001",
                  city: "TP.HCM",
                },
              ],
            },
          }),
        text: () => Promise.resolve(""),
      });

      const listing = await buyerApi.getListingDetail("detail-1");
      expect(listing.id).toBe("detail-1");
      expect(listing.brand).toBe("Trek");
      expect(listing.price).toBe(15000000);
      expect(listing.city).toBe("hcm"); // "TP.HCM" → normalized to "hcm"
      expect(listing.serial).toBe("SN-001");
    });

    it("should normalize city names (TP.HCM → hcm, Hà Nội → hanoi)", async () => {
      const testCases = [
        { input: "TP.HCM", expected: "hcm" },
        { input: "tp.hcm", expected: "hcm" },
        { input: "Hà Nội", expected: "hanoi" },
        { input: "Đà Nẵng", expected: "danang" },
      ];

      for (const tc of testCases) {
        vi.resetModules();
        const mod = await import("@/lib/api/buyer-api");

        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              isSuccess: true,
              data: { listingId: "city-test", city: tc.input },
            }),
          text: () => Promise.resolve(""),
        });

        const listing = await mod.buyerApi.getListingDetail("city-test");
        expect(listing.city).toBe(tc.expected);
      }
    });
  });

  describe("order status normalization", () => {
    it("should map 'Locked' to 'pending'", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            isSuccess: true,
            data: { orderId: "o1", status: "Locked", listingId: "l1" },
          }),
        text: () => Promise.resolve(""),
      });

      const order = await buyerApi.getOrderDetail("o1");
      expect(order.status).toBe("pending");
    });

    it("should map 'payment_success' to 'paid'", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            isSuccess: true,
            data: { orderId: "o2", status: "payment_success" },
          }),
        text: () => Promise.resolve(""),
      });

      const order = await buyerApi.getOrderDetail("o2");
      expect(order.status).toBe("paid");
    });
  });

  describe("getCart normalization", () => {
    it("should normalize cart with items and calculate subtotal", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            isSuccess: true,
            data: {
              cartItems: [
                {
                  cartItemId: "ci-1",
                  bikeId: "b1",
                  listingId: "l1",
                  unitPrice: 5000000,
                  isSelected: true,
                  bike: { title: "Bike 1", brand: "Trek" },
                },
                {
                  cartItemId: "ci-2",
                  bikeId: "b2",
                  listingId: "l2",
                  unitPrice: 3000000,
                  isSelected: false,
                  bike: { title: "Bike 2", brand: "Giant" },
                },
              ],
            },
          }),
        text: () => Promise.resolve(""),
      });

      const cart = await buyerApi.getCart();
      expect(cart.items).toHaveLength(2);
      expect(cart.items[0].id).toBe("ci-1");
      expect(cart.items[0].listing.price).toBe(5000000);
      expect(cart.selectedCount).toBe(1);
    });

    it("should handle empty cart", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({ isSuccess: true, data: { cartItems: [] } }),
        text: () => Promise.resolve(""),
      });

      const cart = await buyerApi.getCart();
      expect(cart.items).toEqual([]);
      expect(cart.totalCount).toBe(0);
      expect(cart.subtotal).toBe(0);
    });
  });
});
