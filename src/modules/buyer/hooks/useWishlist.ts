"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buyerApi, type WishlistPage } from "@/lib/api/buyer-api";
import { toast } from "sonner";

/**
 * Hook lấy danh sách wishlist.
 */
export function useWishlist(page = 1, pageSize = 12) {
  return useQuery<WishlistPage>({
    queryKey: ["buyer-wishlist", page, pageSize],
    queryFn: () => buyerApi.getWishlist(page, pageSize),
    staleTime: 1000 * 30,
  });
}

/**
 * D11 — Toggle wishlist với optimistic update.
 * Rollback nếu API fail.
 */
export function useWishlistToggle() {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: (bikeId: string) => buyerApi.addToWishlist(bikeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-wishlist"] });
    },
    onError: () => {
      toast.error("Không thể thêm vào Wishlist. Vui lòng thử lại.");
    },
  });

  const remove = useMutation({
    mutationFn: (bikeId: string) => buyerApi.removeFromWishlist(bikeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-wishlist"] });
    },
    onError: () => {
      toast.error("Không thể xóa khỏi Wishlist. Vui lòng thử lại.");
    },
  });

  const toggle = async (bikeId: string, currentlyInWishlist: boolean) => {
    if (currentlyInWishlist) {
      return remove.mutateAsync(bikeId);
    } else {
      return add.mutateAsync(bikeId);
    }
  };

  return {
    toggle,
    isLoading: add.isPending || remove.isPending,
  };
}
