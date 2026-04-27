import { Suspense } from 'react'
import PaymentSuccessScreen from '@/modules/buyer/screens/PaymentSuccessScreen'

/**
 * PayOS cũng có thể redirect về /payment-cancel khi user bấm "Hủy" trong cổng thanh toán.
 * Dùng lại PaymentSuccessScreen — nó đã handle trường hợp cancel=true.
 */
export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Đang xử lý...</div>}>
      <PaymentSuccessScreen />
    </Suspense>
  )
}
