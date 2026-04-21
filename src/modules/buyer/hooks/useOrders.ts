"use client";

import { useQuery } from "@tanstack/react-query";
import { buyerApi, type BuyerOrderPage, type BuyerOrder } from "@/lib/api/buyer-api";

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
