'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { buyerApi, type CheckoutPayload } from '@/lib/api/buyer-api'

export function useAddToCartMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { bikeId: string; quantity: number }) => buyerApi.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-cart'] })
    },
  })
}

export function useCreateOrderDirectMutation() {
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => buyerApi.createOrderDirect(payload),
  })
}

export function useCheckoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<CheckoutPayload, 'listingId'>) => buyerApi.checkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-cart'] })
    },
  })
}

export function usePaymentLinkMutation() {
  return useMutation({
    mutationFn: (orderId: string) => buyerApi.getPaymentLink(orderId),
  })
}

export function useOrderStatusPolling(orderId?: string) {
  return useQuery({
    queryKey: ['buyer-order-status', orderId],
    queryFn: () => buyerApi.getOrderStatus(orderId!),
    enabled: !!orderId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 3000

      const terminalStatuses = ['paid', 'cancelled', 'completed', 'shipping', 'delivered', 'disputed']
      if (terminalStatuses.includes(data.status)) {
        return false
      }
      return 3000
    },
  })
}
