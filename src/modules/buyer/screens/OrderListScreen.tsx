'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ChevronRight } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import { formatVND } from '@/lib/mock-data'
import { BuyerOrder } from '@/lib/api/buyer-api'
import { OrderCardSkeleton } from '../components/skeletons/OrderCardSkeleton'
import { CancelOrderDialog } from '../components/CancelOrderDialog'

const statusColorMap: Record<BuyerOrder['status'], string> = {
  pending: 'bg-status-draft',
  paid: 'bg-status-paid',
  shipping: 'bg-status-shipping',
  delivered: 'bg-status-delivered',
  completed: 'bg-status-completed',
  cancelled: 'bg-status-cancelled',
  disputed: 'bg-status-disputed',
}

const statusLabelMap: Record<BuyerOrder['status'], string> = {
  pending: 'Đang chờ TT',
  paid: 'Đã thanh toán',
  shipping: 'Đang vận chuyển',
  delivered: 'Đã giao hàng',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  disputed: 'Đang khiếu nại',
}

import { useState } from 'react'

export default function OrderListScreen() {
  const [statusFilter, setStatusFilter] = useState<BuyerOrder['status'] | 'all'>('all')
  const [page, setPage] = useState(1)
  const { data: orderPage, isLoading } = useOrders(page, 10)

  const filteredItems = orderPage?.items?.filter(order => 
    statusFilter === 'all' ? true : order.status === statusFilter
  ) || []

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
              Đơn hàng của tôi
            </h1>
            <p className="text-muted-foreground mt-1">Quản lý và theo dõi tiến trình giao hàng.</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button 
              variant={statusFilter === 'all' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setStatusFilter('all')}
              className="rounded-full"
            >
              Tất cả
            </Button>
            {Object.entries(statusLabelMap).map(([key, label]) => (
              <Button 
                key={key}
                variant={statusFilter === key ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setStatusFilter(key as BuyerOrder['status'])}
                className="rounded-full whitespace-nowrap"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <OrderCardSkeleton key={i} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-border/50 bg-card p-12 shadow-sm text-center flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: 'var(--font-archivo)' }}>Bạn chưa có đơn hàng nào</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-base">Khám phá các mẫu xe đạp chất lượng đang được bán trên Marketplace với chế độ bảo vệ Escrow 100%.</p>
            <Button asChild className="rounded-xl h-12 px-8 font-bold shadow-athletic">
              <Link href="/marketplace">Mua sắm ngay</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredItems.map((order) => (
              <div key={order.id} className="rounded-3xl bg-card border border-border/40 shadow-sm overflow-hidden hover:shadow-athletic transition-all duration-300 group">
                <div className="bg-secondary/30 px-6 py-4 border-b border-border/40 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-foreground uppercase tracking-wider">
                      Mã ĐH: {(order.id || 'N/A').split('-')[0]}
                    </span>
                    <span className="text-muted-foreground font-medium hidden sm:inline-block">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <Badge className={`${statusColorMap[order.status]} hover:${statusColorMap[order.status]} text-white border-0 px-3 py-1 rounded-full font-semibold shadow-sm`}>
                    {statusLabelMap[order.status]}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap lg:flex-nowrap gap-6 items-center">
                    {/* Image */}
                    <div className="relative h-28 w-28 rounded-2xl overflow-hidden bg-secondary shrink-0 border border-border/50 shadow-inner group-hover:border-primary/30 transition-colors">
                      <Image 
                        src={order.listing.images[0] || '/placeholder.png'} 
                        alt={order.listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-foreground line-clamp-1 mb-2">
                        {order.listing.title}
                      </h3>
                      <div className="flex flex-col gap-1.5 text-sm">
                        <p className="text-muted-foreground">Thanh toán: <strong className="text-primary text-base ml-1" style={{ fontFamily: 'var(--font-archivo)' }}>{formatVND(order.totalPrice)}</strong></p>
                        <p className="text-muted-foreground">Người nhận: <span className="text-foreground font-medium">{order.receiverName} - {order.receiverPhone}</span></p>
                      </div>
                    </div>

                    {/* Receipt separator */}
                    <div className="hidden lg:block w-px h-20 border-l-2 border-dashed border-border/60 mx-4"></div>
                    <div className="lg:hidden w-full h-px border-t-2 border-dashed border-border/60 my-2"></div>

                    {/* Actions */}
                    <div className="w-full lg:w-48 flex flex-col gap-3 justify-center shrink-0">
                      {order.status === 'pending' && (
                        <>
                          <Button asChild variant="destructive" className="w-full h-11 rounded-xl font-bold shadow-lg shadow-destructive/20 animate-pulse-glow">
                            <Link href={`/buyer/checkout?orderId=${order.id}`}>
                              Thanh toán ngay
                            </Link>
                          </Button>
                          <CancelOrderDialog order={order} />
                        </>
                      )}
                      <Button asChild variant={order.status === 'pending' ? 'ghost' : 'default'} className="w-full h-11 rounded-xl font-semibold">
                        <Link href={`/buyer/orders/${order.id}`}>
                          Xem chi tiết <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {orderPage && orderPage.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => p - 1)}
            >
              Trang trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {page} / {orderPage.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={page >= orderPage.totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Trang sau
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
