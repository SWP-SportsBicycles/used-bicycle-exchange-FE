"use client";

import { useQuery } from "@tanstack/react-query";
import { buyerApi, type BuyerListingPage } from "@/lib/api/buyer-api";

/**
 * D4/D5 — Hook lấy danh sách listing từ buyer API (phân trang).
 * Dùng cho Homepage (pageSize=6) và Marketplace grid.
 */
export function useListings(page = 1, pageSize = 10) {
  return useQuery<BuyerListingPage>({
    queryKey: ["buyer-listings", page, pageSize],
    queryFn: () => buyerApi.getListings(page, pageSize),
    staleTime: 1000 * 30, // 30s
  });
}

/**
 * Convenience hook cho Homepage — lấy 6 featured listings.
 */
export function useFeaturedListings() {
  return useListings(1, 6);
}
