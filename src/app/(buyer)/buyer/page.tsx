import BuyerDashboardScreen from '@/modules/buyer/screens/BuyerDashboardScreen'

export const metadata = {
  title: 'Tổng quan | VeloTrust',
  description: 'Quản lý đơn hàng, wishlist và hoạt động mua sắm xe đạp của bạn trên VeloTrust.',
}

export default function BuyerIndexPage() {
  return <BuyerDashboardScreen />
}
