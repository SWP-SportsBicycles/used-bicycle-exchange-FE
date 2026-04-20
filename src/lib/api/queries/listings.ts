import { useQuery } from "@tanstack/react-query";

import type { Id } from "@/types/domain";
import type { ListingsQuery } from "@/mocks/mockApi";
import { apiGetListing, apiListListings } from "@/mocks/mockApi";

export const listingKeys = {
  all: ["listings"] as const,
  list: (q: ListingsQuery) => ["listings", "list", q] as const,
  detail: (id: Id) => ["listings", "detail", id] as const,
};

export function useListingsQuery(query: ListingsQuery) {
  return useQuery({
    queryKey: listingKeys.list(query),
    queryFn: () => apiListListings(query),
  });
}

export function useListingQuery(id: Id) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => apiGetListing(id),
  });
}

