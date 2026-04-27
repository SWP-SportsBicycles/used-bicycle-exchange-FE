'use client'

import Link from 'next/link'
import Image from 'next/image'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ChevronRight, CheckCircle, Loader2 } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import { formatVND } from '@/lib/mock-data'
import { BuyerOrder, buyerApi } from '@/lib/api/buyer-api'
import { OrderCardSkeleton } from '../components/skeletons/OrderCardSkeleton'
import { CancelOrderDialog } from '../components/CancelOrderDialog'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { BuyerAccountLayout } from '../components/BuyerAccountLayout'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

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
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export default function OrderListScreen() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryStatus = searchParams.get('status')
  
  const [statusFilter, setStatusFilter] = useState<BuyerOrder['status'] | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null)
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null)
  
  const { data: orderPage, isLoading } = useOrders(page, 10)
  const queryClient = useQueryClient()

  const handleConfirmReceived = async (orderId: string) => {
    setConfirmingOrderId(orderId)
    try {
      await buyerApi.syncShipment(orderId)
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      toast.success('Xác nhận đã nhận hàng thành công!')
    } catch {
      toast.error('Xác nhận thất bại. Vui lòng thử lại.')
    } finally {
      setConfirmingOrderId(null)
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    setCompletingOrderId(orderId)
    try {
      await buyerApi.confirmReceived(orderId)
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      toast.success('Đơn hàng đã hoàn tất!')
    } catch {
      toast.error('Xác nhận hoàn tất thất bại. Vui lòng thử lại.')
    } finally {
      setCompletingOrderId(null)
    }
  }

  useEffect(() => {
    if (!queryStatus) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatusFilter('all')
      return
    }
    const validStatuses: Array<BuyerOrder['status']> = ['pending', 'paid', 'shipping', 'delivered', 'completed', 'cancelled', 'disputed']
    if (validStatuses.includes(queryStatus as BuyerOrder['status'])) {
      setStatusFilter(queryStatus as BuyerOrder['status'])
      setPage(1)
      return
    }
    setStatusFilter('all')
  }, [queryStatus])

  const handleTabChange = (status: string) => {
    setStatusFilter(status as BuyerOrder['status'] | 'all')
    setPage(1)
    if (status === 'all') {
      router.push(pathname)
    } else {
      router.push(`${pathname}?status=${status}`)
    }
  }

  const filteredItems = orderPage?.items?.filter(order => {
    const matchesStatus = statusFilter === 'all' ? true : order.status === statusFilter
    const matchesSearch = searchQuery === '' 
      ? true 
      : order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  }) || []

  return (
    <BuyerAccountLayout>
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
                Đơn hàng của tôi
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Quản lý và theo dõi tiến trình giao hàng.</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn hoặc tên xe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-background border-border/50 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* Premium Tabs */}
          <div className="relative w-full">
            <div className="flex gap-6 overflow-x-auto border-b border-border/50 pb-px scrollbar-hide">
              <button
                onClick={() => handleTabChange('all')}
                className={cn(
                  "pb-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 relative",
                  statusFilter === 'all' 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Tất cả
                {statusFilter === 'all' && (
                  <motion.div layoutId="order-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
              {Object.entries(statusLabelMap).map(([key, label]) => (
                <button 
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={cn(
                    "pb-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 relative",
                    statusFilter === key 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                  {statusFilter === key && (
                    <motion.div layoutId="order-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
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
              <div key={order.id} className="rounded-2xl bg-card border border-border/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-md transition-all duration-300 group">
                <div className="bg-secondary/20 px-5 py-3 border-b border-border/40 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-foreground uppercase tracking-wider">
                      Đơn hàng: {(order.id || 'N/A').split('-')[0]}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border/80 hidden sm:block" />
                    <span className="text-muted-foreground font-medium hidden sm:inline-block">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </div>
                  <Badge className={cn(
                    "px-3 py-1 rounded-full font-semibold border-0 shadow-sm transition-colors",
                    statusColorMap[order.status],
                    `hover:${statusColorMap[order.status]}`
                  )}>
                    {statusLabelMap[order.status]}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap lg:flex-nowrap gap-6 items-center">
                    {/* Image */}
                    <div className="relative h-28 w-28 rounded-2xl overflow-hidden bg-secondary shrink-0 border border-border/50 shadow-inner group-hover:border-primary/30 transition-colors">
                      {order.listing.images[0] ? (
                        <Image 
                          src={order.listing.images[0]} 
                          alt={order.listing.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = 'https://placehold.co/200x200/1a1a1a/aee86c?text=No+Image'
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary">
                          <Package className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                      )}
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
                          <CancelOrderDialog
                            order={order}
                            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })}
                          />
                        </>
                      )}
                      {order.status === 'shipping' && (
                        <Button
                          variant="default"
                          className="w-full h-11 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all duration-200"
                          disabled={confirmingOrderId === order.id}
                          onClick={() => handleConfirmReceived(order.id)}
                        >
                          {confirmingOrderId === order.id ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang xử lý...</>
                          ) : (
                            <><CheckCircle className="h-4 w-4 mr-2" />Đã nhận hàng</>
                          )}
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <Button
                          variant="default"
                          className="w-full h-11 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all duration-200"
                          disabled={completingOrderId === order.id}
                          onClick={() => handleCompleteOrder(order.id)}
                        >
                          {completingOrderId === order.id ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang xử lý...</>
                          ) : (
                            <><CheckCircle className="h-4 w-4 mr-2" />Hoàn tất đơn hàng</>
                          )}
                        </Button>
                      )}
                      <Button asChild variant={order.status === 'pending' ? 'ghost' : 'outline'} className="w-full h-11 rounded-xl font-semibold">
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
      </div>
    </BuyerAccountLayout>
  )
}
