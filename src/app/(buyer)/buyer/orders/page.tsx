import { Suspense } from 'react'
import OrderListScreen from '@/modules/buyer/screens/OrderListScreen'

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <OrderListScreen />
    </Suspense>
  )
}
