import { Suspense } from 'react'
import CheckoutScreen from '@/modules/buyer/screens/CheckoutScreen'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <CheckoutScreen />
    </Suspense>
  )
}
