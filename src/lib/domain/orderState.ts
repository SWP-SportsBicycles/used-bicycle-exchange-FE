import type { ListingStatus, OrderStatus } from "@/types/domain";

export const LISTING_LOCKED_STATUSES: ListingStatus[] = ["reserved", "sold"];

export function listingIsEditableBySeller(listingStatus: ListingStatus) {
  return !LISTING_LOCKED_STATUSES.includes(listingStatus);
}

export function orderIsActive(status: OrderStatus) {
  return (
    status === "pending_payment" ||
    status === "payment_received" ||
    status === "inspection" ||
    status === "pending_fulfillment" ||
    status === "disputed"
  );
}

