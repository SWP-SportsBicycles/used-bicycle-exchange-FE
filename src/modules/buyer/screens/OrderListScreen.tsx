/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronRight, CheckCircle, Loader2, Search, ShieldAlert, Wallet, Star } from 'lucide-react'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useOrders } from '../hooks/useOrders'
import { formatVND } from '@/lib/mock-data'
import { BuyerOrder, buyerApi } from '@/lib/api/buyer-api'
import { OrderCardSkeleton } from '../components/skeletons/OrderCardSkeleton'
import { CancelOrderDialog } from '../components/CancelOrderDialog'
import { ReviewDialog } from '../components/ReviewDialog'
import { useMyReviewedOrders } from '../hooks/useReview'
import { BuyerAccountLayout } from '../components/BuyerAccountLayout'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

/* ─────────────────────────── constants ─────────────────────────── */

const statusColorMap: Record<BuyerOrder['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  paid: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  shipping: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  delivered: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  disputed: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  refunded: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
}

const statusLabelMap: Record<BuyerOrder['status'], string> = {
  pending:   'Chờ thanh toán',
  paid:      'Đã thanh toán',
  shipping:  'Đang vận chuyển',
  delivered: 'Đã giao hàng',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  disputed:  'Đang khiếu nại',
  refunded:  'Đã hoàn tiền',
}

// Tabs to display — omit 'disputed' from quick filter since it's an overlay status
const TABS: Array<{ key: BuyerOrder['status'] | 'all'; label: string }> = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'pending',   label: 'Chờ thanh toán' },
  { key: 'paid',      label: 'Đã thanh toán' },
  { key: 'shipping',  label: 'Đang vận chuyển' },
  { key: 'delivered', label: 'Đã giao hàng' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'disputed',  label: 'Khiếu nại' },
]

/* ─────────────────────────── component ─────────────────────────── */

export default function OrderListScreen() {
  const router     = useRouter()
  const pathname   = usePathname()
  const searchParams = useSearchParams()
  const queryClient  = useQueryClient()

  // ── URL-driven tab + page state ─────────────────────────────────
  const queryStatus = searchParams.get('status')
  const queryPage   = Number(searchParams.get('page') ?? '1') || 1

  const valid: Array<BuyerOrder['status'] | 'all'> = [
    'all', 'pending', 'paid', 'shipping', 'delivered', 'completed', 'cancelled', 'disputed'
  ]
  const statusFilter = valid.includes(queryStatus as BuyerOrder['status']) ? queryStatus as BuyerOrder['status'] : 'all'

  const [searchQuery,  setSearchQuery]  = useState('')

  // page is DERIVED from URL — no useState needed
  const page = queryPage

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [queryPage])

  // ── Navigation helpers ────────────────────────────────────────────
  const buildUrl = (newStatus: string, newPage: number) => {
    const params = new URLSearchParams()
    if (newStatus && newStatus !== 'all') params.set('status', newStatus)
    if (newPage > 1) params.set('page', String(newPage))
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const handlePageChange = (newPage: number) => {
    router.push(buildUrl(statusFilter, newPage), { scroll: false })
  }

  // ── Server-side filter via hook (status passed to API) ───────────
  const { data: orderPage, isLoading } = useOrders(page, 10, statusFilter)
  const { data: reviewedOrders = [] } = useMyReviewedOrders()

  // Client-side filter (server may ignore status param — this is the safety net)
  const visibleItems = (orderPage?.items ?? []).filter(order => {
    // 'disputed' tab shows both active disputes AND refunded ones
    if (statusFilter === 'disputed') {
      return order.status === 'disputed' || order.status === 'refunded'
    }
    // Other tabs: exact match
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    // Search filter
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      order.id.toLowerCase().includes(q) ||
      order.listing.title.toLowerCase().includes(q)
    )
  })

  // ── Confirm-received state ────────────────────────────────────────
  const [pendingConfirmId, setPendingConfirmId] = useState<string | null>(null)
  const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null)
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null)
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null)

  const handleSyncShipment = async (orderId: string) => {
    setConfirmingOrderId(orderId)
    try {
      await buyerApi.syncShipment(orderId)
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      toast.success('Cập nhật trạng thái vận chuyển thành công!')
    } catch {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.')
    } finally {
      setConfirmingOrderId(null)
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    setPendingCompleteId(null)
    setCompletingOrderId(orderId)
    try {
      await buyerApi.confirmReceived(orderId)
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      toast.success('Đơn hàng đã hoàn tất! Tiền sẽ được chuyển cho người bán.')
    } catch {
      toast.error('Xác nhận hoàn tất thất bại. Vui lòng thử lại.')
    } finally {
      setCompletingOrderId(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <BuyerAccountLayout>
      <div className="w-full">
        {/* Header row */}
        <div className="mb-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
                Đơn hàng của tôi
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Quản lý và theo dõi tiến trình giao hàng.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm trên trang này..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                }}
                className="pl-9 rounded-xl bg-background border-border/50 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="relative w-full">
            <div className="flex gap-1 overflow-x-auto border-b border-border/50 pb-px scrollbar-hide">
              {TABS.map(({ key, label }) => (
                <Link
                  key={key}
                  href={buildUrl(key, 1)}
                  scroll={false}
                  className={cn(
                    'pb-3 px-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 relative flex items-center gap-1.5',
                    statusFilter === key
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                  {statusFilter === key && (
                    <motion.div
                      layoutId="order-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {[1, 2, 3].map(i => <OrderCardSkeleton key={i} />)}
            </motion.div>
          ) : visibleItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-border/50 bg-card p-12 shadow-sm text-center flex flex-col items-center"
            >
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-archivo)' }}>
                {statusFilter === 'all' ? 'Bạn chưa có đơn hàng nào' : `Không có đơn "${TABS.find(t => t.key === statusFilter)?.label}"`}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm">
                {statusFilter === 'all'
                  ? 'Khám phá các mẫu xe đạp chất lượng đang được bán trên Marketplace với chế độ bảo vệ Escrow 100%.'
                  : 'Thử xem tất cả đơn hàng hoặc chọn tab khác.'}
              </p>
              {statusFilter === 'all' ? (
                <Button asChild className="rounded-xl h-12 px-8 font-bold">
                  <Link href="/marketplace">Mua sắm ngay</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="rounded-xl h-11 px-6">
                  <Link href={buildUrl('all', 1)}>Xem tất cả đơn hàng</Link>
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {visibleItems.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl bg-card border border-border/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-md transition-all duration-300 group"
                >
                  {/* Card header */}
                  <div className="bg-secondary/20 px-5 py-3 border-b border-border/40 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-bold text-foreground uppercase tracking-wider">
                        #{(order.id || 'N/A').split('-')[0].toUpperCase()}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border/80 hidden sm:block" />
                      <span className="text-muted-foreground font-medium hidden sm:inline-block">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <Badge className={cn(
                      'px-3 py-1 rounded-full font-bold border shadow-sm',
                      statusColorMap[order.status]
                    )}>
                      {statusLabelMap[order.status]}
                    </Badge>
                  </div>

                  {/* Card body */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap lg:flex-nowrap gap-5 items-center">
                      {/* Thumbnail */}
                      <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-secondary shrink-0 border border-border/50 shadow-inner group-hover:border-primary/30 transition-colors">
                        {order.listing.images[0] ? (
                          <Image
                            src={order.listing.images[0]}
                            alt={order.listing.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement
                              t.src = 'https://placehold.co/200x200/1a1a1a/aee86c?text=SBE'
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary">
                            <Package className="h-10 w-10 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-1.5">
                          {order.listing.title}
                        </h3>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <p>
                            Thanh toán:{' '}
                            <strong className="text-primary font-bold text-base ml-1" style={{ fontFamily: 'var(--font-archivo)' }}>
                              {formatVND(order.totalPrice)}
                            </strong>
                          </p>
                          <p>
                            Người nhận:{' '}
                            <span className="text-foreground font-medium">
                              {order.receiverName} — {order.receiverPhone}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Dashed separator */}
                      <div className="hidden lg:block w-px h-20 border-l-2 border-dashed border-border/60 mx-2" />
                      <div className="lg:hidden w-full h-px border-t-2 border-dashed border-border/60" />

                      {/* Actions */}
                      <div className="w-full lg:w-44 flex flex-col gap-2.5 shrink-0">
                        {/* pending: pay + cancel */}
                        {order.status === 'pending' && (
                          <>
                            <Button asChild className="w-full h-11 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow">
                              <Link href={`/buyer/checkout?orderId=${order.id}`}>
                                <Wallet className="h-4 w-4 mr-2" />
                                Thanh toán ngay
                              </Link>
                            </Button>
                            <CancelOrderDialog
                              order={order}
                              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })}
                            />
                          </>
                        )}

                        {/* shipping: confirm received -> Actually it's sync shipment */}
                        {order.status === 'shipping' && (
                          <Button
                            variant="outline"
                            className="w-full h-11 rounded-xl font-bold text-sm border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            disabled={confirmingOrderId === order.id}
                            onClick={() => handleSyncShipment(order.id)}
                          >
                            {confirmingOrderId === order.id ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang đồng bộ...</>
                            ) : (
                              <><Package className="h-4 w-4 mr-2" />Cập nhật vận chuyển</>
                            )}
                          </Button>
                        )}

                        {/* delivered: complete order */}
                        {order.status === 'delivered' && (
                          <Button
                            className="w-full h-11 rounded-xl font-bold text-sm bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20 animate-pulse-glow"
                            disabled={completingOrderId === order.id}
                            onClick={() => setPendingCompleteId(order.id)}
                          >
                            {completingOrderId === order.id ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang xử lý...</>
                            ) : (
                              <><CheckCircle className="h-4 w-4 mr-2" />Đã nhận được hàng</>
                            )}
                          </Button>
                        )}

                        {/* completed: review + dispute (mutual exclusion) */}
                        {order.status === 'completed' && (
                          <>
                            {!reviewedOrders.includes(order.id) ? (
                              <ReviewDialog orderId={order.id} listingTitle={order.listing.title}>
                                <Button className="w-full h-11 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20">
                                  <Star className="h-4 w-4 mr-2" />Gửi đánh giá
                                </Button>
                              </ReviewDialog>
                            ) : (
                              <Button disabled variant="outline" className="w-full h-11 rounded-xl font-bold text-sm border-amber-400/50 text-amber-600">
                                <Star className="h-4 w-4 mr-2 fill-amber-400" />Đã đánh giá ✓
                              </Button>
                            )}
                            {!reviewedOrders.includes(order.id) && (
                              <Button asChild variant="outline" className="w-full h-11 rounded-xl font-semibold text-sm border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-400">
                                <Link href={`/buyer/orders/${order.id}/dispute`}>
                                  <ShieldAlert className="h-4 w-4 mr-2" />
                                  Khiếu nại
                                </Link>
                              </Button>
                            )}
                          </>
                        )}

                        {/* View detail — always shown */}
                        <Button
                          asChild
                          variant={order.status === 'pending' ? 'ghost' : 'outline'}
                          className="w-full h-11 rounded-xl font-semibold text-sm"
                        >
                          <Link href={`/buyer/orders/${order.id}`}>
                            Xem chi tiết <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination - hidden during local search to avoid confusion */}
        {orderPage && orderPage.totalPages > 1 && !searchQuery && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-4"
              disabled={page <= 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
            >
              ← Trước
            </Button>

            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: orderPage.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === orderPage.totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                  acc.push(p)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="w-8 text-center text-muted-foreground text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item as number)}
                      className={cn(
                        'w-9 h-9 rounded-xl text-sm font-semibold transition-all',
                        page === item
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      {item}
                    </button>
                  )
                )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-4"
              disabled={page >= orderPage.totalPages || isLoading}
              onClick={() => handlePageChange(page + 1)}
            >
              Sau →
            </Button>
          </div>
        )}
      </div>

      {/* ── Confirm received AlertDialog (REMOVED: syncing shipment is safe) ──────────────────────────────── */}

      {/* ── Complete order AlertDialog ────────────────────────────────── */}
      <AlertDialog open={!!pendingCompleteId} onOpenChange={(open) => !open && setPendingCompleteId(null)}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Hoàn tất đơn hàng?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Sau khi xác nhận hoàn tất,{' '}
              <strong className="text-foreground">tiền sẽ được giải phóng cho người bán</strong> từ tài
              khoản Escrow SBETrust. Hành động này{' '}
              <strong className="text-rose-600">không thể hoàn tác</strong>. Hãy đảm bảo bạn hài lòng
              với chiếc xe trước khi tiếp tục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              onClick={() => pendingCompleteId && handleCompleteOrder(pendingCompleteId)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Xác nhận hoàn tất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BuyerAccountLayout>
  )
}
