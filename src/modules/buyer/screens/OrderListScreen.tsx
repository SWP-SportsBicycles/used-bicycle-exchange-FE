'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ExternalLink, ChevronRight } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import { formatVND } from '@/lib/mock-data'
import { BuyerOrder } from '@/lib/api/buyer-api'

const statusColorMap: Record<BuyerOrder['status'], string> = {
  timer_draft: 'bg-slate-500',
  payos_paid: 'bg-amber-500',
  shipping: 'bg-blue-500',
  delivered: 'bg-teal-500',
  completed: 'bg-success',
  cancelled: 'bg-destructive',
  disputed: 'bg-rose-600',
}

const statusLabelMap: Record<BuyerOrder['status'], string> = {
  timer_draft: 'Đang khóa (Chưa TT)',
  payos_paid: 'Đã thanh toán',
  shipping: 'Đang vận chuyển',
  delivered: 'Đã giao hàng',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  disputed: 'Đang khiếu nại',
}

import { useState } from 'react'

export default function OrderListScreen() {
  const [statusFilter, setStatusFilter] = useState<BuyerOrder['status'] | 'all'>('all')
  const { data: orderPage, isLoading } = useOrders(1, 100) // Using a larger page size to demo filtering simply

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
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted rounded-xl" />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold text-foreground">Bạn chưa có đơn hàng nào</h3>
              <p className="text-muted-foreground mt-2 max-w-md">Khám phá các mẫu xe đạp chất lượng đang được bán trên Marketplace.</p>
              <Button asChild className="mt-6">
                <Link href="/marketplace">Mua sắm ngay</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-secondary/30 px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-foreground uppercase">
                      Mã ĐH: {order.id.split('-')[0]}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <Badge className={`${statusColorMap[order.status]} hover:${statusColorMap[order.status]} text-white border-0`}>
                    {statusLabelMap[order.status]}
                  </Badge>
                </div>
                
                <CardContent className="p-0">
                  <div className="p-5 flex flex-wrap lg:flex-nowrap gap-6 items-center">
                    {/* Image */}
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-secondary shrink-0 border border-border">
                      <Image 
                        src={order.listing.images[0] || '/placeholder.png'} 
                        alt={order.listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-1">
                        {order.listing.title}
                      </h3>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <p>Tổng thanh toán: <strong className="text-primary">{formatVND(order.totalPrice)}</strong></p>
                        <p>Người nhận: {order.receiverName} - {order.receiverPhone}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full lg:w-auto flex lg:flex-col gap-3 justify-end shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                      <Button asChild variant="default" className="flex-1 lg:flex-none">
                        <Link href={`/buyer/orders/${order.id}`}>
                          Xem chi tiết <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
