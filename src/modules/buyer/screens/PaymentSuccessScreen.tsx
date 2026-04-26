'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

/**
 * PaymentSuccessScreen
 *
 * Trang trung gian xử lý redirect từ PayOS sau khi thanh toán.
 * PayOS redirect về: /payment-success?code=00&id=...&cancel=false&status=PAID&orderCode=...
 *
 * Params:
 *  - code: "00" = thành công, khác = thất bại
 *  - status: "PAID" | "CANCELLED" | "PENDING"
 *  - cancel: "false" | "true"
 *  - orderCode: mã đơn hàng PayOS
 *  - id: payment link ID
 */
export default function PaymentSuccessScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const hasRedirected = useRef(false)

  const code = searchParams.get('code')
  const status = searchParams.get('status')
  const cancel = searchParams.get('cancel')
  const orderCode = searchParams.get('orderCode')

  const isSuccess = code === '00' && status === 'PAID' && cancel === 'false'
  const isCancelled = cancel === 'true' || status === 'CANCELLED'

  useEffect(() => {
    if (hasRedirected.current) return
    hasRedirected.current = true

    // Invalidate queries để refresh dữ liệu đơn hàng
    queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
    queryClient.invalidateQueries({ queryKey: ['buyer-order'] })

    const timer = setTimeout(() => {
      if (isSuccess) {
        toast.success('Thanh toán thành công! Đơn hàng của bạn đã được ghi nhận.')
        router.replace('/buyer/orders?status=paid')
      } else if (isCancelled) {
        toast.error('Thanh toán đã bị hủy.')
        router.replace('/buyer/orders')
      } else {
        // Trạng thái không xác định → về danh sách đơn hàng
        router.replace('/buyer/orders')
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [isSuccess, isCancelled, router, queryClient])

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
        <span>Đang chuyển hướng về đơn hàng...</span>
      </div>
    </div>
  )
}
