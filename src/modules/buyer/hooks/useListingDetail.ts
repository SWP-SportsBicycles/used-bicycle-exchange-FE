"use client";

import { useQuery } from "@tanstack/react-query";
import { buyerApi, type BuyerListing } from "@/lib/api/buyer-api";

/**
 * D7 — Hook lấy chi tiết một listing theo id.
 * PII Seller bị ẩn (phone = null, address = null) cho đến khi thanh toán.
 */
export function useListingDetail(id: string | null | undefined) {
  return useQuery<BuyerListing>({
    queryKey: ["buyer-listing-detail", id],
    queryFn: () => buyerApi.getListingDetail(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60, // 1 min
  });
}
