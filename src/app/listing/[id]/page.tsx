/**
 * Route cũ /listing/[id] — đã được thay thế bởi /marketplace/[id]
 * Giữ redirect để không làm hỏng các link cũ đã được chia sẻ.
 */
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OldListingRoute({ params }: PageProps) {
  const { id } = await params
  redirect(`/marketplace/${id}`)
}
