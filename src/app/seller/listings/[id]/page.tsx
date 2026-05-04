'use client'

import React, { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Send, EyeOff, AlertTriangle, AlertCircle, RefreshCw, Edit } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { sellerApi } from '@/lib/api/seller-api'
import {
  useDeleteListing,
  useSubmitListing,
  useWithdrawListing,
  useResubmitListing,
} from '@/modules/seller/hooks/useSellerListingMutations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLanguage } from '@/lib/language-context'
import { formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type ListingStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'withdrawn' | 'sold'

type ListingMediaKind = 'image' | 'video'

type ListingMediaItem = {
  url: string
  kind: ListingMediaKind
}

type SellerListingDetail = {
  id: string
  title: string
  status: ListingStatus
  serialNumber: string
  brand: string
  category: string
  condition: string
  frameSize: string
  weight: number
  frameMaterial: string
  groupset: string
  tireRim: string
  operating: string
  brakeType: string
  paint: string
  overall: string
  city: string
  description: string
  price: number
  rejectReason: string
  mediaItems: ListingMediaItem[]
}

function normalizeStatus(value: unknown): ListingStatus {
  const raw = typeof value === 'string' ? value.trim() : ''
  const normalized = raw
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()

  if (normalized === 'published' || normalized === 'active') return 'published'
  if (normalized === 'pending_review' || normalized === 'pending' || normalized === 'pending_inspection') return 'pending_review'
  if (normalized === 'rejected') return 'rejected'
  if (normalized === 'withdrawn' || normalized === 'cancelled' || normalized === 'canceled') return 'withdrawn'
  if (normalized === 'sold' || normalized === 'completed') return 'sold'
  return 'draft'
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function collectNestedRecords(root: Record<string, unknown>, maxDepth = 5): Record<string, unknown>[] {
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

    Object.values(record).forEach((value) => walk(value, depth + 1))
  }

  walk(root, 0)
  return records
}

function getValueByKey(source: Record<string, unknown>, key: string): unknown {
  if (Object.prototype.hasOwnProperty.call(source, key)) {
    return source[key]
  }

  const loweredKey = key.toLowerCase()
  const matchedKey = Object.keys(source).find((candidate) => candidate.toLowerCase() === loweredKey)
  return matchedKey ? source[matchedKey] : undefined
}

function pickString(records: Record<string, unknown>[], keys: string[]): string {
  for (const record of records) {
    for (const key of keys) {
      const value = getValueByKey(record, key)
      if (typeof value === 'string' && value.trim().length > 0) {
        return value
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

function unwrapListingPayload(payload: unknown): Record<string, unknown> | null {
  let current = payload

  for (let depth = 0; depth < 4; depth += 1) {
    const record = toRecord(current)
    if (!record) return null

    const nested =
      toRecord(record.data) ??
      toRecord(record.result) ??
      toRecord(record.item) ??
      toRecord(record.listing)

    if (!nested) return record
    current = nested
  }

  return toRecord(current)
}

function isRenderableMediaUrl(url: string): boolean {
  const normalized = url.trim()
  if (!normalized) return false

  return (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('/') ||
    normalized.startsWith('data:image/') ||
    normalized.startsWith('data:video/')
  )
}

function inferMediaKind(url: string, typeHint?: string): ListingMediaKind {
  const hint = (typeHint ?? '').toLowerCase()
  if (hint.includes('video') || hint === '1') {
    return 'video'
  }

  const normalized = url.toLowerCase()
  if (
    normalized.includes('/video/upload/') ||
    normalized.endsWith('.mp4') ||
    normalized.endsWith('.webm') ||
    normalized.endsWith('.ogg') ||
    normalized.endsWith('.mov') ||
    normalized.endsWith('.m3u8')
  ) {
    return 'video'
  }

  return 'image'
}

function normalizeMediaItems(records: Record<string, unknown>[]): ListingMediaItem[] {
  const mediaEntries: unknown[] = []
  const mediaKeys = ['mediaFiles', 'medias', 'media', 'images']

  for (const record of records) {
    for (const key of mediaKeys) {
      const maybeArray = getValueByKey(record, key)
      if (Array.isArray(maybeArray)) {
        mediaEntries.push(...maybeArray)
      }
    }
  }

  const mediaItems = mediaEntries
    .map((entry) => {
      if (typeof entry === 'string') {
        return isRenderableMediaUrl(entry)
          ? { url: entry, kind: inferMediaKind(entry) }
          : null
      }

      const mediaRecord = toRecord(entry)
      if (!mediaRecord) return null

      const url = pickString([mediaRecord], ['url', 'image', 'videoUrl', 'thumbnail', 'path'])
      if (!isRenderableMediaUrl(url)) return null

      const typeHint = pickString([mediaRecord], ['type', 'mediaType', 'resourceType', 'mimeType'])
      return {
        url,
        kind: inferMediaKind(url, typeHint),
      }
    })
    .filter((item): item is ListingMediaItem => Boolean(item))

  const thumbnail = pickString(records, ['thumbnail'])
  if (thumbnail && isRenderableMediaUrl(thumbnail)) {
    mediaItems.unshift({ url: thumbnail, kind: inferMediaKind(thumbnail) })
  }

  const deduped = new Map<string, ListingMediaItem>()
  mediaItems.forEach((item) => {
    if (!deduped.has(item.url)) {
      deduped.set(item.url, item)
    }
  })

  return Array.from(deduped.values())
}

function normalizeListingDetail(payload: unknown): SellerListingDetail | null {
  const source = unwrapListingPayload(payload)
  if (!source) return null
  const records = collectNestedRecords(source)

  const id = pickString(records, ['id', 'listingId'])
  const title = pickString(records, ['title', 'listingTitle']) || 'Untitled'

  return {
    id,
    title,
    status: normalizeStatus(pickString(records, ['status'])),
    serialNumber: pickString(records, ['serialNumber', 'serial', 'frameNumber']).toUpperCase(),
    brand: pickString(records, ['brand']),
    category: pickString(records, ['category']),
    condition: pickString(records, ['condition']),
    frameSize: pickString(records, ['frameSize', 'size']),
    weight: pickNumber(records, ['weight']),
    frameMaterial: pickString(records, ['frameMaterial']),
    groupset: pickString(records, ['groupset']),
    tireRim: pickString(records, ['tireRim', 'wheelSize']),
    operating: pickString(records, ['operating', 'usageHistory']),
    brakeType: pickString(records, ['brakeType']),
    paint: pickString(records, ['paint']),
    overall: pickString(records, ['overall']),
    city: pickString(records, ['city', 'location']),
    description: pickString(records, ['description']),
    price: pickNumber(records, ['price']),
    rejectReason: pickString(records, ['rejectReason', 'rejectionReason']),
    mediaItems: normalizeMediaItems(records),
  }
}

export default function SellerListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const listingId = resolvedParams.id
  
  const { language } = useLanguage()
  const router = useRouter()
  
  const { data: rawData, isLoading, isError, refetch } = useQuery({
    queryKey: ['seller-listing-detail', listingId],
    queryFn: () => {
      console.log('DEBUG Listing Detail Page - Fetching listing with ID:', listingId)
      return sellerApi.getListingDetail(listingId)
    },
    enabled: Boolean(listingId)
  })

  // DEBUG: Log the API response
  console.log('DEBUG Listing Detail Page - Raw API response:', rawData)
  console.log('DEBUG Listing Detail Page - Is error:', isError)

  const submitMutation = useSubmitListing()
  const withdrawMutation = useWithdrawListing()
  const deleteMutation = useDeleteListing()
  const resubmitMutation = useResubmitListing()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [confirmAction, setConfirmAction] = React.useState<'submit' | 'resubmit' | null>(null)
  const [termsAccepted, setTermsAccepted] = React.useState(false)

  const openConfirmAction = (action: 'submit' | 'resubmit') => {
    setTermsAccepted(false)
    setConfirmAction(action)
  }

  const listing = normalizeListingDetail(rawData)

  const handleAction = async (action: 'submit' | 'withdraw' | 'delete' | 'resubmit') => {
    try {
      if (action === 'submit') {
        await submitMutation.mutateAsync(listingId)
        refetch()
      } else if (action === 'resubmit') {
        await resubmitMutation.mutateAsync(listingId)
        refetch()
      } else if (action === 'withdraw') {
        await withdrawMutation.mutateAsync(listingId)
        refetch()
      } else if (action === 'delete') {
        await deleteMutation.mutateAsync(listingId)
        setIsDeleteDialogOpen(false)
        router.push('/seller/listings')
      }
    } catch (error) {
      console.error(error)
      // handle error notification if needed
    }
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    await handleAction(confirmAction)
    setConfirmAction(null)
    setTermsAccepted(false)
  }

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse">{language === 'vi' ? 'Đang tải tin đăng...' : 'Loading listing...'}</div>
  }

  if (isError || !listing) {
    return (
      <div className="text-center py-20 text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-xl font-bold">{language === 'vi' ? 'Không tìm thấy tin đăng' : 'Listing not found'}</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          {language === 'vi' 
            ? 'Tin đăng này có thể đã bị xóa, ẩn, hoặc bạn không có quyền truy cập. Vui lòng kiểm tra lại ID tin đăng.' 
            : 'This listing may have been deleted, withdrawn, or you may not have permission to access it. Please check the listing ID.'}
        </p>
        <div className="mt-6 space-y-2">
          <Button variant="outline" className="mt-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Thử lại' : 'Try Again'}
          </Button>
          <Button variant="outline" className="mt-2" onClick={() => router.push('/seller/listings')}>
            {language === 'vi' ? 'Quay lại danh sách' : 'Back to Listings'}
          </Button>
        </div>
      </div>
    )
  }

  const statusMap: Record<ListingStatus, { label: string, color: string }> = {
    draft: { label: language === 'vi' ? 'Bản nháp' : 'Draft', color: 'bg-muted text-muted-foreground' },
    pending_review: { label: language === 'vi' ? 'Đang chờ duyệt' : 'Pending', color: 'bg-warning/20 text-warning-foreground' },
    published: { label: language === 'vi' ? 'Đang hiển thị' : 'Published', color: 'bg-success/20 text-success-foreground' },
    rejected: { label: language === 'vi' ? 'Bị từ chối' : 'Rejected', color: 'bg-destructive/20 text-destructive' },
    withdrawn: { label: language === 'vi' ? 'Đã ẩn' : 'Withdrawn', color: 'bg-muted text-muted-foreground' },
    sold: { label: language === 'vi' ? 'Đã bán' : 'Sold', color: 'bg-primary/20 text-primary-foreground' },
  }

  const currentStatus = listing.status || 'draft'
  const isSubmitDisabled = submitMutation.isPending || currentStatus !== 'draft'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/seller/listings" className="hover:text-foreground transition-colors flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {language === 'vi' ? 'Quay lại danh sách' : 'Back to listings'}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">{listing.title || 'Untitled'}</h1>
          <Badge className={cn('text-sm', statusMap[currentStatus].color)}>
            {statusMap[currentStatus].label}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {currentStatus === 'draft' && (
            <Button onClick={() => openConfirmAction('submit')} disabled={isSubmitDisabled} className="bg-primary text-primary-foreground">
              <Send className="h-4 w-4 mr-2" />
              Gửi duyệt
            </Button>
          )}

          {currentStatus === 'rejected' && (
            <Button onClick={() => openConfirmAction('resubmit')} disabled={resubmitMutation.isPending} className="bg-primary text-primary-foreground">
              <Send className="h-4 w-4 mr-2" />
              {language === 'vi' ? 'Gửi duyệt lại' : 'Resubmit'}
            </Button>
          )}

          {(currentStatus === 'published' || currentStatus === 'pending_review') && (
            <Button onClick={() => handleAction('withdraw')} disabled={withdrawMutation.isPending} variant="destructive">
              <EyeOff className="h-4 w-4 mr-2" />
              {language === 'vi' ? 'Rút tin này' : 'Withdraw'}
            </Button>
          )}

          {(currentStatus === 'draft' || currentStatus === 'rejected') && (
            <Button variant="outline" asChild>
              <Link href={`/seller/listings/${listingId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                {language === 'vi' ? 'Cập nhật' : 'Update'}
              </Link>
            </Button>
          )}

          {(currentStatus === 'draft' || currentStatus === 'rejected' || currentStatus === 'withdrawn') && (
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4 mr-2" />
              {language === 'vi' ? 'Xóa tin' : 'Delete'}
            </Button>
          )}
        </div>
      </div>

      {currentStatus === 'rejected' && listing.rejectReason && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{language === 'vi' ? 'Tin bị từ chối' : 'Listing Rejected'}</AlertTitle>
          <AlertDescription>
            {language === 'vi' ? 'Lý do: ' : 'Reason: '} {listing.rejectReason}
          </AlertDescription>
        </Alert>
      )}

      {currentStatus === 'published' && (
          <Alert className="border-info bg-info/10 text-info-foreground">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {language === 'vi' 
                ? 'Theo chính sách, bạn không thể chỉnh sửa tin khi đã được xuất bản để đảm bảo minh bạch. Bạn chỉ có thể ẩn hoặc tạo tin mới.' 
                : 'As per policy, published listings cannot be edited for transparency. You may withdraw it or create a new one.'}
            </AlertDescription>
          </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
             <CardTitle>{language === 'vi' ? 'Thông Số' : 'Specifications'}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Serial</p>
              <p className="font-medium">{listing.serialNumber || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Thương hiệu' : 'Brand'}</p>
              <p className="font-medium">{listing.brand || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Loại xe' : 'Category'}</p>
              <p className="font-medium">{listing.category || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Tình trạng' : 'Condition'}</p>
              <p className="font-medium">{listing.condition || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Kích cỡ' : 'Size'}</p>
              <p className="font-medium">{listing.frameSize || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Trọng lượng (kg)' : 'Weight (kg)'}</p>
              <p className="font-medium">{listing.weight || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Chất liệu khung' : 'Frame material'}</p>
              <p className="font-medium">{listing.frameMaterial || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Groupset</p>
              <p className="font-medium">{listing.groupset || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Lốp/Vành' : 'Tire/Rim'}</p>
              <p className="font-medium">{listing.tireRim || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Bộ phanh' : 'Brake type'}</p>
              <p className="font-medium">{listing.brakeType || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Sơn' : 'Paint'}</p>
              <p className="font-medium">{listing.paint || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Đánh giá tổng thể' : 'Overall'}</p>
              <p className="font-medium">{listing.overall || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Tỉnh/Thành phố' : 'City'}</p>
              <p className="font-medium">{listing.city || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Lịch sử sử dụng' : 'Usage history'}</p>
              <p className="font-medium">{listing.operating || '-'}</p>
            </div>
            <div className="col-span-2 mt-4">
               <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Mô tả chi tiết' : 'Description'}</p>
               <p className="font-medium whitespace-pre-wrap">{listing.description || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
             <CardTitle>{language === 'vi' ? 'Giá & Thu Nhập' : 'Price & Earnings'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center text-lg">
                <span className="text-muted-foreground">{language === 'vi' ? 'Giá bán' : 'Price'}</span>
                <span className="font-bold">{formatVND(listing.price || 0)}</span>
             </div>
             <div className="flex justify-between items-center text-sm border-t pt-4">
                <span className="text-muted-foreground">{language === 'vi' ? 'Phí nền tảng (5%)' : 'Platform fee (5%)'}</span>
                <span>{formatVND((listing.price || 0) * 0.05)}</span>
             </div>
             <div className="flex justify-between items-center text-base border-t pt-2">
                <span className="font-medium text-success">{language === 'vi' ? 'Thực nhận' : 'Net earning'}</span>
                <span className="font-bold text-success">{formatVND((listing.price || 0) * 0.95)}</span>
             </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
             <CardTitle>{language === 'vi' ? 'Hình Ảnh / Video' : 'Media'}</CardTitle>
          </CardHeader>
          <CardContent>
             {listing.mediaItems.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {listing.mediaItems.map((media, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      {media.kind === 'video' ? (
                        <video
                          src={media.url}
                          className="h-full w-full object-cover"
                          controls
                          preload="metadata"
                          playsInline
                        />
                      ) : (
                        <Image src={media.url} alt="Media" fill className="object-cover" />
                      )}
                    </div>
                  ))}
               </div>
             ) : (
                <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
                   {language === 'vi' ? 'Không có hình ảnh đính kèm.' : 'No images available.'}
                </div>
             )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null)
            setTermsAccepted(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'resubmit'
                ? language === 'vi' ? 'Xác nhận gửi duyệt lại' : 'Confirm resubmission'
                : language === 'vi' ? 'Xác nhận gửi duyệt' : 'Confirm submission'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'vi'
                ? 'Vui lòng kiểm tra lại toàn bộ thông tin, hình ảnh và giá bán. Tin đăng sẽ được chuyển tới quản trị viên xét duyệt. Hãy đọc kỹ điều khoản người dùng trước khi xác nhận.'
                : 'Please review all information, photos, and pricing. Your listing will be sent for admin review. Read the user terms carefully before confirming.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label
            htmlFor={`detail-terms-ack-${confirmAction ?? 'submit'}`}
            className="flex cursor-pointer items-start gap-2 rounded-md border border-border/70 bg-muted/30 p-3 text-sm text-foreground"
          >
            <Checkbox
              id={`detail-terms-ack-${confirmAction ?? 'submit'}`}
              checked={termsAccepted}
              onCheckedChange={(value) => setTermsAccepted(Boolean(value))}
              className="mt-0.5 h-5 w-5 shrink-0 rounded-sm border-2 border-primary/50 bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <span>
              {language === 'vi'
                ? 'Tôi đã đọc và đồng ý với điều khoản người dùng.'
                : 'I have read and agree to the user terms.'}
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitMutation.isPending || resubmitMutation.isPending}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={
                !termsAccepted ||
                submitMutation.isPending ||
                resubmitMutation.isPending
              }
            >
              {submitMutation.isPending || resubmitMutation.isPending
                ? language === 'vi' ? 'Đang gửi...' : 'Submitting...'
                : language === 'vi' ? 'Xác nhận' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'vi' ? 'Xóa mục này?' : 'Delete this item?'}</DialogTitle>
            <DialogDescription>
              {language === 'vi' 
                ? 'Mục này sẽ bị xóa vĩnh viễn và không thể khôi phục.'
                : 'This will permanently delete the listing and it cannot be recovered.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={() => handleAction('delete')} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {language === 'vi' ? 'Chắc chắn xóa' : 'Yes, Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
