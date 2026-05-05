/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buyerApi, type BuyerOrderPage, type BuyerOrder, deriveOrderStatus } from "@/lib/api/buyer-api";
import { toast } from "sonner";

/**
 * D12 — Hook lấy danh sách đơn hàng của buyer.
 * status: 'all' | 'disputed' → fetch all then filter client-side
 *         other values → pass to server for filtering
 */
export function useOrders(page = 1, pageSize = 10, status?: string) {
  return useQuery<BuyerOrderPage>({
    queryKey: ['buyer-orders', page, pageSize, status ?? 'all'],
    queryFn: async () => {
      const [orderPage, reports] = await Promise.all([
        buyerApi.getOrders(page, pageSize, status),
        buyerApi.getMyReports().catch(() => [])
      ])

      // Build a map: orderId → report
      const reportByOrderId = new Map(
        reports.map((r: any) => [r.orderId, r])
      )

      return {
        ...orderPage,
        items: orderPage.items.map(order => {
          const report = reportByOrderId.get(order.id)
          return {
            ...order,
            status: deriveOrderStatus(order.status, report)
          }
        })
      }
    },
    staleTime: 1000 * 30,
  })
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
      
      const report = reports.find(r => r.orderId === orderId)
      return {
        ...order,
        status: deriveOrderStatus(order.status, report)
      }
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
