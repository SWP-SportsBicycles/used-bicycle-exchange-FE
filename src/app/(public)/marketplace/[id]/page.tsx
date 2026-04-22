import ListingDetailScreen from '@/modules/buyer/screens/ListingDetailScreen'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ListingDetailPageWrapper({ params }: PageProps) {
  return <ListingDetailScreen params={params} />
}
