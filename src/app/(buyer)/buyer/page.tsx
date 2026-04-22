import { redirect } from 'next/navigation'

/** /buyer → redirect tới trang quản lý đơn hàng */
export default function BuyerIndexPage() {
  redirect('/buyer/orders')
}
