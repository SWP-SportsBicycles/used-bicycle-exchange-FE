'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { buyerApi } from '@/lib/api/buyer-api'
import { toast } from 'sonner'

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => buyerApi.cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      toast.success('Đã hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      queryClient.invalidateQueries({ queryKey: ['buyer-order-detail', orderId] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi hủy đơn hàng')
    }
  })
}
