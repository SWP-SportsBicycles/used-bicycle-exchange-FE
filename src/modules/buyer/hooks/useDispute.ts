'use client'

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { buyerApi, DisputePayload } from '@/lib/api/buyer-api'

export function useDisputeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: DisputePayload }) => 
      buyerApi.createDispute(orderId, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      queryClient.invalidateQueries({ queryKey: ['buyer-order-detail', orderId] })
    },
  })
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: (file: File) => buyerApi.uploadMedia(file),
  })
}

export function useShipmentTracking(orderId?: string) {
  return useQuery({
    queryKey: ['buyer-shipment', orderId],
    queryFn: () => buyerApi.getShipment(orderId!),
    enabled: !!orderId,
    staleTime: 1000 * 60, // 1 min
  })
}
