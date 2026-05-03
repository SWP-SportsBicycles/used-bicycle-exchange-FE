/**
 * Tests for order-expiry localStorage utility.
 * @module lib/order-expiry
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveExpiringOrder,
  removeExpiringOrder,
  getExpiringOrders,
} from "@/lib/order-expiry";

describe("order-expiry", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("saveExpiringOrder", () => {
    it("should save an order with expiry timestamp", () => {
      saveExpiringOrder("order-1", "2025-01-01T12:00:00Z");

      const stored = JSON.parse(
        localStorage.getItem("velotrust_expiring_orders")!,
      );
      expect(stored["order-1"]).toBe("2025-01-01T12:00:00Z");
    });

    it("should preserve existing orders when adding a new one", () => {
      saveExpiringOrder("order-1", "2025-01-01T12:00:00Z");
      saveExpiringOrder("order-2", "2025-01-02T12:00:00Z");

      const stored = JSON.parse(
        localStorage.getItem("velotrust_expiring_orders")!,
      );
      expect(stored["order-1"]).toBe("2025-01-01T12:00:00Z");
      expect(stored["order-2"]).toBe("2025-01-02T12:00:00Z");
    });

    it("should overwrite existing order with same id", () => {
      saveExpiringOrder("order-1", "2025-01-01T12:00:00Z");
      saveExpiringOrder("order-1", "2025-06-01T12:00:00Z");

      const stored = JSON.parse(
        localStorage.getItem("velotrust_expiring_orders")!,
      );
      expect(stored["order-1"]).toBe("2025-06-01T12:00:00Z");
    });
  });

  describe("removeExpiringOrder", () => {
    it("should remove a specific order", () => {
      saveExpiringOrder("order-1", "2025-01-01T12:00:00Z");
      saveExpiringOrder("order-2", "2025-01-02T12:00:00Z");
      removeExpiringOrder("order-1");

      const result = getExpiringOrders();
      expect(result["order-1"]).toBeUndefined();
      expect(result["order-2"]).toBe("2025-01-02T12:00:00Z");
    });

    it("should not throw when removing a non-existent order", () => {
      expect(() => removeExpiringOrder("non-existent")).not.toThrow();
    });
  });

  describe("getExpiringOrders", () => {
    it("should return empty object when nothing stored", () => {
      expect(getExpiringOrders()).toEqual({});
    });

    it("should return all stored orders", () => {
      saveExpiringOrder("order-1", "2025-01-01T12:00:00Z");
      saveExpiringOrder("order-2", "2025-02-01T12:00:00Z");

      const result = getExpiringOrders();
      expect(Object.keys(result)).toHaveLength(2);
      expect(result["order-1"]).toBe("2025-01-01T12:00:00Z");
    });

    it("should return empty object when localStorage has invalid JSON", () => {
      localStorage.setItem("velotrust_expiring_orders", "invalid-json{{{");
      expect(getExpiringOrders()).toEqual({});
    });
  });
});
