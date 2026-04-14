import { useQuery } from "@tanstack/react-query";

import type { Id } from "@/types/domain";
import { apiGetOrder, apiListBuyerOrders } from "@/mocks/mockApi";

export const orderKeys = {
  all: ["orders"] as const,
  byBuyer: (buyerId: Id) => ["orders", "byBuyer", buyerId] as const,
  detail: (id: Id) => ["orders", "detail", id] as const,
};

export function useBuyerOrdersQuery(buyerId: Id) {
  return useQuery({
    queryKey: orderKeys.byBuyer(buyerId),
    queryFn: () => apiListBuyerOrders(buyerId),
    enabled: !!buyerId,
  });
}

export function useOrderQuery(id: Id) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => apiGetOrder(id),
    enabled: !!id,
  });
}

