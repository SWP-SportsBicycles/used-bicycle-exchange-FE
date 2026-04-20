import { describe, expect, it } from "vitest";
import { calculateDepositVnd } from "@/lib/domain/money";

describe("calculateDepositVnd", () => {
  it("returns 10 percent when below cap", () => {
    expect(calculateDepositVnd(10_000_000)).toBe(1_000_000);
  });

  it("returns capped value when above cap", () => {
    expect(calculateDepositVnd(80_000_000)).toBe(2_000_000);
  });
});
