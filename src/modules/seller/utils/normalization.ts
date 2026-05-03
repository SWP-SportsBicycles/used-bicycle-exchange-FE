function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function collectNestedRecords(root: unknown, maxDepth = 4): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = []
  const visited = new WeakSet<object>()

  const walk = (node: unknown, depth: number) => {
    if (!node || depth > maxDepth) return

    if (Array.isArray(node)) {
      node.forEach((entry) => walk(entry, depth + 1))
      return
    }

    const record = toRecord(node)
    if (!record) return
    if (visited.has(record)) return

    visited.add(record)
    records.push(record)

    Object.values(record).forEach((entry) => walk(entry, depth + 1))
  }

  walk(root, 0)
  return records
}

function getValueByKey(source: Record<string, unknown>, key: string): unknown {
  if (Object.prototype.hasOwnProperty.call(source, key)) {
    return source[key]
  }

  const lowered = key.toLowerCase()
  const matched = Object.keys(source).find((candidate) => candidate.toLowerCase() === lowered)
  return matched ? source[matched] : undefined
}

function pickString(records: Record<string, unknown>[], keys: string[]): string {
  for (const record of records) {
    for (const key of keys) {
      const value = getValueByKey(record, key)
      if (typeof value === 'string' && value.trim().length > 0) {
        return value
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
      }
    }
  }
  return ''
}

function pickNumber(records: Record<string, unknown>[], keys: string[]): number {
  for (const record of records) {
    for (const key of keys) {
      const value = getValueByKey(record, key)
      const parsed = typeof value === 'number' ? value : Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }
  return 0
}

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
          return pickString([record], ['image', 'url', 'path', 'thumbnail'])
        })
        .filter(Boolean)

      const rawImages = Array.isArray(raw.images) ? raw.images : []
      const images = rawImages
        .map((entry) => {
          if (typeof entry === 'string') return entry
          if (entry && typeof entry === 'object') {
            return pickString([entry as Record<string, unknown>], ['image', 'url', 'path', 'thumbnail'])
          }
          return ''
        })
        .filter((entry): entry is string => Boolean(entry))
      const thumbnail = typeof raw.thumbnail === 'string' ? raw.thumbnail : ''
      const resolvedImages = images.length > 0 ? images : mediaImages.length > 0 ? mediaImages : thumbnail ? [thumbnail] : []

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

export function normalizeOrderDetail(item: unknown, idFromUrl?: string): SellerOrderItem | null {
  if (!item || typeof item !== 'object') return null
  
  const records = collectNestedRecords(item)
  const root = toRecord(item) || {}
  

  // 1. Resolve Order ID
  let orderId = idFromUrl || ''
  const recordOrderId = String(getValueByKey(root, 'orderId') || getValueByKey(root, 'id') || '')

  if (recordOrderId) {
    // If record has a full UUID and URL has a short version, use the full one for comparison
    if (!orderId || recordOrderId.toLowerCase().includes(orderId.toLowerCase())) {
      orderId = recordOrderId
    }
  }
  
  // 2. Resolve Listing ID (be careful not to pick orderId)
  // Chỉ dùng key thực sự của listing, KHÔNG dùng bikeId/bicycleId (đó là ID của entity Bike)
  const listingIdKeys = ['listingId', 'listing_id']
  let listingId = ''
  
  // So sánh chủ yếu bằng exact match — không dùng .includes() vì có thể loại nhầm UUID hợp lệ
  const isSameAsOrder = (id: string) =>
    !id ||
    id.toLowerCase() === orderId.toLowerCase()


  // Helper function to validate UUID
  const isValidUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)

  // Strategy 1: Direct listing object extraction (chỉ dùng key 'listing', không dùng 'bike'/'bicycle')
  const listingObj = toRecord(getValueByKey(root, 'listing') || getValueByKey(root, 'product'))

  if (listingObj) {
    // Try multiple ID fields in the listing object
    const possibleIds = [
      pickString([listingObj], ['id']),
      pickString([listingObj], ['listingId']),
      pickString([listingObj], ['bicycleId']),
      pickString([listingObj], ['productId']),
      pickString([listingObj], ['bike_id']),
      pickString([listingObj], ['bicycle_id'])
    ].filter(id => id && isValidUUID(id) && !isSameAsOrder(id))
    
    if (possibleIds.length > 0) {
      listingId = possibleIds[0]
    }
  }

  // Strategy 2: Search all records for listing ID keys
  if (!listingId) {
    for (const record of records) {
      for (const key of listingIdKeys) {
        const value = getValueByKey(record, key)
        if (typeof value === 'string' && isValidUUID(value) && !isSameAsOrder(value)) {
          listingId = value
          break
        }
      }
      if (listingId) break
    }
  }

  // Strategy 3: Root level search
  if (!listingId) {
    for (const key of listingIdKeys) {
      const value = getValueByKey(root, key)
      if (typeof value === 'string' && isValidUUID(value) && !isSameAsOrder(value)) {
        listingId = value
        break
      }
    }
  }

  // Strategy 4 removed — picking any random UUID is dangerous and causes wrong navigation


  // 3. Resolve Title
  let title = ''
  // Try listing objects first (reuse the listingObj from above)
  if (listingObj) {
    title = pickString([listingObj], ['title', 'name', 'bikeName', 'bicycleName', 'bicycleTitle', 'productName', 'listingTitle'])
  }
  
  if (!title) {
    title = pickString(records, [
      'bikeName', 
      'bicycleName', 
      'bicycleTitle',
      'bicycle_title',
      'bike_title',
      'title', 
      'listingTitle', 
      'listing_title',
      'name',
      'productName',
      'product_title',
      'listingName',
      'BikeName',
      'BicycleName',
      'ListingTitle'
    ])
  }
  
  const price = pickNumber(records, ['price', 'totalAmount', 'totalPrice'])
  
  // Images
  const images: string[] = []
  const mediaKeys = ['mediaFiles', 'medias', 'media', 'images']
  for (const record of records) {
    for (const key of mediaKeys) {
      const val = getValueByKey(record, key)
      if (Array.isArray(val)) {
        val.forEach(entry => {
          if (typeof entry === 'string') images.push(entry)
          else if (entry && typeof entry === 'object') {
            const r = entry as Record<string, unknown>
            const url = String(r.url || r.image || r.path || r.thumbnail || '')
            if (url) images.push(url)
          }
        })
      }
    }
  }
  const thumbnail = pickString(records, ['thumbnail'])
  if (thumbnail && images.length === 0) images.push(thumbnail)

  // Serial Number — check root-level first (API returns serialNumber directly)
  const serialNumber = (pickString([root, ...records], ['serialNumber', 'SerialNumber', 'serial', 'frameNumber']) || 'N/A').toUpperCase()

  // Buyer Info
  const buyerName = pickString(records, ['buyerName', 'BuyerName', 'receiverName', 'fullName', 'name']) || 'Anonymous Buyer'
  const buyerPhone = pickString(records, ['buyerPhone', 'BuyerPhone', 'receiverPhone', 'phone']) || 'N/A'
  const buyerAddress = pickString(records, ['receiverAddress', 'ReceiverAddress', 'shippingAddress', 'address']) || 'N/A'
  const buyerId = pickString(records, ['buyerId', 'userId', 'customerId'])

  return {
    id: orderId,
    listing: {
      id: listingId,
      title: title || 'Untitled bike',
      price: price,
      images: Array.from(new Set(images)),
      serialNumber: serialNumber,
    },
    buyer: {
      id: buyerId,
      name: buyerName,
      phone: buyerPhone,
      address: buyerAddress,
    },
    depositAmount: pickNumber(records, ['depositAmount']),
    totalPrice: pickNumber(records, ['totalAmount', 'totalPrice', 'price']),
    status: normalizeOrderStatus(pickString(records, ['status'])),
    createdAt: pickString(records, ['createdAt']),
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
  if (normalized === '1' || normalized === 'pending' || normalized === 'pending_deposit') return 'pending'
  if (normalized === '2' || normalized === 'paid' || normalized === 'pending_seller_confirm' || normalized === 'payment_received') return 'paid'
  if (normalized === '3' || normalized === 'confirmed' || normalized === 'seller_confirmed' || normalized === 'inspection_passed') return 'confirmed'
  if (normalized === '4' || normalized === 'shipping' || normalized === 'in_transit') return 'shipping'
  if (normalized === '5' || normalized === 'delivered') return 'delivered'
  if (normalized === '6' || normalized === 'completed' || normalized === 'success' || normalized === 'finished') return 'completed'
  if (normalized === '7' || normalized === 'cancelled' || normalized === 'canceled' || normalized === 'rejected') return 'cancelled'

  // Legacy/String fallbacks
  if (normalized === 'pending_deposit') return 'pending'
  if (normalized === 'pending_seller_confirm' || normalized === 'pending_confirmation') return 'paid'
  if (normalized === 'seller_confirmed') return 'confirmed'
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

  return findArray(payload).map(item => normalizeOrderDetail(item)).filter((o): o is SellerOrderItem => Boolean(o && o.id))
}
