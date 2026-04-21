"use client";

import { useQuery } from "@tanstack/react-query";
import { buyerApi, type BuyerListingPage, type SearchListingsParams } from "@/lib/api/buyer-api";
import { MOCK_LISTINGS } from "@/lib/mock-data";

/**
 * D6 — Hook tìm kiếm + lọc danh sách listing.
 * Gọi GET /api/buyer-listing/search với tất cả params từ sidebar filter.
 * Dùng placeholder data từ mock để UI không trống khi đợi API.
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
    placeholderData: {
      items: MOCK_LISTINGS as unknown as BuyerListingPage["items"],
      totalCount: MOCK_LISTINGS.length,
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 12,
      totalPages: Math.ceil(MOCK_LISTINGS.length / (params.pageSize ?? 12)),
    },
    staleTime: hasActiveFilter ? 1000 * 15 : 1000 * 30,
  });
}
