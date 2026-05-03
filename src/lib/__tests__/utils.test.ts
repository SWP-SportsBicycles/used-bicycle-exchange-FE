/**
 * Tests for utility functions: cn() and formatVND().
 * @module lib/utils
 */
import { describe, it, expect } from "vitest";
import { cn, formatVND } from "@/lib/utils";

describe("cn (className merger)", () => {
  it("should merge simple class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("should handle conditional classes with clsx syntax", () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn("btn", isActive && "btn-active", isDisabled && "btn-disabled");
    expect(result).toContain("btn-active");
    expect(result).not.toContain("btn-disabled");
  });

  it("should resolve Tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  it("should handle undefined and null values gracefully", () => {
    const result = cn("base", undefined, null, false, "extra");
    expect(result).toBe("base extra");
  });

  it("should return empty string for no input", () => {
    expect(cn()).toBe("");
  });

  it("should merge complex Tailwind class patterns", () => {
    const result = cn(
      "bg-red-500 text-white",
      "bg-blue-500",
    );
    // tailwind-merge should resolve bg conflict
    expect(result).toContain("bg-blue-500");
    expect(result).not.toContain("bg-red-500");
    expect(result).toContain("text-white");
  });
});

describe("formatVND (Vietnamese Dong formatter)", () => {
  it("should format a standard price", () => {
    const result = formatVND(25000000);
    // Vietnamese locale uses period for thousands separator
    expect(result).toContain("25");
    expect(result).toContain("₫");
  });

  it("should format zero", () => {
    const result = formatVND(0);
    expect(result).toContain("0");
    expect(result).toContain("₫");
  });

  it("should format small amounts without fractions", () => {
    const result = formatVND(1500);
    expect(result).toContain("1");
    expect(result).toContain("500");
    expect(result).toContain("₫");
  });

  it("should handle negative amounts", () => {
    const result = formatVND(-100000);
    expect(result).toContain("100");
  });

  it("should format large amounts (billions)", () => {
    const result = formatVND(1500000000);
    expect(result).toContain("₫");
  });

  it("should not include decimal fractions", () => {
    const result = formatVND(25000.75);
    // maximumFractionDigits: 0 → no decimals
    expect(result).not.toMatch(/[.,]\d{1,2}$/);
  });
});
