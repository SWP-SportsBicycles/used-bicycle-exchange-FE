'use client'

import React, { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, AlertTriangle, PackageSearch, CheckCircle2, XCircle } from 'lucide-react'
import { format, differenceInSeconds } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

import { useSellerOrderDetail } from '@/modules/seller/hooks/useSellerOrders'
import { useConfirmOrder, useCancelOrder } from '@/modules/seller/hooks/useSellerOrderMutations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import { ORDER_STATUS_LABELS, formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const SLA_HOURS = 12

export default function SellerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.id
  
  const { language } = useLanguage()
  const router = useRouter()
  
  const { data: rawData, isLoading, isError } = useSellerOrderDetail(orderId)
  const confirmMutation = useConfirmOrder()
  const cancelMutation = useCancelOrder()

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean } | null>(null)

  const order = (rawData as any)?.data || rawData

  const isPendingConfirm = order?.status === 'pending_seller_confirm'

  useEffect(() => {
    if (!order?.createdAt || !isPendingConfirm) return

    const deadline = new Date(order.createdAt)
    deadline.setHours(deadline.getHours() + SLA_HOURS)

    const timer = setInterval(() => {
      const now = new Date()
      const diff = differenceInSeconds(deadline, now)
      
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true })
        clearInterval(timer)
      } else {
        const hours = Math.floor(diff / 3600)
        const minutes = Math.floor((diff % 3600) / 60)
        const seconds = diff % 60
        setTimeLeft({ hours, minutes, seconds, isExpired: false })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [order?.createdAt, isPendingConfirm])

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync(orderId)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(orderId)
      setIsCancelDialogOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse">{language === 'vi' ? 'Đang tải thông tin đơn hàng...' : 'Loading order details...'}</div>
  }

  if (isError || !order) {
    return (
      <div className="text-center py-20 text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-xl font-bold">{language === 'vi' ? 'Không tìm thấy đơn hàng' : 'Order not found'}</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/seller/orders')}>
          {language === 'vi' ? 'Quay lại' : 'Go back'}
        </Button>
      </div>
    )
  }

  const statusLabel = (ORDER_STATUS_LABELS as Record<string, { vi: string, en: string }>)[order.status]?.[language as 'vi' | 'en'] || order.status?.replace(/_/g, ' ') || 'Unknown'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/seller/orders" className="hover:text-foreground transition-colors flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {language === 'vi' ? 'Quay lại danh sách' : 'Back to orders'}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {language === 'vi' ? 'Đơn Hàng #' : 'Order #'}
            {order.id?.substring(0, 8).toUpperCase()}
            <Badge variant="secondary" className="text-sm">
              {statusLabel}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'vi' ? 'Ngày tạo:' : 'Created at:'}{' '}
            {order.createdAt ? format(new Date(order.createdAt), 'PPpp', { locale: language === 'vi' ? vi : enUS }) : 'N/A'}
          </p>
        </div>
        
        {isPendingConfirm && (
          <div className="flex gap-2">
            <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)} disabled={cancelMutation.isPending}>
              {language === 'vi' ? 'Từ chối' : 'Decline'}
            </Button>
            <Button onClick={handleConfirm} disabled={confirmMutation.isPending} className="bg-success text-success-foreground hover:bg-success/90">
              {confirmMutation.isPending ? '...' : (language === 'vi' ? 'Xác Nhan Đóng Gói' : 'Confirm Packed')}
            </Button>
          </div>
        )}
      </div>

      {isPendingConfirm && timeLeft && (
        <Alert className={cn(timeLeft.hours < 2 ? 'border-destructive bg-destructive/10 text-destructive' : 'border-warning bg-warning/10 text-warning-foreground')}>
          <Clock className={cn("h-4 w-4", timeLeft.hours < 2 ? 'text-destructive' : 'text-warning-foreground')} />
          <AlertTitle className="font-bold">
            {language === 'vi' ? 'Yêu cầu hành động (SLA 12h)' : 'Action Required (SLA 12h)'}
          </AlertTitle>
          <AlertDescription className="mt-1 flex items-center gap-2 font-mono text-lg">
            {timeLeft.isExpired ? (
              <span className="text-destructive font-bold">{language === 'vi' ? 'ĐÃ QUÁ HẠN' : 'EXPIRED'}</span>
            ) : (
              <span>
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            )}
            <span className="text-sm font-sans">
              {language === 'vi' ? 'Hãy xác nhận đóng gói trước khi hết hạn.' : 'Please confirm packaging before time runs out.'}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {order.status === 'seller_confirmed' && (
        <Alert className="border-info bg-info/10 text-info-foreground">
          <PackageSearch className="h-4 w-4" />
          <AlertTitle>{language === 'vi' ? 'Chở lấy hàng' : 'Waiting for pickup'}</AlertTitle>
          <AlertDescription>
            {language === 'vi' ? 'Đơn vị vận chuyển sẽ sớm liên hệ để lấy xe.' : 'Courier will contact you soon for pickup.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Thông tin Xe Đạp' : 'Bicycle Information'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'vi' ? 'Sản phẩm' : 'Product'}</span>
              <span className="font-medium text-right ml-4">{order.listing?.title || order.listingTitle || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'vi' ? 'Số Serial' : 'Serial No'}</span>
              <span className="font-medium">{order.listing?.serialNumber || order.serialNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'vi' ? 'Giá xe' : 'Price'}</span>
              <span className="font-medium text-lg">{formatVND(order.listing?.price || order.price || 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>{language === 'vi' ? 'Tổng thu nhập dự kiến' : 'Estimated Earnings'}</span>
              <span className="text-success">{formatVND((order.listing?.price || order.price || 0) * 0.95)}</span>
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">
              {language === 'vi' ? '(Sau khi trừ 5% phí nền tảng)' : '(After 5% platform fee)'}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/seller/listings/${order.listingId || order.listing?.id}`}>
                {language === 'vi' ? 'Xem tin đăng gốc' : 'View original listing'}
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Thông tin Người Mua' : 'Buyer Information'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'vi' ? 'Họ tên' : 'Name'}</span>
              <span className="font-medium">{order.buyer?.name || order.buyerName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'vi' ? 'SĐT liên lạc' : 'Phone'}</span>
              <span className="font-medium">{order.buyer?.phone || order.buyerPhone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'vi' ? 'Địa chỉ giao hàng' : 'Shipping Address'}</span>
              <span className="font-medium text-right max-w-[200px]">{order.buyer?.address || order.shippingAddress || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'vi' ? 'Hủy Đơn Hàng?' : 'Cancel Order?'}</DialogTitle>
            <DialogDescription>
              {language === 'vi' 
                ? 'Bạn có chắc chắn muốn hủy đơn hàng này không? Việc hủy quá nhiều đơn hàng có thể ảnh hưởng đến đánh giá của shop.'
                : 'Are you sure you want to cancel this order? High cancellation rate may affect your shop rating.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              {language === 'vi' ? 'Đóng' : 'Close'}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? '...' : (language === 'vi' ? 'Xác Nhận Hủy' : 'Confirm Cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
