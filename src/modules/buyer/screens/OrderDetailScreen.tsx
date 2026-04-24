'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User, Phone, MapPin, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { useConfirmReceivedMutation, useOrderDetail } from '../hooks/useOrders'
import { useShipmentTracking } from '../hooks/useDispute'
import { OrderStatusStepper } from '../components/OrderStatusStepper'
import { GhnTracker } from '../components/GhnTracker'
import { CancelOrderDialog } from '../components/CancelOrderDialog'
import { OrderDetailSkeleton } from '../components/skeletons/OrderDetailSkeleton'
import { formatVND } from '@/lib/mock-data'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailScreen({ params }: PageProps) {
  const { id } = use(params)
  const { data: order, isLoading: isOrderLoading } = useOrderDetail(id)
  const { data: shipment, isLoading: isShipmentLoading } = useShipmentTracking(order?.waybillCode ? id : undefined)
  const confirmReceivedMutation = useConfirmReceivedMutation()

  if (isOrderLoading) {
    return <OrderDetailSkeleton />
  }

  if (!order) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50">Không tìm thấy đơn hàng.</div>
  }

  const showDisputeButton = ['delivered', 'completed'].includes(order.status)
  const showCancelButton = ['pending', 'paid'].includes(order.status)
  const isAwaitingPayment = order.status === 'pending'
  const paymentStatusLabel = isAwaitingPayment ? 'Chờ thanh toán Escrow' : 'Đã thanh toán Escrow'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 lg:px-6">
        <nav className="mb-6 flex items-center justify-between">
          <Link
            href="/buyer/orders"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Trở lại danh sách đơn hàng
          </Link>
          <span className="text-sm font-semibold uppercase text-foreground">Đơn hàng #{order.id.split('-')[0]}</span>
        </nav>

        <Card className="mb-8 overflow-visible">
          <CardContent className="pt-6">
            <OrderStatusStepper status={order.status} />
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="space-y-8 lg:col-span-8">
            {order.waybillCode && <GhnTracker shipment={shipment} isLoading={isShipmentLoading} />}

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
                    <Image src={order.listing.images[0]} alt={order.listing.title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <h3 className="mb-3 text-xl font-bold leading-tight text-foreground">{order.listing.title}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Giá trị xe</p>
                        <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
                          {formatVND(order.listing.price)}
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
              <div className="space-y-2 rounded-2xl bg-secondary/30 p-4">
                <p className="text-base font-bold text-foreground">{order.receiverName}</p>
                <p className="font-medium text-primary">{order.receiverPhone}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{order.receiverAddress}</p>
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
                className={`flex items-center justify-center gap-2 rounded-xl py-3 font-bold ${
                  isAwaitingPayment
                    ? 'border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    : 'border border-success/20 bg-success/10 text-success'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
                {paymentStatusLabel}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {isAwaitingPayment && (
                <Button asChild className="h-12 w-full rounded-xl text-base font-bold shadow-athletic animate-pulse-glow">
                  <Link href={`/buyer/checkout?orderId=${order.id}`}>
                    Thanh toán ngay
                  </Link>
                </Button>
              )}

              {showDisputeButton && (
                <Button asChild variant="destructive" className="h-12 w-full rounded-xl text-base font-bold shadow-lg shadow-rose-500/20">
                  <Link href={`/buyer/orders/${order.id}/dispute`}>
                    <ShieldAlert className="mr-2 h-5 w-5" /> Yêu cầu khiếu nại (Hoàn tiền)
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
