import { httpGet } from '@/lib/api/http'
import type { Listing } from '@/lib/mock-data'

type ApiCity = 'HN' | 'SG' | 'DN' | 'hanoi' | 'hcm' | 'danang'

interface ApiSeller {
  id: string
  name: string
  rating?: number
  totalSales?: number
  memberSince?: string
  phone?: string
  address?: string
}

interface ApiListing {
  id: string
  title: string
  price: number
  description?: string
  category: 'road' | 'mtb' | 'gravel' | 'urban'
  brand: string
  model: string
  frameSize?: string
  frameMaterial?: string
  groupset?: string
  wheelSize?: string
  condition: 'like_new' | 'excellent' | 'good' | 'fair'
  usageHistory?: string
  frame_serial?: string
  serial?: string
  city_code?: ApiCity
  city?: ApiCity
  images?: string[]
  status?: Listing['status']
  isVeloSafeVerified?: boolean
  seller: ApiSeller
  createdAt: string
  updatedAt?: string
}

interface ApiListingsResponse {
  data: ApiListing[]
}

interface ApiListingResponse {
  data: ApiListing
}

function mapCity(city?: ApiCity): Listing['city'] {
  if (city === 'HN' || city === 'hanoi') return 'hanoi'
  if (city === 'SG' || city === 'hcm') return 'hcm'
  return 'danang'
}

function mapApiListing(item: ApiListing): Listing {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    description: item.description || '',
    category: item.category,
    brand: item.brand,
    model: item.model,
    frameSize: item.frameSize || 'M',
    frameMaterial: item.frameMaterial || 'Unknown',
    groupset: item.groupset || 'Unknown',
    wheelSize: item.wheelSize || '700c',
    condition: item.condition,
    usageHistory: item.usageHistory,
    serial: item.serial || item.frame_serial || 'N/A',
    city: mapCity(item.city_code || item.city),
    images: item.images && item.images.length > 0 ? item.images : ['/placeholder.svg'],
    status: item.status || 'published',
    isVeloSafeVerified: Boolean(item.isVeloSafeVerified),
    seller: {
      id: item.seller.id,
      name: item.seller.name,
      rating: item.seller.rating ?? 0,
      totalSales: item.seller.totalSales ?? 0,
      memberSince: item.seller.memberSince || item.createdAt,
      phone: item.seller.phone,
      address: item.seller.address,
    },
    createdAt: item.createdAt,
    updatedAt: item.updatedAt || item.createdAt,
  }
}

export async function fetchPublicListings(): Promise<Listing[]> {
  const response = await httpGet<ApiListingsResponse | ApiListing[]>('/api/v1/listings')
  const rows = Array.isArray(response) ? response : response.data
  return rows.map(mapApiListing)
}

export async function fetchPublicListingById(id: string): Promise<Listing | null> {
  const response = await httpGet<ApiListingResponse | ApiListing>(`/api/v1/listings/${id}`)
  const row = Array.isArray(response)
    ? response[0]
    : 'data' in response
      ? response.data
      : response

  if (!row) {
    return null
  }

  return mapApiListing(row)
}
