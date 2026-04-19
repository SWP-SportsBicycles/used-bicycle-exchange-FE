import { fetchPublicListings } from '@/lib/api/listings'
import { getDataSourceMode } from '@/lib/config/runtime'
import { MOCK_LISTINGS, type Listing } from '@/lib/mock-data'

export async function getMarketplaceListings(): Promise<Listing[]> {
  if (getDataSourceMode() !== 'live') {
    return MOCK_LISTINGS
  }

  try {
    return await fetchPublicListings()
  } catch {
    // Keep UI usable when backend is not yet available in early integration stage.
    return MOCK_LISTINGS
  }
}
