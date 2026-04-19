import { fetchPublicListingById } from '@/lib/api/listings'
import { getDataSourceMode } from '@/lib/config/runtime'
import { getListingById, type Listing } from '@/lib/mock-data'

export async function getListingDetail(id: string): Promise<Listing | null> {
  if (getDataSourceMode() !== 'live') {
    return getListingById(id) ?? null
  }

  try {
    const liveListing = await fetchPublicListingById(id)
    if (liveListing) {
      return liveListing
    }
  } catch {
    // Keep the detail page available when backend integration is still in progress.
  }

  return getListingById(id) ?? null
}
