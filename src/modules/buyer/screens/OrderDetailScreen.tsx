'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User, Phone, MapPin, ExternalLink, ShieldAlert, CheckCircle2, Lock, Clock, XCircle, Package, Star } from 'lucide-react'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { useConfirmReceivedMutation, useOrderDetail } from '../hooks/useOrders'
import { OrderStatusStepper } from '../components/OrderStatusStepper'
import { CancelOrderDialog } from '../components/CancelOrderDialog'
import { OrderDetailSkeleton } from '../components/skeletons/OrderDetailSkeleton'
import { ReviewDialog } from '../components/ReviewDialog'
import { ViewReviewDialog } from '../components/ViewReviewDialog'
import { useMyReviewedOrders, useMyReviewsAsBuyer } from '../hooks/useReview'
import { formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailScreen({ params }: PageProps) {
  const { id } = use(params)
  const { data: order, isLoading: isOrderLoading } = useOrderDetail(id)
  const { data: reviewedOrders = [] } = useMyReviewedOrders()
  const { data: myReviews = {} } = useMyReviewsAsBuyer()
  const confirmReceivedMutation = useConfirmReceivedMutation()

  if (isOrderLoading) {
    return <OrderDetailSkeleton />
  }

  if (!order) {
    return (
      <div className="bg-page flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Không tìm thấy đơn hàng</h2>
          <p className="mt-2 text-muted-foreground">Mã đơn không tồn tại hoặc không thuộc tài khoản của bạn.</p>
          <Button asChild className="mt-6">
            <Link href="/buyer/orders">Quay lại danh sách đơn hàng</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  const isReviewed = reviewedOrders.includes(order.id)
  const isDisputed = order.status === 'disputed'
  // Completed: cho phép đánh giá HOẶC khiếu nại (mutual exclusion)
  const showCreateDisputeButton = order.status === 'completed' && !isReviewed
  const showReviewButton = order.status === 'completed' && !isDisputed
  const showViewDisputeButton = order.status === 'disputed'
  // Bug fix: cancel chỉ cho phép khi 'pending' — đơn đã paid không thể cancel từ FE
  const showCancelButton = order.status === 'pending'
  const isAwaitingPayment = order.status === 'pending'
  
  let paymentStatusLabel = 'Đã thanh toán Escrow'
  let paymentStatusColor = 'border-success/20 bg-success/10 text-success'
  let PaymentIcon = CheckCircle2

  if (order.status === 'pending') {
    paymentStatusLabel = 'Chờ thanh toán Escrow'
    paymentStatusColor = 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
    PaymentIcon = Clock
  } else if (order.status === 'cancelled') {
    paymentStatusLabel = 'Chưa thanh toán (Đơn đã hủy)'
    paymentStatusColor = 'border-destructive/20 bg-destructive/10 text-destructive'
    PaymentIcon = XCircle
  } else if (order.status === 'disputed') {
    paymentStatusLabel = 'Thanh toán đang bị tạm giữ (Khiếu nại)'
    paymentStatusColor = 'border-rose-500/20 bg-rose-500/10 text-rose-600'
    PaymentIcon = ShieldAlert
  }


  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 lg:px-6">
        <nav className="mb-6 flex items-center justify-between">
          <Link
            href="/buyer/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Trở lại danh sách đơn hàng
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mã đơn hàng</span>
              <span className="text-sm font-bold text-foreground">#{order.id.split('-')[0]}</span>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold border",
              order.status === 'pending' && "bg-amber-500/10 text-amber-600 border-amber-500/20",
              order.status === 'paid' && "bg-blue-500/10 text-blue-600 border-blue-500/20",
              order.status === 'shipping' && "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
              order.status === 'delivered' && "bg-teal-500/10 text-teal-600 border-teal-500/20",
              order.status === 'completed' && "bg-success/10 text-success border-success/20",
              order.status === 'cancelled' && "bg-destructive/10 text-destructive border-destructive/20",
              order.status === 'disputed' && "bg-rose-500/10 text-rose-600 border-rose-500/20"
            )}>
              {order.statusLabel}
            </div>
          </div>
        </nav>

        <Card className="mb-8 overflow-visible">
          <CardContent className="pt-6">
            <OrderStatusStepper status={order.status} />
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="space-y-8 lg:col-span-8">

            <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/40 bg-secondary/30 px-6 py-4">
                <h2 className="text-lg font-bold">Thông tin sản phẩm</h2>
                <Link
                  href={`/marketplace/${order.listingId}`}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:underline"
                >
                  Xem listing gốc <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-border/50 shadow-inner">
                    <Image
                      src={order.listing.images[0] || '/placeholder.png'}
                      alt={order.listing.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'https://placehold.co/200x200/1a1a1a/aee86c?text=No+Image'
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <h3 className="mb-3 text-xl font-bold leading-tight text-foreground">{order.listing.title}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Giá trị xe</p>
                        <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
                          {formatVND(order.subTotal || order.listing.price)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Phí vận chuyển</p>
                        <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
                          {formatVND(order.shippingFee)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin vận chuyển GHN */}
            {order.waybillCode && (
              <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b border-border/40 bg-secondary/30 px-6 py-4">
                  <Package className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-bold">Thông tin vận chuyển</h2>
                </div>
                <div className="p-6">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Đơn vị vận chuyển:</span>
                        <span className="text-sm font-bold text-foreground">Giao Hàng Nhanh (GHN)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Mã vận đơn:</span>
                        <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">{order.waybillCode}</span>
                      </div>
                      {order.trackingUrl && (
                        <Button asChild variant="outline" className="w-full mt-2 bg-white dark:bg-background border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50">
                          <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                            Theo dõi đơn hàng trên GHN
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {order.seller && (
              <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-primary">Thông tin người bán đã mở khóa</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white/50 p-4 dark:bg-black/20">
                    <User className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-base font-semibold">{order.seller.name}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white/50 p-4 dark:bg-black/20">
                    <Phone className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-base font-semibold tracking-wide">{order.seller.phone}</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white/50 p-4 sm:col-span-2 dark:bg-black/20">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium leading-relaxed">{order.seller.address}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                Địa chỉ nhận hàng
              </h3>
              <div className="rounded-2xl border border-border/40 bg-muted/20 overflow-hidden">
                {/* Name + Phone */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {order.receiverName.substring(0, 1).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-bold text-foreground">{order.receiverName}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary tabular-nums">{order.receiverPhone}</p>
                </div>
                {/* Address */}
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">{order.receiverAddress}</p>
                </div>
                {/* Lock note */}
                <div className="flex items-center gap-2 border-t border-border/30 bg-muted/30 px-4 py-2.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">Địa chỉ giao hàng cố định theo đơn</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold">Thanh toán</h3>
              <div className="mb-4 flex items-end justify-between border-b border-border/50 pb-4">
                <span className="font-medium text-muted-foreground">Tổng cộng</span>
                <span className="text-3xl font-extrabold text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>
                  {formatVND(order.totalPrice)}
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-3 font-bold border mb-4",
                  paymentStatusColor
                )}
              >
                <PaymentIcon className="h-5 w-5" />
                {paymentStatusLabel}
              </div>

              {/* Chi tiết thanh toán */}
              {(order.transactionId || order.paidAt) && (
                <div className="rounded-xl bg-muted/20 p-4 border border-border/30 space-y-3 mt-4">
                  <h4 className="text-sm font-bold text-foreground border-b border-border/40 pb-2">Chi tiết giao dịch</h4>
                  {order.transactionId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mã giao dịch (PayOS):</span>
                      <span className="font-mono font-medium">{order.transactionId.substring(0, 12)}...</span>
                    </div>
                  )}
                  {order.paidAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="font-medium">{new Date(order.paidAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>



            <div className="mt-8 flex flex-col gap-3">
              {isAwaitingPayment && (
                <Button asChild className="h-12 w-full rounded-xl text-base font-bold shadow-athletic animate-pulse-glow">
                  <Link href={`/buyer/checkout?orderId=${order.id}`}>
                    Thanh toán ngay
                  </Link>
                </Button>
              )}

              {showReviewButton && (
                isReviewed ? (
                  // "Đã đánh giá" → click để xem lại review
                  (() => {
                    const myReview = myReviews[order.id]
                    return myReview ? (
                      <ViewReviewDialog
                        rating={myReview.rating}
                        comment={myReview.comment}
                        reviewedAt={myReview.reviewedAt}
                        listingTitle={order.listing.title}
                      >
                        <Button variant="outline" className="h-12 w-full rounded-xl text-base font-bold border-amber-400/50 text-amber-600 hover:bg-amber-50 hover:border-amber-500">
                          <Star className="mr-2 h-5 w-5 fill-amber-400" /> Đã đánh giá ✓ (Xem lại)
                        </Button>
                      </ViewReviewDialog>
                    ) : (
                      <Button disabled variant="outline" className="h-12 w-full rounded-xl text-base font-bold border-amber-400/50 text-amber-600">
                        <Star className="mr-2 h-5 w-5 fill-amber-400" /> Đã đánh giá ✓
                      </Button>
                    )
                  })()
                ) : (
                  <ReviewDialog orderId={order.id} listingTitle={order.listing.title}>
                    <Button className="h-12 w-full rounded-xl text-base font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20">
                      <Star className="mr-2 h-5 w-5" /> Gửi đánh giá
                    </Button>
                  </ReviewDialog>
                )
              )}

              {showCreateDisputeButton && (
                <Button asChild variant="destructive" className="h-12 w-full rounded-xl text-base font-bold shadow-lg shadow-rose-500/20">
                  <Link href={`/buyer/orders/${order.id}/dispute`}>
                    <ShieldAlert className="mr-2 h-5 w-5" /> Yêu cầu khiếu nại (Hoàn tiền)
                  </Link>
                </Button>
              )}

              {showViewDisputeButton && (
                <Button asChild variant="outline" className="h-12 w-full rounded-xl text-base font-bold border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
                  <Link href={`/buyer/orders/${order.id}/dispute`}>
                    <ShieldAlert className="mr-2 h-5 w-5" /> Xem tình trạng khiếu nại
                  </Link>
                </Button>
              )}

              {order.status === 'delivered' && (
                <Button
                  type="button"
                  className="h-12 w-full rounded-xl text-base font-bold"
                  disabled={confirmReceivedMutation.isPending}
                  onClick={() => confirmReceivedMutation.mutate(order.id)}
                >
                  {confirmReceivedMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đã nhận hàng'}
                </Button>
              )}

              {showCancelButton && <CancelOrderDialog order={order} />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
