'use client'

import { useOrderAutoExpiry } from '@/modules/buyer/hooks/useOrderAutoExpiry'

/**
 * BuyerAutoExpiry — wrapper client component.
 * Đặt hook useOrderAutoExpiry ở đây để nó chạy trên mọi trang buyer.
 * Không render UI — chỉ mount side-effect.
 */
export function BuyerAutoExpiry({ children }: { children: React.ReactNode }) {
  useOrderAutoExpiry()
  return <>{children}</>
}
