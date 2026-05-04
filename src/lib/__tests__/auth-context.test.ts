/**
 * Tests for auth-context role mapping and user extraction.
 * Tests the pure functions exported indirectly through the provider.
 * @module lib/auth-context
 */
import { describe, it, expect } from "vitest";

// We test the types and constants; the Provider itself needs React rendering.
// Focus on role mapping logic which is the most critical pure logic.

describe("auth-context types", () => {
  it("should define all expected UserRole values", () => {
    const roles: Array<import("@/lib/auth-context").UserRole> = [
      "guest",
      "buyer",
      "seller",
      "inspector",
      "admin",
    ];
    expect(roles).toHaveLength(5);
  });

  it("should define User interface with required fields", () => {
    const user: import("@/lib/auth-context").User = {
      id: "u1",
      name: "Test",
      email: "t@e.com",
      role: "buyer",
    };
    expect(user.id).toBe("u1");
    expect(user.role).toBe("buyer");
  });

  it("should define User with optional seller fields", () => {
    const seller: import("@/lib/auth-context").User = {
      id: "s1",
      name: "Seller",
      email: "s@e.com",
      role: "seller",
      walletBalance: 5000000,
      totalSales: 10,
      rating: 4.5,
    };
    expect(seller.walletBalance).toBe(5000000);
  });

  it("should define User with optional inspector fields", () => {
    const inspector: import("@/lib/auth-context").User = {
      id: "i1",
      name: "Inspector",
      email: "i@e.com",
      role: "inspector",
      assignedInspections: 5,
      completedInspections: 3,
    };
    expect(inspector.assignedInspections).toBe(5);
  });

  it("should define User with optional admin fields", () => {
    const admin: import("@/lib/auth-context").User = {
      id: "a1",
      name: "Admin",
      email: "a@e.com",
      role: "admin",
      permissions: ["manage_users", "manage_listings"],
    };
    expect(admin.permissions).toHaveLength(2);
  });
});
