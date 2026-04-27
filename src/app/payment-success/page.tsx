import { Suspense } from 'react'
import PaymentSuccessScreen from '@/modules/buyer/screens/PaymentSuccessScreen'

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Đang xử lý...</div>}>
      <PaymentSuccessScreen />
    </Suspense>
  )
}
