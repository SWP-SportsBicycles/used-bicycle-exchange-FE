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
    queryFn: async () => {
      const [orderPage, reports] = await Promise.all([
        buyerApi.getOrders(page, pageSize),
        buyerApi.getMyReports().catch(() => [])
      ])
      
      const disputedOrderIds = new Set(reports.map(r => r.orderId))
      
      return {
        ...orderPage,
        items: orderPage.items.map(order => ({
          ...order,
          status: disputedOrderIds.has(order.id) ? 'disputed' : order.status
        }))
      }
    },
    staleTime: 1000 * 30,
  });
}

/**
 * D13 — Hook lấy chi tiết đơn hàng + tracking GHN.
 */
export function useOrderDetail(orderId: string | null | undefined) {
  return useQuery<BuyerOrder>({
    queryKey: ["buyer-order-detail", orderId],
    queryFn: async () => {
      const [order, reports] = await Promise.all([
        buyerApi.getOrderDetail(orderId!),
        buyerApi.getMyReports().catch(() => [])
      ])
      
      if (reports.some(r => r.orderId === orderId)) {
        order.status = 'disputed'
      }
      return order
    },
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
