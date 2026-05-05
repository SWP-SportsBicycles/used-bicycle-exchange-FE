'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buyerApi } from '@/lib/api/buyer-api'
import { toast } from 'sonner'

/**
 * Query: danh sách order IDs mà buyer đã review.
 * Dùng để kiểm tra nhanh order nào đã được đánh giá.
 */
export function useMyReviewedOrders() {
  return useQuery({
    queryKey: ['my-reviewed-orders'],
    queryFn: () => buyerApi.getMyReviewedOrders(),
    staleTime: 30_000,
  })
}

/**
 * Query: full review objects keyed by orderId.
 * Dùng để buyer xem lại nội dung đánh giá của mình.
 */
export function useMyReviewsAsBuyer() {
  return useQuery({
    queryKey: ['my-reviews-as-buyer'],
    queryFn: () => buyerApi.getMyReviewsAsBuyer(),
    staleTime: 30_000,
  })
}

/**
 * Mutation: gửi đánh giá cho một đơn hàng completed.
 * Sau khi thành công, invalidate cả query reviewed-orders để cập nhật UI.
 */
export function useCreateReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { orderId: string; rating: number; comment?: string }) =>
      buyerApi.createReview(data),
    onSuccess: () => {
      toast.success('Đánh giá đã được gửi thành công!')
      queryClient.invalidateQueries({ queryKey: ['my-reviewed-orders'] })
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
    },
    onError: (error: Error) => {
      const msg = error.message || 'Không thể gửi đánh giá. Vui lòng thử lại.'
      toast.error(msg)
    },
  })
}
