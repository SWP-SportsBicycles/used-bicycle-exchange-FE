'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, PackageSearch, CheckCircle2, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

import { useSellerOrderDetail, useSellerOrders } from '@/modules/seller/hooks/useSellerOrders'
import { useConfirmOrder, useShipOrder, useCancelOrder } from '@/modules/seller/hooks/useSellerOrderMutations'
import { normalizeOrderDetail, normalizeOrdersPayload } from '@/modules/seller/utils/normalization'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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

function pickWaybillCode(order: unknown): string {
  if (!order || typeof order !== 'object') return ''
  const candidate = (order as Record<string, unknown>).waybillCode
  return typeof candidate === 'string' ? candidate : ''
}


export default function SellerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.id
  
  const { language } = useLanguage()
  const router = useRouter()
  
  const { data: rawData, isLoading, isError } = useSellerOrderDetail(orderId)
  const confirmMutation = useConfirmOrder()
  const shipMutation = useShipOrder()
  const cancelMutation = useCancelOrder()

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const order = normalizeOrderDetail(rawData, orderId)
  const waybillCode = pickWaybillCode(order)

  // Fallback: nếu detail API không trả về listingId, lấy từ list cache
  const { data: ordersListData } = useSellerOrders({ size: 50 })
  const ordersFromList = normalizeOrdersPayload(ordersListData)
  const orderFromList = ordersFromList.find(o => o.id === orderId)
  // Ưu tiên listingId từ detail response, fallback sang list cache
  const effectiveListingId = order?.listing?.id || orderFromList?.listing?.id || ''

  const isPaid = order?.status === 'paid'
  const isConfirmed = order?.status === 'confirmed'
  const isShipping = order?.status === 'shipping'

  // Merge listing display data: detail API may lack bikeName/price, use list cache as fallback
  const displayTitle = (
    order?.listing?.title && order.listing.title !== 'Untitled bike' && order.listing.title !== 'Untitled'
      ? order.listing.title
      : orderFromList?.listing?.title
  ) || order?.listing?.title || 'N/A'

  const displayPrice = order?.listing?.price || orderFromList?.listing?.price || 0
  const displaySerialNumber = order?.listing?.serialNumber || orderFromList?.listing?.serialNumber || '-'

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
        
        {isPaid && (
          <div className="flex gap-2">
            <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)} disabled={cancelMutation.isPending}>
              {language === 'vi' ? 'Từ chối' : 'Decline'}
            </Button>
            <Button onClick={() => confirmMutation.mutate(orderId)} disabled={confirmMutation.isPending} className="bg-success text-success-foreground hover:bg-success/90">
              {confirmMutation.isPending ? '...' : (language === 'vi' ? 'Xác Nhận Đóng Gói' : 'Confirm Packed')}
            </Button>
          </div>
        )}

        {isConfirmed && (
          <div className="flex gap-2">
            <Button onClick={() => shipMutation.mutate(orderId)} disabled={shipMutation.isPending} className="bg-blue-600 text-white hover:bg-blue-700">
              {shipMutation.isPending ? '...' : (language === 'vi' ? 'Xác Nhận Giao Hàng' : 'Confirm Shipping')}
            </Button>
          </div>
        )}

        {order.status === 'completed' && effectiveListingId && (
          <div className="flex gap-2">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5" asChild>
              <Link href={`/seller/listings/${effectiveListingId}`}>
                {language === 'vi' ? 'Rút tin đăng gốc' : 'Withdraw original listing'}
              </Link>
            </Button>
          </div>
        )}

        {order.status === 'completed' && (!effectiveListingId) && (
          <Alert className="border-warning bg-warning/10 text-warning-foreground">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{language === 'vi' ? 'Không tìm thấy ID tin đăng' : 'Listing ID Not Found'}</AlertTitle>
            <AlertDescription>
              {language === 'vi' 
                ? 'Không thể xác định ID tin đăng liên kết với đơn hàng này. Vui lòng liên hệ hỗ trợ.' 
                : 'Cannot determine the listing ID associated with this order. Please contact support.'}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {order.status === 'completed' ? (
        <Card className="border-success bg-success/5 py-12 flex flex-col items-center text-center">
          <CheckCircle2 className="h-16 w-16 text-success mb-6" />
          <h2 className="text-2xl font-bold text-success mb-2">
            {language === 'vi' ? 'Giao dịch hoàn tất' : 'Transaction Completed'}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md px-4">
            {language === 'vi' 
              ? 'Đơn hàng đã được thanh toán và giao thành công. Bạn nên rút tin đăng gốc để tránh các yêu cầu mua hàng mới cho xe này.' 
              : 'Order has been paid and delivered. You should withdraw the original listing to prevent new purchase requests.'}
          </p>
          {effectiveListingId ? (
            <Button size="lg" className="bg-primary hover:bg-primary/90 px-8" asChild>
              <Link href={`/seller/listings/${effectiveListingId}`}>
                <EyeOff className="h-4 w-4 mr-2" />
                {language === 'vi' ? 'Đi tới Tin Đăng để Rút' : 'Go to Listing to Withdraw'}
              </Link>
            </Button>
          ) : (
            <Alert className="border-warning bg-warning/10 text-warning-foreground max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{language === 'vi' ? 'Không tìm thấy tin đăng' : 'Listing Not Found'}</AlertTitle>
              <AlertDescription>
                {language === 'vi' 
                  ? 'Không thể xác định tin đăng liên kết với đơn hàng này. Vui lòng liên hệ hỗ trợ kỹ thuật.' 
                  : 'Cannot determine the listing associated with this order. Please contact technical support.'}
              </AlertDescription>
            </Alert>
          )}
        </Card>
      ) : (
        <>
          {order.status === 'confirmed' && (
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
                <div className="flex justify-between items-center">
                  <CardTitle>{language === 'vi' ? 'Thông tin Xe Đạp' : 'Bicycle Information'}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'vi' ? 'Sản phẩm' : 'Product'}</span>
                  <span className="font-medium text-right ml-4">{displayTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'vi' ? 'Số Serial' : 'Serial No'}</span>
                  <span className="font-medium">{displaySerialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'vi' ? 'Giá xe' : 'Price'}</span>
                  <span className="font-medium text-lg">{formatVND(displayPrice)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>{language === 'vi' ? 'Tổng thu nhập dự kiến' : 'Estimated Earnings'}</span>
                  <span className="text-success">{formatVND(displayPrice * 0.95)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {language === 'vi' ? '(Sau khi trừ 5% phí nền tảng)' : '(After 5% platform fee)'}
                </p>
              </CardContent>
              <CardFooter>
                {effectiveListingId ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/seller/listings/${effectiveListingId}`}>
                      {language === 'vi' ? 'Xem tin đăng gốc' : 'View original listing'}
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {language === 'vi' ? 'Không tìm thấy tin đăng' : 'Listing not found'}
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === 'vi' ? 'Thông tin Người Mua' : 'Buyer Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'vi' ? 'Họ tên' : 'Name'}</span>
                  <span className="font-medium">{order.buyer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'vi' ? 'SĐT liên lạc' : 'Phone'}</span>
                  <span className="font-medium">{order.buyer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'vi' ? 'Địa chỉ giao hàng' : 'Shipping Address'}</span>
                  <span className="font-medium text-right max-w-[200px]">{order.buyer.address}</span>
                </div>
              </CardContent>
            </Card>

            {isShipping && (
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <PackageSearch className="h-5 w-5" />
                    {language === 'vi' ? 'Thông tin vận chuyển (GHN)' : 'Shipping Information (GHN)'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === 'vi' ? 'Đơn vị vận chuyển' : 'Carrier'}</span>
                    <span className="font-medium">Giao Hàng Nhanh (GHN)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === 'vi' ? 'Mã vận đơn' : 'Waybill Code'}</span>
                    <span className="font-medium text-blue-700">{waybillCode || 'Đang cập nhật...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === 'vi' ? 'Trạng thái' : 'Status'}</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                      {language === 'vi' ? 'Đang giao hàng' : 'In Transit'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {language === 'vi' ? '* Thông tin được cập nhật tự động từ hệ thống GHN' : '* Information updated automatically from GHN system'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

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
