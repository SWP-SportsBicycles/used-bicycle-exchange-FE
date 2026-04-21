import { useQuery } from "@tanstack/react-query";
import { sellerApi } from "@/lib/api/seller-api";

interface UseSellerOrdersOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
}

export function useSellerOrders(options: UseSellerOrdersOptions = {}) {
  const { page = 1, size = 10, enabled = true } = options;

  return useQuery({
    queryKey: ["seller-orders", page, size],
    queryFn: () => sellerApi.getOrders(page, size),
    enabled,
  });
}

export function useSellerOrderDetail(orderId?: string) {
  return useQuery({
    queryKey: ["seller-order-detail", orderId],
    queryFn: () => sellerApi.getOrderDetail(orderId as string),
    enabled: Boolean(orderId),
  });
}
