import { useQuery } from "@tanstack/react-query";
import { sellerApi } from "@/lib/api/seller-api";

interface UseSellerListingsOptions {
  pageNumber?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useSellerListings(options: UseSellerListingsOptions = {}) {
  const { pageNumber = 1, pageSize = 10, enabled = true } = options;

  return useQuery({
    queryKey: ["seller-listings", pageNumber, pageSize],
    queryFn: () => sellerApi.getListings(pageNumber, pageSize),
    enabled,
  });
}

export function useSellerListingDetail(listingId?: string) {
  return useQuery({
    queryKey: ["seller-listing-detail", listingId],
    queryFn: () => sellerApi.getListingDetail(listingId as string),
    enabled: Boolean(listingId),
  });
}
