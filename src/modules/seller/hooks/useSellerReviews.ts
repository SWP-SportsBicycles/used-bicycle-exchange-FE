'use client'

import { useQuery } from '@tanstack/react-query'
import { buyerApi } from '@/lib/api/buyer-api'

// Flexible type — BE may return different field names
export interface SellerReview {
  listingId?: string
  listingTitle?: string
  soldAt?: string
  orderId?: string | null
  rating?: number | null
  comment?: string | null
  reviewedAt?: string | null
  // extra fields BE might return
  [key: string]: unknown
}

/**
 * Hook for seller to fetch reviews from buyers.
 * Uses GET /api/Review/my-reviews-for-seller
 */
export function useSellerReviews() {
  return useQuery<SellerReview[]>({
    queryKey: ['seller-reviews'],
    queryFn: async () => {
      const data = await buyerApi.getMyReviewsForSeller()
      if (process.env.NODE_ENV === 'development') {
        console.debug('[useSellerReviews] raw API response:', JSON.stringify(data, null, 2))
      }
      return (data as SellerReview[]) ?? []
    },
    staleTime: 60_000,
  })
}
