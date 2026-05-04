/**
 * Tests for mock data factory functions in test-utils.
 * Ensures factories produce valid mock objects for use across all tests.
 * @module __tests__/test-utils
 */
import { describe, it, expect } from "vitest";
import {
  createMockListing,
  createMockOrder,
  createMockReport,
  createMockListingPage,
  createMockOrderPage,
  createMockCart,
  createMockCartItem,
} from "@/__tests__/test-utils";

describe("Mock Data Factories", () => {
  describe("createMockListing", () => {
    it("should create a valid listing with defaults", () => {
      const listing = createMockListing();
      expect(listing.id).toBe("listing-1");
      expect(listing.title).toBe("Giant TCR Advanced Pro");
      expect(listing.price).toBe(25000000);
      expect(listing.status).toBe("published");
      expect(listing.images.length).toBeGreaterThan(0);
      expect(listing.seller.name).toBeDefined();
    });

    it("should accept overrides", () => {
      const listing = createMockListing({ title: "Custom Bike", price: 99 });
      expect(listing.title).toBe("Custom Bike");
      expect(listing.price).toBe(99);
      expect(listing.id).toBe("listing-1"); // non-overridden field preserved
    });
  });

  describe("createMockOrder", () => {
    it("should create a valid order with defaults", () => {
      const order = createMockOrder();
      expect(order.id).toBe("order-1");
      expect(order.status).toBe("pending");
      expect(order.listing.title).toBeDefined();
      expect(order.totalPrice).toBeGreaterThan(0);
    });

    it("should accept status override", () => {
      const order = createMockOrder({ status: "paid" });
      expect(order.status).toBe("paid");
    });
  });

  describe("createMockReport", () => {
    it("should create a valid report", () => {
      const report = createMockReport();
      expect(report.id).toBe("report-1");
      expect(report.orderId).toBe("order-1");
      expect(report.status).toBe("Pending");
    });

    it("should accept transactionStatus override for refund testing", () => {
      const report = createMockReport({ transactionStatus: "Refunded" });
      expect(report.transactionStatus).toBe("Refunded");
    });
  });

  describe("createMockListingPage", () => {
    it("should wrap listings in page structure", () => {
      const page = createMockListingPage();
      expect(page.items).toHaveLength(1);
      expect(page.totalCount).toBe(1);
      expect(page.pageNumber).toBe(1);
    });

    it("should accept custom items", () => {
      const items = [createMockListing({ id: "a" }), createMockListing({ id: "b" })];
      const page = createMockListingPage(items);
      expect(page.items).toHaveLength(2);
      expect(page.totalCount).toBe(2);
    });
  });

  describe("createMockOrderPage", () => {
    it("should wrap orders in page structure", () => {
      const page = createMockOrderPage();
      expect(page.items).toHaveLength(1);
      expect(page.totalPages).toBe(1);
    });
  });

  describe("createMockCart", () => {
    it("should create empty cart by default", () => {
      const cart = createMockCart();
      expect(cart.items).toEqual([]);
      expect(cart.totalCount).toBe(0);
      expect(cart.subtotal).toBe(0);
    });
  });

  describe("createMockCartItem", () => {
    it("should create cart item with embedded listing", () => {
      const item = createMockCartItem();
      expect(item.id).toBe("cart-item-1");
      expect(item.isSelected).toBe(true);
      expect(item.listing.title).toBeDefined();
    });
  });
});
