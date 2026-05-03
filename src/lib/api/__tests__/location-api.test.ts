/**
 * Tests for location-api client.
 * @module lib/api/location-api
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("location-api", () => {
  let locationApi: typeof import("@/lib/api/location-api").locationApi;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    localStorage.clear();
    vi.resetModules();
    const mod = await import("@/lib/api/location-api");
    locationApi = mod.locationApi;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("getProvinces", () => {
    it("should return array of provinces", async () => {
      const provinces = [
        { provinceId: 1, provinceName: "Hà Nội" },
        { provinceId: 2, provinceName: "TP. Hồ Chí Minh" },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ isSuccess: true, data: provinces }),
        text: () => Promise.resolve(""),
      });

      const result = await locationApi.getProvinces();
      expect(result).toEqual(provinces);
    });

    it("should return empty array when data is null", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ isSuccess: true, data: null }),
        text: () => Promise.resolve(""),
      });

      const result = await locationApi.getProvinces();
      expect(result).toEqual([]);
    });
  });

  describe("getDistricts", () => {
    it("should pass provinceId as query parameter", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ isSuccess: true, data: [{ districtId: 10, districtName: "Quận 1" }] }),
        text: () => Promise.resolve(""),
      });
      globalThis.fetch = mockFetch;

      await locationApi.getDistricts(201);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("provinceId=201"),
        expect.anything(),
      );
    });
  });

  describe("getWards", () => {
    it("should return ward data", async () => {
      const wards = [{ wardCode: "W001", wardName: "Phường Bến Nghé" }];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ isSuccess: true, data: wards }),
        text: () => Promise.resolve(""),
      });

      const result = await locationApi.getWards(760);
      expect(result).toEqual(wards);
    });
  });
});
