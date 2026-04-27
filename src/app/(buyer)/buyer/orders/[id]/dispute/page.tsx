import DisputeScreen from '@/modules/buyer/screens/DisputeScreen'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DisputePage({ params }: PageProps) {
  return <DisputeScreen params={params} />
}
