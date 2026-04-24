'use client'

import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { sellerApi } from '@/lib/api/seller-api'
import SellerUpdateListingScreen from '@/modules/seller/screens/SellerUpdateListingScreen'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'

function extractListingPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const maybe = raw as { data?: unknown }
  return maybe.data ?? raw
}

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const listingId = resolvedParams.id
  
  const { language } = useLanguage()
  const router = useRouter()
  
  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ['seller-listing-detail', listingId],
    queryFn: () => sellerApi.getListingDetail(listingId),
    enabled: Boolean(listingId)
  })

  const listing = extractListingPayload(rawData)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>{language === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</p>
      </div>
    )
  }

  if (isError || !listing) {
    return (
      <div className="text-center py-20 text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-xl font-bold">
          {language === 'vi' ? 'Không tìm thấy tin đăng' : 'Listing not found'}
        </h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/seller/listings')}>
          {language === 'vi' ? 'Quay lại' : 'Go back'}
        </Button>
      </div>
    )
  }

  if (listing.status === 'published') {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">
          {language === 'vi' ? 'Không thể chỉnh sửa tin đã xuất bản' : 'Cannot edit published listing'}
        </h2>
        <p className="mb-6">
          {language === 'vi' 
            ? 'Tin đăng của bạn đang hiển thị. Để chỉnh sửa, bạn phải rút tin trước.' 
            : 'Your listing is live. You must withdraw it before editing.'}
        </p>
        <Button variant="outline" onClick={() => router.push(`/seller/listings/${listingId}`)}>
          {language === 'vi' ? 'Quay lại chi tiết' : 'Back to detail'}
        </Button>
      </div>
    )
  }

  return <SellerUpdateListingScreen listingId={listingId} initialData={listing} />
}
