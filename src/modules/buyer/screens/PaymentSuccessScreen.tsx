'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { buyerApi } from '@/lib/api/buyer-api'

/**
 * PaymentSuccessScreen
 *
 * Trang trung gian xử lý redirect từ PayOS sau khi thanh toán.
 * PayOS redirect về: /payment-success?code=00&id=...&cancel=false&status=PAID&orderCode=...
 *
 * Vấn đề: PayOS redirect browser ngay lập tức, nhưng webhook tới backend
 * có thể mất vài giây. Nếu redirect ngay, đơn hàng vẫn còn "pending".
 *
 * Giải pháp: Poll backend GET /api/buyer-order cho đến khi có đơn nào
 * chuyển sang "paid" (tối đa 15 giây), rồi mới redirect.
 */
export default function PaymentSuccessScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const hasStarted = useRef(false)

  const code = searchParams.get('code')
  const status = searchParams.get('status')
  const cancel = searchParams.get('cancel')
  const orderCode = searchParams.get('orderCode')

  const isSuccess = code === '00' && status === 'PAID' && cancel === 'false'
  const isCancelled = cancel === 'true' || status === 'CANCELLED'

  const [pollAttempt, setPollAttempt] = useState(0)
  const MAX_POLL = 5   // 5 × 3s = 15 giây tối đa
  const POLL_INTERVAL = 3000

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    // Trường hợp hủy: redirect ngay, không cần poll
    if (isCancelled) {
      toast.error('Thanh toán đã bị hủy.')
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      router.replace('/buyer/orders')
      return
    }

    // Trường hợp không xác định
    if (!isSuccess) {
      router.replace('/buyer/orders')
      return
    }

    // Trường hợp thành công: poll backend đến khi thấy đơn "paid"
    let attempt = 0
    let cancelled = false

    const poll = async () => {
      if (cancelled) return

      try {
        const page = await buyerApi.getOrders(1, 20)
        const paidOrder = page.items.find(o => o.status === 'paid')

        if (paidOrder) {
          // Backend đã cập nhật → redirect
          queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
          queryClient.invalidateQueries({ queryKey: ['buyer-order'] })
          toast.success('Thanh toán thành công! Đơn hàng của bạn đã được ghi nhận.')
          router.replace('/buyer/orders?status=paid')
          return
        }
      } catch {
        // Ignore fetch errors, keep polling
      }

      attempt += 1
      setPollAttempt(attempt)

      if (attempt >= MAX_POLL) {
        // Đã poll đủ lần, redirect dù backend chưa cập nhật
        queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
        toast.success('Thanh toán thành công! Đơn hàng sẽ được cập nhật trong giây lát.')
        router.replace('/buyer/orders?status=paid')
        return
      }

      setTimeout(poll, POLL_INTERVAL)
    }

    // Bắt đầu poll sau 1 giây (cho webhook có thêm thời gian)
    const timer = setTimeout(poll, 1000)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {isSuccess ? (
        <>
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">Thanh toán thành công!</h1>
          <p className="mb-1 text-muted-foreground">
            Đơn hàng của bạn đã được ghi nhận.
          </p>
          {orderCode && (
            <p className="mb-6 text-sm text-muted-foreground">
              Mã giao dịch: <span className="font-mono font-semibold text-foreground">{orderCode}</span>
            </p>
          )}
        </>
      ) : isCancelled ? (
        <>
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-14 w-14 text-red-500" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">Thanh toán bị hủy</h1>
          <p className="text-muted-foreground">Bạn đã hủy giao dịch. Đơn hàng vẫn đang chờ thanh toán.</p>
        </>
      ) : (
        <>
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
            <Loader2 className="h-14 w-14 animate-spin text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">Đang xử lý...</h1>
          <p className="text-muted-foreground">Vui lòng chờ, đang kiểm tra trạng thái thanh toán.</p>
        </>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>
          {isSuccess
            ? pollAttempt === 0
              ? 'Đang kiểm tra xác nhận từ hệ thống...'
              : `Đang chờ xác nhận... (${pollAttempt}/${MAX_POLL})`
            : 'Đang chuyển hướng...'}
        </span>
      </div>
    </div>
  )
}
