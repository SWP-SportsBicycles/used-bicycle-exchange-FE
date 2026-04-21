'use client'

import React, { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Send, EyeOff, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { sellerApi } from '@/lib/api/seller-api'
import { useSubmitListing, useWithdrawListing, useDeleteListing } from '@/modules/seller/hooks/useSellerListingMutations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

export default function SellerListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const listingId = resolvedParams.id
  
  const { language } = useLanguage()
  const router = useRouter()
  
  const { data: rawData, isLoading, isError, refetch } = useQuery({
    queryKey: ['seller-listing-detail', listingId],
    queryFn: () => sellerApi.getListingDetail(listingId),
    enabled: Boolean(listingId)
  })

  const submitMutation = useSubmitListing()
  const withdrawMutation = useWithdrawListing()
  const deleteMutation = useDeleteListing()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const listing = (rawData as any)?.data || rawData

  const handleAction = async (action: 'submit' | 'withdraw' | 'delete') => {
    try {
      if (action === 'submit') {
        await submitMutation.mutateAsync(listingId)
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

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse">{language === 'vi' ? 'Đang tải tin đăng...' : 'Loading listing...'}</div>
  }

  if (isError || !listing) {
    return (
      <div className="text-center py-20 text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-xl font-bold">{language === 'vi' ? 'Không tìm thấy tin đăng' : 'Listing not found'}</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/seller/listings')}>
          {language === 'vi' ? 'Quay lại' : 'Go back'}
        </Button>
      </div>
    )
  }

  const statusMap: Record<string, { label: string, color: string }> = {
    draft: { label: language === 'vi' ? 'Bản nháp' : 'Draft', color: 'bg-muted text-muted-foreground' },
    pending_review: { label: language === 'vi' ? 'Đang chờ duyệt' : 'Pending', color: 'bg-warning/20 text-warning-foreground' },
    published: { label: language === 'vi' ? 'Đang hiển thị' : 'Published', color: 'bg-success/20 text-success-foreground' },
    rejected: { label: language === 'vi' ? 'Bị từ chối' : 'Rejected', color: 'bg-destructive/20 text-destructive' },
    withdrawn: { label: language === 'vi' ? 'Đã ẩn' : 'Withdrawn', color: 'bg-muted text-muted-foreground' },
    sold: { label: language === 'vi' ? 'Đã bán' : 'Sold', color: 'bg-primary/20 text-primary-foreground' },
  }

  const currentStatus = (listing.status as string) || 'draft'
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
          <Badge className={cn('text-sm', statusMap[currentStatus]?.color || 'bg-muted')}>
            {statusMap[currentStatus]?.label || currentStatus}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {currentStatus === 'draft' && (
            <Button onClick={() => handleAction('submit')} disabled={isSubmitDisabled} className="bg-primary">
              <Send className="h-4 w-4 mr-2" />
              {language === 'vi' ? 'Gửi duyệt ngay' : 'Submit Now'}
            </Button>
          )}

          {currentStatus === 'published' && (
            <Button onClick={() => handleAction('withdraw')} disabled={withdrawMutation.isPending} variant="secondary">
              <EyeOff className="h-4 w-4 mr-2" />
              {language === 'vi' ? 'Ẩn tin này' : 'Withdraw'}
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
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Thương hiệu' : 'Brand'}</p>
              <p className="font-medium">{listing.brand || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Model</p>
              <p className="font-medium">{listing.model || '-'}</p>
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
              <p className="text-muted-foreground mb-1">{language === 'vi' ? 'Tỉnh/Thành phố' : 'City'}</p>
              <p className="font-medium">{listing.city || '-'}</p>
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
             {listing.mediaFiles?.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {listing.mediaFiles.map((media: any, index: number) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <Image src={media.url || media.image} alt="Media" fill className="object-cover" />
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
