'use client'

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { buyerApi, DisputePayload, BuyerReport } from '@/lib/api/buyer-api'

export function useDisputeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: DisputePayload }) => 
      buyerApi.createDispute(orderId, data),
    onSuccess: (createdReport, { orderId }) => {
      queryClient.setQueryData<BuyerReport[]>(['buyer-reports'], (current) => {
        const safeCurrent = Array.isArray(current) ? current : []
        const next = createdReport
          ? {
              ...createdReport,
              id: createdReport.id ?? createdReport.reportId ?? '',
              orderId: createdReport.orderId ?? orderId,
            }
          : null

        if (!next) return safeCurrent

        const filtered = safeCurrent.filter((report) => report.orderId !== orderId)
        return [next, ...filtered]
      })
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      queryClient.invalidateQueries({ queryKey: ['buyer-order-detail', orderId] })
    },
  })
}

export function useMyReports() {
  return useQuery<BuyerReport[]>({
    queryKey: ['buyer-reports'],
    queryFn: async () => {
      const raw = await buyerApi.getMyReports()
      // BE returns `reportId` — normalize so `id` is always set
      return (Array.isArray(raw) ? raw : []).map((r) => ({
        ...r,
        id: r.id ?? r.reportId ?? '',
        orderId: r.orderId ?? '',
      }))
    },
    staleTime: 1000 * 30, // 30 seconds
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
