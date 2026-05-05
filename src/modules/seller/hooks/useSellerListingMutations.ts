import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sellerApi, type SellerListingFormData } from "@/lib/api/seller-api";

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SellerListingFormData) => sellerApi.createListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, data }: { listingId: string; data: SellerListingFormData }) =>
      sellerApi.updateListing(listingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
      queryClient.invalidateQueries({ queryKey: ["seller-listing-detail", variables.listingId] });
    },
  });
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: ({ listingId, files }: { listingId: string; files: File[] }) =>
      sellerApi.uploadMedia(listingId, files),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => sellerApi.uploadImage(file),
  });
}

export function useUploadVideo() {
  return useMutation({
    mutationFn: (file: File) => sellerApi.uploadVideo(file),
  });
}

export function useSubmitListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => sellerApi.submitListing(listingId),
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
      queryClient.invalidateQueries({ queryKey: ["seller-listing-detail", listingId] });
    },
  });
}

export function useResubmitListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => sellerApi.resubmitListing(listingId),
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
      queryClient.invalidateQueries({ queryKey: ["seller-listing-detail", listingId] });
    },
  });
}

export function useWithdrawListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => sellerApi.withdrawListing(listingId),
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
      queryClient.invalidateQueries({ queryKey: ["seller-listing-detail", listingId] });
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
