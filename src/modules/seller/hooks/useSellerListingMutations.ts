import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sellerApi, type SellerListingPayload } from "@/lib/api/seller-api";

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SellerListingPayload) => sellerApi.createListing(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
    },
  });
}

export function useUpdateListing(listingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SellerListingPayload) => sellerApi.updateListing(listingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
      queryClient.invalidateQueries({ queryKey: ["seller-listing-detail", listingId] });
    },
  });
}

export function useSubmitListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => sellerApi.submitListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
    },
  });
}

export function useWithdrawListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => sellerApi.withdrawListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => sellerApi.deleteListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
    },
  });
}
