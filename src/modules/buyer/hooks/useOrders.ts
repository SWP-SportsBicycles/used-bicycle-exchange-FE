"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buyerApi, type BuyerOrderPage, type BuyerOrder } from "@/lib/api/buyer-api";
import { toast } from "sonner";

/**
 * D12 — Hook lấy danh sách đơn hàng của buyer.
 */
export function useOrders(page = 1, pageSize = 10) {
  return useQuery<BuyerOrderPage>({
    queryKey: ["buyer-orders", page, pageSize],
    queryFn: () => buyerApi.getOrders(page, pageSize),
    staleTime: 1000 * 30,
  });
}

/**
 * D13 — Hook lấy chi tiết đơn hàng + tracking GHN.
 */
export function useOrderDetail(orderId: string | null | undefined) {
  return useQuery<BuyerOrder>({
    queryKey: ["buyer-order-detail", orderId],
    queryFn: () => buyerApi.getOrderDetail(orderId!),
    enabled: Boolean(orderId),
    staleTime: 1000 * 20,
  });
}

export function useConfirmReceivedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => buyerApi.confirmReceived(orderId),
    onSuccess: (_, orderId) => {
      toast.success("Đã xác nhận đã nhận hàng");
      queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
      queryClient.invalidateQueries({ queryKey: ["buyer-order-detail", orderId] });
    },
    onError: () => {
      toast.error("Không thể xác nhận nhận hàng. Vui lòng thử lại.");
    },
  });
}
