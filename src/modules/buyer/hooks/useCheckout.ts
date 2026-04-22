'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { buyerApi, type CheckoutPayload } from '@/lib/api/buyer-api'

export function useAddToCartMutation() {
  return useMutation({
    mutationFn: (data: { listingId: string; quantity: number }) => buyerApi.addToCart(data),
  })
}

export function useCheckoutMutation() {
  return useMutation({
    mutationFn: (payload: Omit<CheckoutPayload, 'listingId'>) => buyerApi.checkout(payload),
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
      // Poll every 3 seconds if we have an orderId and the status is still pending payment
      // Adjust condition based on your exact status enum
      const data = query.state.data
      if (data?.status === 'payos_paid' || data?.status === 'cancelled' || data?.status === 'completed') {
        return false // stop polling
      }
      return 3000
    },
  })
}
