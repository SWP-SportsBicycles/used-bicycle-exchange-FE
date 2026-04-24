"use client";

import { useQuery } from "@tanstack/react-query";
import {
  buyerApi,
  type BuyerListingPage,
  type SearchListingsParams,
} from "@/lib/api/buyer-api";

/**
 * D5/D6 — Hook tổng hợp cho Marketplace page.
 * - Khi có filter/search: gọi GET /api/buyer-listing/search
 * - Không có filter: gọi GET /api/buyer-listing (phân trang chuẩn)
 *
 * buyerApi đã xử lý:
 * 1. Unwrap { isSuccess, data } wrapper
 * 2. Normalize totalItems → totalCount
 * 3. Normalize listing fields (listingId→id, thumbnail→images[])
 */
export function useMarketplaceListings(params: SearchListingsParams = {}) {
  const hasFilter =
    Boolean(params.keyword) ||
    Boolean(params.brand) ||
    Boolean(params.category) ||
    Boolean(params.condition) ||
    Boolean(params.frameSize) ||
    Boolean(params.city) ||
    params.minPrice !== undefined ||
    params.maxPrice !== undefined;

  return useQuery<BuyerListingPage>({
    queryKey: ["marketplace-listings", params],
    queryFn: () =>
      hasFilter
        ? buyerApi.searchListings(params)
        : buyerApi.getListings(params.pageNumber ?? 1, params.pageSize ?? 12),
    staleTime: hasFilter ? 1000 * 15 : 1000 * 30,
  });
}
