"use client";

import { useQuery } from "@tanstack/react-query";
import { buyerApi, type BuyerListingPage, type SearchListingsParams } from "@/lib/api/buyer-api";

/**
 * D6 — Hook tìm kiếm + lọc danh sách listing.
 * Gọi GET /api/buyer-listing/search với tất cả params từ sidebar filter.
 */
export function useSearchListings(params: SearchListingsParams) {
  const hasActiveFilter =
    Boolean(params.keyword) ||
    Boolean(params.brand) ||
    Boolean(params.category) ||
    Boolean(params.condition) ||
    Boolean(params.frameSize) ||
    Boolean(params.city) ||
    params.minPrice !== undefined ||
    params.maxPrice !== undefined;

  return useQuery<BuyerListingPage>({
    queryKey: ["buyer-listings-search", params],
    queryFn: () => buyerApi.searchListings(params),
    staleTime: hasActiveFilter ? 1000 * 15 : 1000 * 30,
  });
}
