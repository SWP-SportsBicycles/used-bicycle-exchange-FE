'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { buyerApi, type BuyerCart } from '@/lib/api/buyer-api'

export function useCart() {
  return useQuery<BuyerCart>({
    queryKey: ['buyer-cart'],
    queryFn: () => buyerApi.getCart(),
    staleTime: 1000 * 15,
  })
}

export function useCartSelectionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cartItemId, isSelected }: { cartItemId: string; isSelected: boolean }) =>
      buyerApi.updateCartSelection(cartItemId, isSelected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-cart'] })
    },
  })
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cartItemId: string) => buyerApi.removeCartItem(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-cart'] })
    },
  })
}
