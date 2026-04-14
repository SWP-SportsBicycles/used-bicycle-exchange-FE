import type { MoneyVnd } from "@/types/domain";

export const MAX_DEPOSIT_VND: MoneyVnd = 2_000_000;

/**
 * SRS: deposit = min(10% * listingPrice, 2,000,000 VND).
 * Rounding: default to nearest 1,000 VND for UX + bank transfer friendliness.
 */
export function calcDepositAmountVnd(listingPrice: MoneyVnd, roundTo = 1_000) {
  const raw = Math.min(listingPrice * 0.1, MAX_DEPOSIT_VND);
  return Math.round(raw / roundTo) * roundTo;
}

