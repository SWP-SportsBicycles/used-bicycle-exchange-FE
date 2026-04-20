"use client";

import { useQuery } from "@tanstack/react-query";
import { listingsApi, type ListingsQueryParams } from "@/lib/api/listings-api";
import { MOCK_LISTINGS } from "@/lib/mock-data";

export function useMarketplaceListings(params: ListingsQueryParams = {}) {
  return useQuery({
    queryKey: ["marketplace-listings", params],
    queryFn: () => listingsApi.getMarketplaceListings(params),
    // Keep UI functional while backend endpoints are not fully connected.
    placeholderData: MOCK_LISTINGS,
  });
}
