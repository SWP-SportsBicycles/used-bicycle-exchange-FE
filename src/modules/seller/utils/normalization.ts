export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'pending'
  | 'published'
  | 'sold'
  | 'rejected'
  | 'withdrawn'

export type SellerListingItem = {
  id: string
  title: string
  price: number
  status: ListingStatus
  images: string[]
  isVeloSafeVerified: boolean
}

export function normalizeListingStatus(value: unknown): ListingStatus {
  const raw = typeof value === 'string' ? value.trim() : ''
  const normalized = raw
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()

  if (normalized === 'draft') return 'draft'
  if (normalized === 'pending_review' || normalized === 'pending') return 'pending_review'
  if (normalized === 'pending_inspection') return 'pending_review'
  if (normalized === 'published' || normalized === 'active') return 'published'
  if (normalized === 'sold' || normalized === 'completed') return 'sold'
  if (normalized === 'rejected') return 'rejected'
  if (normalized === 'withdrawn' || normalized === 'cancelled' || normalized === 'canceled') return 'withdrawn'

  return 'draft'
}

export function normalizeListingsPayload(payload: unknown): SellerListingItem[] {
  const findArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) {
      return value
    }

    if (value && typeof value === 'object') {
      const container = value as Record<string, unknown>
      const candidates = ['items', 'data', 'listings', 'results']

      for (const key of candidates) {
        if (Array.isArray(container[key])) {
          return container[key] as unknown[]
        }

        if (container[key] && typeof container[key] === 'object') {
          const nested = container[key] as Record<string, unknown>
          for (const nestedKey of candidates) {
            if (Array.isArray(nested[nestedKey])) {
              return nested[nestedKey] as unknown[]
            }
          }
        }
      }
    }

    return []
  }

  return findArray(payload)
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }

      const raw = item as Record<string, unknown>
      const medias = Array.isArray(raw.medias) ? raw.medias : []
      const mediaImages = medias
        .map((media) => {
          if (!media || typeof media !== 'object') return ''
          const record = media as Record<string, unknown>
          return typeof record.image === 'string' ? record.image : ''
        })
        .filter(Boolean)

      const images = (Array.isArray(raw.images) ? raw.images : mediaImages).filter(
        (entry): entry is string => typeof entry === 'string',
      )
      const thumbnail = typeof raw.thumbnail === 'string' ? raw.thumbnail : ''
      const resolvedImages = images.length > 0 ? images : thumbnail ? [thumbnail] : []

      const id =
        (typeof raw.id === 'string' && raw.id) ||
        (typeof raw.listingId === 'string' && raw.listingId) ||
        (typeof raw.id === 'number' && String(raw.id)) ||
        ''

      if (!id) {
        return null
      }

      return {
        id,
        title: typeof raw.title === 'string' ? raw.title : 'Untitled listing',
        price: typeof raw.price === 'number' ? raw.price : Number(raw.price ?? 0),
        status: normalizeListingStatus(raw.status),
        images: resolvedImages,
        isVeloSafeVerified: Boolean(raw.isVeloSafeVerified),
      } satisfies SellerListingItem
    })
    .filter((item): item is SellerListingItem => Boolean(item))
}

export interface SellerOrderItem {
  id: string
  listing: {
    id: string
    title: string
    price: number
    images: string[]
    serialNumber?: string
  }
  buyer: {
    id: string
    name: string
    avatar?: string
    phone?: string
    address?: string
  }
  depositAmount: number
  totalPrice: number
  status: string
  createdAt: string
}

export function normalizeOrderDetail(item: unknown): SellerOrderItem | null {
  if (!item || typeof item !== 'object') return null
  
  let raw = item as Record<string, unknown>
  // Handle API wrapper { isSuccess: true, data: { ... } }
  if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    raw = raw.data as Record<string, unknown>
  }
  // Handle nested order object { order: { ... } } or { item: { ... } }
  if (raw.order && typeof raw.order === 'object' && !Array.isArray(raw.order)) {
    raw = raw.order as Record<string, unknown>
  } else if (raw.item && typeof raw.item === 'object' && !Array.isArray(raw.item)) {
    raw = raw.item as Record<string, unknown>
  }
  
  // Attempt to resolve listing
  const listingRaw = (raw.listing || raw.bicycle || raw.bicycleResponse || {}) as Record<string, unknown>
  const listingImages = Array.isArray(listingRaw.images) 
    ? listingRaw.images 
    : (typeof listingRaw.thumbnail === 'string' ? [listingRaw.thumbnail] : [])

  // Attempt to resolve buyer
  const buyerRaw = (raw.buyer || raw.user || raw.customer || {}) as Record<string, unknown>

  return {
    id: String(raw.orderId || raw.id || ''),
    listing: {
      id: String(raw.listingId || listingRaw.id || raw.bicycleId || listingRaw.listingId || ''),
      title: String(
        raw.bikeName || 
        raw.bicycleName || 
        raw.BikeName || 
        raw.BicycleName || 
        listingRaw.title || 
        listingRaw.name || 
        listingRaw.bicycleName ||
        raw.listingTitle || 
        'Untitled bike'
      ),
      price: Number(raw.price || listingRaw.price || raw.totalAmount || 0),
      images: listingImages,
      serialNumber: String(raw.serialNumber || raw.SerialNumber || listingRaw.serialNumber || listingRaw.serial_number || 'N/A'),
    },
    buyer: {
      id: String(buyerRaw.id || raw.buyerId || ''),
      name: String(raw.buyerName || raw.BuyerName || raw.receiverName || buyerRaw.fullName || buyerRaw.name || 'Anonymous Buyer'),
      avatar: typeof buyerRaw.avatar === 'string' ? buyerRaw.avatar : undefined,
      phone: String(raw.buyerPhone || raw.BuyerPhone || raw.receiverPhone || buyerRaw.phone || 'N/A'),
      address: String(raw.receiverAddress || raw.ReceiverAddress || raw.shippingAddress || buyerRaw.address || 'N/A'),
    },
    depositAmount: Number(raw.depositAmount || 0),
    totalPrice: Number(raw.totalAmount || raw.totalPrice || raw.TotalAmount || raw.price || 0),
    status: normalizeOrderStatus(raw.status),
    createdAt: String(raw.createdAt || ''),
  }
}

export function normalizeOrderStatus(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : String(value ?? '')
  const normalized = raw
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()

  // Numeric enum mapping from backend
  if (normalized === '0' || normalized === 'locked') return 'locked'
  if (normalized === '1' || normalized === 'pending') return 'pending'
  if (normalized === '2' || normalized === 'paid') return 'paid'
  if (normalized === '3' || normalized === 'confirmed') return 'confirmed'
  if (normalized === '4' || normalized === 'shipping') return 'shipping'
  if (normalized === '5' || normalized === 'delivered') return 'delivered'
  if (normalized === '6' || normalized === 'completed') return 'completed'
  if (normalized === '7' || normalized === 'cancelled') return 'cancelled'

  // Legacy/String fallbacks
  if (normalized === 'pending_deposit') return 'pending_deposit'
  if (normalized === 'pending_seller_confirm' || normalized === 'pending_confirmation') return 'paid'
  if (normalized === 'seller_confirmed' || normalized === 'confirmed') return 'confirmed'
  if (normalized === 'pending_inspection') return 'pending'
  if (normalized === 'inspection_passed' || normalized === 'passed') return 'confirmed'
  if (normalized === 'inspection_failed' || normalized === 'failed') return 'cancelled'
  if (normalized === 'disputed') return 'disputed'

  return normalized || 'paid'
}

export function normalizeOrdersPayload(payload: unknown): SellerOrderItem[] {
  const findArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value
    if (value && typeof value === 'object') {
      const container = value as Record<string, unknown>
      const candidates = ['items', 'data', 'orders', 'results']
      for (const key of candidates) {
        if (Array.isArray(container[key])) return container[key] as unknown[]
        
        // Handle nested data.items structure
        if (container[key] && typeof container[key] === 'object') {
          const nested = container[key] as Record<string, unknown>
          if (Array.isArray(nested.items)) return nested.items
        }
      }
    }
    return []
  }

  return findArray(payload).map(normalizeOrderDetail).filter((o): o is SellerOrderItem => Boolean(o && o.id))
}
