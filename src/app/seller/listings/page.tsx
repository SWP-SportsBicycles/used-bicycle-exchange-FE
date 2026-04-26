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
import {
  useDeleteListing,
  useResubmitListing,
  useSubmitListing,
  useWithdrawListing,
} from '@/modules/seller/hooks/useSellerListingMutations'
import { useSellerListings } from '@/modules/seller/hooks/useSellerListings'
import { cn } from '@/lib/utils'

import { 
  normalizeListingsPayload, 
  normalizeListingStatus,
  type SellerListingItem,
  type ListingStatus 
} from '@/modules/seller/utils/normalization'

type ConfirmAction = 'submit' | 'withdraw' | 'delete' | 'resubmit'

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
  const resubmitMutation = useResubmitListing()
  const [confirmState, setConfirmState] = useState<{ action: ConfirmAction; listing: SellerListingItem } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const isActionPending = submitMutation.isPending || withdrawMutation.isPending || deleteMutation.isPending || resubmitMutation.isPending

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
      } else if (confirmState.action === 'resubmit') {
        await resubmitMutation.mutateAsync(confirmState.listing.id)
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
            <Link
              key={listing.id}
              href={`/seller/listings/${listing.id}`}
              className="block"
            >
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted cursor-pointer">
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

                <div className="flex items-center gap-2" style={{ pointerEvents: 'none' }}>
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        setConfirmState({ action: 'submit', listing }); 
                      }}
                      style={{ pointerEvents: 'auto' }}
                    >
                      {language === 'vi' ? 'Gửi duyệt' : 'Submit'}
                    </Button>
                  )}

                  {(listing.status === 'draft' || listing.status === 'rejected' || listing.status === 'pending_review' || listing.status === 'pending') && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      asChild 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                      }}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Link href={`/seller/listings/${listing.id}/edit`}>
                        {language === 'vi' ? 'Sửa' : 'Edit'}
                      </Link>
                    </Button>
                  )}

                  {(listing.status === 'published' || listing.status === 'pending_review' || listing.status === 'pending') && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        setConfirmState({ action: 'withdraw', listing}); 
                      }}
                      style={{ pointerEvents: 'auto' }}
                    >
                      {language === 'vi' ? 'Rút tin' : 'Withdraw'}
                    </Button>
                  )}

                  {listing.status === 'rejected' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        setConfirmState({ action: 'resubmit', listing}); 
                      }}
                      style={{ pointerEvents: 'auto' }}
                    >
                      {language === 'vi' ? 'Gửi duyệt lại' : 'Resubmit'}
                    </Button>
                  )}

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}

        <AlertDialog open={Boolean(confirmState)} onOpenChange={(open) => !open && setConfirmState(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmState?.action === 'submit'
                  ? language === 'vi' ? 'Xác nhận gửi duyệt' : 'Confirm Submission'
                  : confirmState?.action === 'withdraw'
                    ? language === 'vi' ? 'Xác nhận rút tin' : 'Confirm Withdrawal'
                    : confirmState?.action === 'resubmit'
                      ? language === 'vi' ? 'Xác nhận gửi lại duyệt' : 'Confirm Resubmission'
                      : language === 'vi' ? 'Xác nhận xóa' : 'Confirm Deletion'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmState?.action === 'submit'
                  ? language === 'vi' ? 'Bạn có chắc chắn muốn gửi tin đăng này cho quản trị viên phê duyệt không?' : 'Are you sure you want to submit this listing for admin approval?'
                  : confirmState?.action === 'withdraw'
                    ? language === 'vi' ? 'Bạn có chắc chắn muốn rút tin đăng này xuống không? Nó sẽ không còn hiển thị với người mua nữa.' : 'Are you sure you want to withdraw this listing? It will no longer be visible to buyers.'
                    : confirmState?.action === 'resubmit'
                      ? language === 'vi' ? 'Bạn có muốn gửi lại tin đăng này để quản trị viên xem xét lại không?' : 'Do you want to resubmit this listing for admin review?'
                      : language === 'vi' ? 'Hành động này không thể hoàn tác. Việc này sẽ xóa vĩnh viễn tin đăng của bạn.' : 'This action cannot be undone. This will permanently delete your listing.'}
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
