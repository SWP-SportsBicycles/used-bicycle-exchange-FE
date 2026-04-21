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
