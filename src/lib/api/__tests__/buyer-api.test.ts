/**
 * Tests for buyer-api normalizer functions and deriveOrderStatus.
 * @module lib/api/buyer-api
 */
import { describe, it, expect } from "vitest";
import { deriveOrderStatus } from "@/lib/api/buyer-api";
import { createMockReport } from "@/__tests__/test-utils";

describe("deriveOrderStatus", () => {
  it("should return original status when no report exists", () => {
    expect(deriveOrderStatus("delivered", undefined)).toBe("delivered");
    expect(deriveOrderStatus("paid", undefined)).toBe("paid");
    expect(deriveOrderStatus("pending", undefined)).toBe("pending");
  });

  it("should return 'refunded' when report transactionStatus is 'Refunded'", () => {
    const report = createMockReport({ transactionStatus: "Refunded" });
    expect(deriveOrderStatus("delivered", report as Parameters<typeof deriveOrderStatus>[1])).toBe("refunded");
  });

  it("should return 'refunded' when report refundStatus is 'Success'", () => {
    const report = createMockReport({ refundStatus: "Success" });
    expect(deriveOrderStatus("completed", report as Parameters<typeof deriveOrderStatus>[1])).toBe("refunded");
  });

  it("should return original status when report is 'Rejected'", () => {
    const report = createMockReport({ status: "Rejected" });
    expect(deriveOrderStatus("delivered", report as Parameters<typeof deriveOrderStatus>[1])).toBe("delivered");
  });

  it("should return 'disputed' for active report (Pending status)", () => {
    const report = createMockReport({ status: "Pending" });
    expect(deriveOrderStatus("delivered", report as Parameters<typeof deriveOrderStatus>[1])).toBe("disputed");
  });

  it("should return 'disputed' for report in Reviewing status", () => {
    const report = createMockReport({ status: "Reviewing" });
    expect(deriveOrderStatus("delivered", report as Parameters<typeof deriveOrderStatus>[1])).toBe("disputed");
  });

  it("should return 'disputed' for Resolved report without refund", () => {
    const report = createMockReport({
      status: "Resolved",
      transactionStatus: undefined,
      refundStatus: undefined,
    });
    expect(deriveOrderStatus("completed", report as Parameters<typeof deriveOrderStatus>[1])).toBe("disputed");
  });
});
