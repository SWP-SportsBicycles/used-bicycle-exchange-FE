'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { useLanguage } from '@/lib/language-context'
import { MOCK_LISTINGS, formatVND } from '@/lib/mock-data'
import { useDeleteListing, useSubmitListing, useWithdrawListing } from '@/modules/seller/hooks/useSellerListingMutations'
import { useSellerListings } from '@/modules/seller/hooks/useSellerListings'
import { cn } from '@/lib/utils'

type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'pending'
  | 'published'
  | 'sold'
  | 'rejected'
  | 'withdrawn'

type SellerListingItem = {
  id: string
  title: string
  price: number
  status: ListingStatus
  images: string[]
  isVeloSafeVerified: boolean
}

type ConfirmAction = 'submit' | 'withdraw' | 'delete'

function normalizeListingStatus(value: unknown): ListingStatus {
  const raw = typeof value === 'string' ? value : ''
  if (
    raw === 'draft' ||
    raw === 'pending_review' ||
    raw === 'pending' ||
    raw === 'published' ||
    raw === 'sold' ||
    raw === 'rejected' ||
    raw === 'withdrawn'
  ) {
    return raw
  }
  return 'draft'
}

function normalizeListingsPayload(payload: unknown): SellerListingItem[] {
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

      const id =
        (typeof raw.id === 'string' && raw.id) ||
        (typeof raw.listingId === 'string' && raw.listingId) ||
        ''

      if (!id) {
        return null
      }

      return {
        id,
        title: typeof raw.title === 'string' ? raw.title : 'Untitled listing',
        price: typeof raw.price === 'number' ? raw.price : Number(raw.price ?? 0),
        status: normalizeListingStatus(raw.status),
        images,
        isVeloSafeVerified: Boolean(raw.isVeloSafeVerified),
      } satisfies SellerListingItem
    })
    .filter((item): item is SellerListingItem => Boolean(item))
}

function mapMockToSellerListings(): SellerListingItem[] {
  return MOCK_LISTINGS.slice(0, 6).map((listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    status: normalizeListingStatus(listing.status),
    images: listing.images,
    isVeloSafeVerified: Boolean(listing.isVeloSafeVerified),
  }))
}

export default function SellerListingsPage() {
  const { language } = useLanguage()
  const { data, isLoading, isError, error } = useSellerListings({ pageNumber: 1, pageSize: 10 })
  const submitMutation = useSubmitListing()
  const withdrawMutation = useWithdrawListing()
  const deleteMutation = useDeleteListing()
  const [confirmState, setConfirmState] = useState<{ action: ConfirmAction; listing: SellerListingItem } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const isActionPending = submitMutation.isPending || withdrawMutation.isPending || deleteMutation.isPending

  const myListings = useMemo(() => {
    if (isError) {
      return mapMockToSellerListings()
    }
    return normalizeListingsPayload(data)
  }, [data, isError])

  const resolveStatusLabel = (status: ListingStatus) => {
    if (status === 'published') return language === 'vi' ? 'Đang bán' : 'Active'
    if (status === 'pending_review' || status === 'pending') return language === 'vi' ? 'Chờ duyệt' : 'Pending'
    if (status === 'sold') return language === 'vi' ? 'Đã bán' : 'Sold'
    if (status === 'rejected') return language === 'vi' ? 'Bị từ chối' : 'Rejected'
    if (status === 'withdrawn') return language === 'vi' ? 'Đã rút' : 'Withdrawn'
    return language === 'vi' ? 'Nháp' : 'Draft'
  }

  const resolveStatusClass = (status: ListingStatus) => {
    if (status === 'published') return 'bg-[#407F3E]/15 text-[#407F3E]'
    if (status === 'pending_review' || status === 'pending') return 'bg-amber-100 text-amber-700'
    if (status === 'rejected' || status === 'withdrawn') return 'bg-rose-100 text-rose-700'
    if (status === 'sold') return 'bg-slate-200 text-slate-700'
    return 'bg-muted text-muted-foreground'
  }

  const executeAction = async () => {
    if (!confirmState) return

    setActionError(null)

    try {
      if (confirmState.action === 'submit') {
        await submitMutation.mutateAsync(confirmState.listing.id)
      } else if (confirmState.action === 'withdraw') {
        await withdrawMutation.mutateAsync(confirmState.listing.id)
      } else {
        await deleteMutation.mutateAsync(confirmState.listing.id)
      }
      setConfirmState(null)
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : language === 'vi'
            ? 'Thao tác thất bại. Vui lòng thử lại.'
            : 'Action failed. Please try again.',
      )
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{language === 'vi' ? 'Tin Đăng Của Tôi' : 'My Listings'}</CardTitle>
          <CardDescription>
            {language === 'vi' ? 'Quản lý xe đang bán' : 'Manage your bikes'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/seller/listings/new" className="gap-1">
            {language === 'vi' ? 'Đăng tin mới' : 'Create listing'}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {isError && (
          <Alert className="mb-4 border-amber-300 bg-amber-50 text-amber-900">
            <AlertDescription>
              {language === 'vi'
                ? 'Không thể tải dữ liệu từ API, đang hiển thị dữ liệu fallback.'
                : 'Unable to load API data, showing fallback mock data.'}
              {error instanceof Error ? ` (${error.message})` : ''}
            </AlertDescription>
          </Alert>
        )}

        {actionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'vi' ? 'Đang tải tin đăng...' : 'Loading listings...'}
          </div>
        ) : myListings.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {language === 'vi' ? 'Bạn chưa có tin đăng nào.' : 'You do not have any listings yet.'}
          </div>
        ) : (
        <div className="space-y-4">
          {myListings.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center gap-4 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={listing.images[0] ?? '/placeholder.svg'}
                  alt={listing.title}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{listing.title}</p>
                <p className="text-xs text-muted-foreground">{formatVND(listing.price)}</p>
              </div>

              <div className="flex items-center gap-2">
                {listing.isVeloSafeVerified && <CheckCircle2 className="h-4 w-4 text-[#407F3E]" />}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    resolveStatusClass(listing.status)
                  )}
                >
                  {resolveStatusLabel(listing.status)}
                </Badge>

                {listing.status === 'draft' && (
                  <Button size="sm" variant="outline" onClick={() => setConfirmState({ action: 'submit', listing })}>
                    {language === 'vi' ? 'Gửi duyệt' : 'Submit'}
                  </Button>
                )}

                {(listing.status === 'draft' || listing.status === 'rejected' || listing.status === 'withdrawn') && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/seller/listings/${listing.id}/edit`}>
                      {language === 'vi' ? 'Sửa' : 'Edit'}
                    </Link>
                  </Button>
                )}

                {listing.status === 'published' && (
                  <Button size="sm" variant="outline" onClick={() => setConfirmState({ action: 'withdraw', listing })}>
                    {language === 'vi' ? 'Rút tin' : 'Withdraw'}
                  </Button>
                )}

                {(listing.status === 'draft' || listing.status === 'rejected') && (
                  <Button size="sm" variant="destructive" onClick={() => setConfirmState({ action: 'delete', listing })}>
                    {language === 'vi' ? 'Xóa' : 'Delete'}
                  </Button>
                )}

                <Button size="icon-sm" variant="ghost" asChild>
                  <Link href={`/seller/listings/${listing.id}`}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        )}

        <AlertDialog open={Boolean(confirmState)} onOpenChange={(open) => !open && setConfirmState(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmState?.action === 'submit'
                  ? language === 'vi'
                    ? 'Gửi tin để duyệt?'
                    : 'Submit listing for review?'
                  : confirmState?.action === 'withdraw'
                    ? language === 'vi'
                      ? 'Rút tin đăng?'
                      : 'Withdraw listing?'
                    : language === 'vi'
                      ? 'Xóa tin đăng?'
                      : 'Delete listing?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmState?.listing.title}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isActionPending}>
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction onClick={executeAction} disabled={isActionPending}>
                {isActionPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {language === 'vi' ? 'Đang xử lý' : 'Processing'}
                  </span>
                ) : language === 'vi' ? (
                  'Xác nhận'
                ) : (
                  'Confirm'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
