'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin,
  Phone,
  User,
  Mail,
  Loader2,
  ChevronRight,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  History,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { formatVND } from '@/lib/mock-data'
import { inspectorApi } from '@/lib/api/inspector-api'
import { cn } from '@/lib/utils'

type ListingFilter = 'all' | 'pending'

export default function InspectorAssignedPage() {
  const { language } = useLanguage()
  const [activeStatus, setActiveStatus] = useState<ListingFilter>('pending')

  const pendingQuery = useQuery({
    queryKey: ['inspector-listings', 'pending'],
    queryFn: inspectorApi.getPendingListings,
  })

  const historyQuery = useQuery({
    queryKey: ['inspector-history', 1, 10],
    queryFn: () => inspectorApi.getHistory(1, 10),
    enabled: activeStatus === 'all',
    staleTime: 0,
    refetchOnMount: true,
  })

  const pendingListings = pendingQuery.data ?? []
  const historyData = historyQuery.data

  const listTitle =
    activeStatus === 'pending'
      ? language === 'vi'
        ? 'Tin Đăng Chờ Kiểm Định'
        : 'Pending Inspection Listings'
      : language === 'vi'
      ? 'Lịch Sử Kiểm Định'
      : 'Inspection History'

  const listDescription =
    activeStatus === 'pending'
      ? language === 'vi'
        ? 'Danh sách xe đang chờ kiểm định từ hệ thống'
        : 'Listings waiting for inspector verification'
      : language === 'vi'
      ? 'Danh sách các xe đã kiểm định'
        : 'List of inspected bikes'

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
              {language === 'vi' ? 'Lịch sử' : 'History'} ({activeStatus === 'all' && historyQuery.isLoading ? '...' : (historyData?.totalItems ?? 0)})
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
          {activeStatus === 'pending' ? (
            <PendingListingsView 
              isLoading={pendingQuery.isLoading} 
              error={pendingQuery.error} 
              listings={pendingListings}
              language={language}
            />
          ) : (
            <HistoryView 
              isLoading={historyQuery.isLoading} 
              error={historyQuery.error} 
              historyData={historyData}
              language={language}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Sub-components for different views

interface PendingListingsViewProps {
  isLoading: boolean;
  error: Error | null;
  listings: import('@/lib/api/inspector-api').InspectorPendingListing[];
  language: string;
}

function PendingListingsView({ isLoading, error, listings, language }: PendingListingsViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {language === 'vi' ? 'Đang tải danh sách...' : 'Loading listings...'}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive text-sm">
        {error instanceof Error ? error.message : language === 'vi' ? 'Tải dữ liệu thất bại' : 'Failed to load data'}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{language === 'vi' ? 'Không có xe nào chờ kiểm định' : 'No pending listings'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {listings.map((listing) => (
        <Card key={listing.id} className="border-border/70 hover:border-primary/40 transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  {listing.thumbnail ? (
                    <Image src={listing.thumbnail} alt={listing.title} width={64} height={64} className="h-full w-full object-cover" />
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
  )
}

interface HistoryViewProps {
  isLoading: boolean;
  error: Error | null;
  historyData: import('@/lib/api/inspector-api').InspectorHistoryPaginated | undefined;
  language: string;
}

function HistoryView({ isLoading, error, historyData, language }: HistoryViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {language === 'vi' ? 'Đang tải lịch sử...' : 'Loading history...'}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive text-sm">
        {error instanceof Error ? error.message : language === 'vi' ? 'Tải dữ liệu thất bại' : 'Failed to load data'}
      </div>
    )
  }

  const items = historyData?.items ?? []

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-4" />
        <p>{language === 'vi' ? 'Chưa có lịch sử kiểm định' : 'No inspection history yet'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="border-border/70 hover:border-primary/40 transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-16 w-16 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {language === 'vi' ? 'Kiểm định #' : 'Inspection #'}{item.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'vi' ? 'Điểm số' : 'Score'}: {item.score}/100
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        item.score >= 80 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : item.score >= 50 
                            ? 'bg-amber-100 text-amber-700 border-amber-200' 
                            : 'bg-red-100 text-red-700 border-red-200'
                      )}
                    >
                      {item.score >= 80 
                        ? (language === 'vi' ? 'Đạt tốt' : 'Good') 
                        : item.score >= 50 
                          ? (language === 'vi' ? 'Trung bình' : 'Average') 
                          : (language === 'vi' ? 'Yếu' : 'Poor')
                      }
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(item.inspectionDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm lg:min-w-60">
                <p className={cn('flex items-center gap-1.5', item.frame ? 'text-green-600' : 'text-red-600')}>
                  {item.frame ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {language === 'vi' ? 'Khung' : 'Frame'}
                </p>
                <p className={cn('flex items-center gap-1.5', item.paintCondition ? 'text-green-600' : 'text-red-600')}>
                  {item.paintCondition ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {language === 'vi' ? 'Sơn' : 'Paint'}
                </p>
                <p className={cn('flex items-center gap-1.5', item.drivetrain ? 'text-green-600' : 'text-red-600')}>
                  {item.drivetrain ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {language === 'vi' ? 'Truyền động' : 'Drivetrain'}
                </p>
                <p className={cn('flex items-center gap-1.5', item.brakes ? 'text-green-600' : 'text-red-600')}>
                  {item.brakes ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {language === 'vi' ? 'Phanh' : 'Brakes'}
                </p>
              </div>

              <div className="flex lg:flex-col gap-2 lg:min-w-32">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/inspector/assigned/history/${item.id}`}>
                    {language === 'vi' ? 'Chi tiết' : 'Details'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
