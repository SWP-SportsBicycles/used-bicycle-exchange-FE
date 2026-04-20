import type { AdminDecision, DisputeReason } from "@/types/domain";

export const DISPUTE_SLA_ACK_HOURS = 8;
export const DISPUTE_SLA_RESOLVE_HOURS = 48;

export function getSlaDeadlines(createdAtIso: string) {
  const createdAt = new Date(createdAtIso);
  return {
    ackBy: new Date(createdAt.getTime() + DISPUTE_SLA_ACK_HOURS * 60 * 60 * 1000),
    resolveBy: new Date(
      createdAt.getTime() + DISPUTE_SLA_RESOLVE_HOURS * 60 * 60 * 1000
    ),
  };
}

export function getRecommendedDecision(reason: DisputeReason): AdminDecision {
  switch (reason) {
    case "not_as_described":
      return "refund_buyer";
    case "shipping_damage":
      return "hold_for_logistics";
    case "buyer_changed_mind":
      return "deposit_split_50_50";
    case "seller_not_delivering":
      return "penalize_seller";
    default:
      return "partial_refund";
  }
}

