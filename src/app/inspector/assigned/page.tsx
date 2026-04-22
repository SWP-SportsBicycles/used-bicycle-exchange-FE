'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Eye,
  MapPin,
  Phone,
  User,
  Mail,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { formatVND } from '@/lib/mock-data'
import { inspectorApi } from '@/lib/api/inspector-api'

type ListingFilter = 'all' | 'pending'

export default function InspectorAssignedPage() {
  const { language } = useLanguage()
  const [activeStatus, setActiveStatus] = useState<ListingFilter>('pending')

  const pendingQuery = useQuery({
    queryKey: ['inspector-listings', 'pending'],
    queryFn: inspectorApi.getPendingListings,
  })

  const pendingListings = pendingQuery.data ?? []
  const allListings: typeof pendingListings = []

  const filteredListings = activeStatus === 'pending' ? pendingListings : allListings

  const listTitle =
    activeStatus === 'pending'
      ? language === 'vi'
        ? 'Tin Đăng Chờ Kiểm Định'
        : 'Pending Inspection Listings'
      : language === 'vi'
      ? 'Tất Cả Tin Đăng'
      : 'All Listings'

  const listDescription =
    activeStatus === 'pending'
      ? language === 'vi'
        ? 'Danh sách xe đang chờ kiểm định từ hệ thống'
        : 'Listings waiting for inspector verification'
      : language === 'vi'
      ? 'API tất cả chưa sẵn sàng, vui lòng dùng bộ lọc chờ duyệt'
      : 'All-listings API is not ready yet, please use pending filter'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            {language === 'vi' ? 'Kiểm định xe' : 'Bike Inspection'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'vi'
              ? 'Danh sách xe cần kiểm định từ hệ thống'
              : 'Listings assigned for inspection from API'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={activeStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveStatus('all')}
            >
              {language === 'vi' ? 'Tất cả' : 'All'} ({allListings.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeStatus === 'pending' ? 'default' : 'outline'}
              onClick={() => setActiveStatus('pending')}
            >
              {language === 'vi' ? 'Chờ duyệt' : 'Pending'} ({pendingListings.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{listTitle}</CardTitle>
          <CardDescription>{listDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingQuery.isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'vi' ? 'Đang tải danh sách...' : 'Loading listings...'}
            </div>
          ) : pendingQuery.error ? (
            <div className="text-center py-8 text-destructive text-sm">
              {pendingQuery.error instanceof Error ? pendingQuery.error.message : language === 'vi' ? 'Tải dữ liệu thất bại' : 'Failed to load data'}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="border-border/70 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          {listing.thumbnail ? (
                            <img src={listing.thumbnail} alt={listing.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{listing.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {listing.brand || '-'} • {formatVND(listing.price)}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {language === 'vi' ? 'Chờ duyệt' : 'Pending'}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {listing.city || (language === 'vi' ? 'Chưa cập nhật' : 'N/A')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground lg:min-w-85">
                        <p className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {listing.sellerName || (language === 'vi' ? 'Chưa cập nhật' : 'Unknown')}
                        </p>
                        {listing.sellerEmail ? (
                          <p className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {listing.sellerEmail}
                          </p>
                        ) : null}
                        {listing.sellerPhone ? (
                          <p className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {listing.sellerPhone}
                          </p>
                        ) : null}
                        {listing.sellerAddress ? (
                          <p className="sm:col-span-2 flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 mt-0.5" />
                            <span>{listing.sellerAddress}</span>
                          </p>
                        ) : null}
                      </div>

                      <div className="flex lg:flex-col gap-2 lg:min-w-40">
                        <Button asChild className="flex-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25">
                          <Link href={`/inspector/assigned/${listing.id}`}>
                            {language === 'vi' ? 'Bắt đầu kiểm' : 'Start inspection'}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeStatus === 'all' ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4" />
              <p>{language === 'vi' ? 'Chưa có API Tất cả cho Inspector' : 'All-listings API is not available for Inspector yet'}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{language === 'vi' ? 'Không có xe nào chờ kiểm định' : 'No pending listings'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
