'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { buyerApi } from '@/lib/api/buyer-api'
import { getExpiringOrders, removeExpiringOrder } from '@/lib/order-expiry'

/**
 * useOrderAutoExpiry
 *
 * Đặt ở buyer layout hoặc root provider.
 * Khi mount, đọc tất cả đơn hàng đang chờ expiry từ localStorage:
 *  - Đơn đã hết hạn → cancel ngay lập tức (silent)
 *  - Đơn chưa hết hạn → set timeout để cancel đúng lúc
 *
 * Không cần user đang ở CheckoutScreen.
 */
export function useOrderAutoExpiry() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const orders = getExpiringOrders()
    const timers: ReturnType<typeof setTimeout>[] = []

    const cancelExpiredOrder = async (orderId: string, silent = false) => {
      removeExpiringOrder(orderId)
      try {
        await buyerApi.cancelOrder(orderId)
        queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
        queryClient.invalidateQueries({ queryKey: ['buyer-order-detail', orderId] })
        if (!silent) {
          toast.info('Một đơn hàng đã hết thời gian thanh toán và bị hủy tự động.')
        }
      } catch {
        // Order may already be paid or cancelled — silent fail is OK
      }
    }

    const now = Date.now()
    Object.entries(orders).forEach(([orderId, expiresAtStr]) => {
      const expiresAt = new Date(expiresAtStr).getTime()
      const msUntilExpiry = expiresAt - now

      if (msUntilExpiry <= 0) {
        // Đã hết hạn trong khi user offline → cancel ngay, silent
        cancelExpiredOrder(orderId, true)
      } else {
        // Chưa hết hạn → set timeout
        const timer = setTimeout(() => {
          cancelExpiredOrder(orderId, false)
        }, msUntilExpiry)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [queryClient])
}
