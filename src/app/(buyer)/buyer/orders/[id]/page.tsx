import OrderDetailScreen from '@/modules/buyer/screens/OrderDetailScreen'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailPage({ params }: PageProps) {
  return <OrderDetailScreen params={params} />
}
