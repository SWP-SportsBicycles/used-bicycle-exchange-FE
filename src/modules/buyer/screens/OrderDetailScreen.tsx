'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User, Phone, MapPin, ExternalLink, ShieldAlert, Badge } from 'lucide-react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { useOrderDetail } from '../hooks/useOrders'
import { useShipmentTracking } from '../hooks/useDispute'
import { OrderStatusStepper } from '../components/OrderStatusStepper'
import { GhnTracker } from '../components/GhnTracker'
import { CancelOrderDialog } from '../components/CancelOrderDialog'
import { formatVND } from '@/lib/mock-data'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailScreen({ params }: PageProps) {
  const { id } = use(params)
  const { data: order, isLoading: isOrderLoading } = useOrderDetail(id)
  const { data: shipment, isLoading: isShipmentLoading } = useShipmentTracking(order?.waybillCode ? id : undefined)

  if (isOrderLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Đang tải...</div>
  }

  if (!order) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Không tìm thấy đơn hàng.</div>
  }

  const showCancelButton = ['payos_paid', 'shipping'].includes(order.status)
  const showDisputeButton = ['delivered', 'completed'].includes(order.status)

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center justify-between">
          <Link 
            href="/buyer/orders"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Trở lại danh sách đơn hàng
          </Link>
          <span className="text-sm font-semibold text-foreground uppercase">
            Đơn hàng #{order.id.split('-')[0]}
          </span>
        </nav>

        {/* Status Stepper */}
        <Card className="mb-8 overflow-visible">
          <CardContent className="pt-6">
            <OrderStatusStepper status={order.status} />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info (Left) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking UI */}
            {order.waybillCode && (
              <GhnTracker shipment={shipment} isLoading={isShipmentLoading} />
            )}

            {/* Product Summary */}
            <Card>
              <CardHeader className="bg-secondary/30 pb-4">
                <CardTitle className="text-base flex justify-between items-center">
                  <span>Thông tin sản phẩm</span>
                  <Link href={`/marketplace/${order.listingId}`} className="text-sm text-primary font-normal hover:underline flex items-center gap-1">
                    Xem listing gốc <ExternalLink className="h-3 w-3" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-secondary border border-border">
                    <Image src={order.listing.images[0]} alt={order.listing.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg mb-2">{order.listing.title}</h3>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>Giá trị xe: <span className="font-medium text-foreground">{formatVND(order.listing.price)}</span></p>
                      <p>Phí vận chuyển: <span className="font-medium text-foreground">{formatVND(order.shippingFee)}</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Full PII Seller Info */}
            {order.seller && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-primary">Thông tin người bán (Đã mở khóa)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">{order.seller.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">{order.seller.phone}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="font-medium leading-tight">{order.seller.address}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Địa chỉ nhận hàng</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="font-bold text-foreground">{order.receiverName}</p>
                <p className="text-muted-foreground">{order.receiverPhone}</p>
                <p className="text-muted-foreground leading-relaxed">{order.receiverAddress}</p>
              </CardContent>
            </Card>

            {/* Total */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Thanh toán (PayOS)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-sm font-bold">Tổng cộng</span>
                  <span className="text-2xl font-extrabold text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>
                    {formatVND(order.totalPrice)}
                  </span>
                </div>
                <Badge className="w-full justify-center bg-success hover:bg-success">Đã thanh toán Escrow</Badge>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {showDisputeButton && (
                <Button asChild variant="destructive" className="w-full gap-2 font-bold shadow-lg shadow-rose-500/20">
                  <Link href={`/buyer/orders/${order.id}/dispute`}>
                    <ShieldAlert className="h-4 w-4" /> Yêu cầu khiếu nại (Hoàn tiền)
                  </Link>
                </Button>
              )}
              {showCancelButton && (
                <CancelOrderDialog order={order} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
