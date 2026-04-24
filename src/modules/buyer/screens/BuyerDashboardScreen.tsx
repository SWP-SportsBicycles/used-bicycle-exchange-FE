'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Package,
  Truck,
  Heart,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { useOrders } from '../hooks/useOrders'
import { useWishlist } from '../hooks/useWishlist'
import { formatVND } from '@/lib/mock-data'
import { type BuyerOrder } from '@/lib/api/buyer-api'

// ── Status helpers ──────────────────────────────────────────────────────────

const statusColorMap: Record<BuyerOrder['status'], string> = {
  pending: 'bg-amber-500',
  paid: 'bg-blue-500',
  shipping: 'bg-indigo-500',
  delivered: 'bg-teal-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-slate-400',
  disputed: 'bg-rose-500',
}

const statusLabelMap: Record<BuyerOrder['status'], string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  shipping: 'Đang vận chuyển',
  delivered: 'Đã giao hàng',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  disputed: 'Khiếu nại',
}

// ── Greeting helper ─────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chào buổi sáng'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
  href,
  urgent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  href: string
  urgent?: boolean
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -3, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm cursor-pointer transition-shadow hover:shadow-md ${
          urgent && value > 0
            ? 'border-amber-300/60 bg-amber-50/80 dark:bg-amber-900/10 dark:border-amber-700/40'
            : 'border-border/40 bg-card'
        }`}
      >
        {urgent && value > 0 && (
          <span className="absolute right-3 top-3 flex h-2 w-2 rounded-full bg-amber-500">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          </span>
        )}
        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
        <p className="text-3xl font-extrabold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
          {value}
        </p>
        <p className="mt-1 text-sm text-muted-foreground font-medium">{label}</p>
      </motion.div>
    </Link>
  )
}

function OrderRowMini({ order }: { order: BuyerOrder }) {
  const isPending = order.status === 'pending'
  return (
    <Link href={`/buyer/orders/${order.id}`} className="group block">
      <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-secondary">
          <Image
            src={order.listing.images[0] || '/placeholder.png'}
            alt={order.listing.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm line-clamp-1 mb-1">
            {order.listing.title}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={`${statusColorMap[order.status]} hover:${statusColorMap[order.status]} text-white border-0 text-[10px] px-2 py-0.5 rounded-full`}
            >
              {statusLabelMap[order.status]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatVND(order.totalPrice)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isPending && (
            <Button asChild size="sm" className="h-8 rounded-lg text-xs font-bold px-3 animate-pulse-glow shadow-sm">
              <Link href={`/buyer/checkout?orderId=${order.id}`}>Thanh toán</Link>
            </Button>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  )
}

function WishlistCardMini({ listing }: { listing: { id: string; title: string; images: string[]; price: number } }) {
  return (
    <Link href={`/marketplace/${listing.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
        <div className="relative h-32 w-full overflow-hidden bg-secondary">
          <Image
            src={listing.images?.[0] || '/placeholder.png'}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{listing.title}</p>
          <p className="text-sm font-bold text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>
            {formatVND(listing.price)}
          </p>
        </div>
      </div>
    </Link>
  )
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function BuyerDashboardScreen() {
  const { user } = useAuth()
  const { data: orderPage, isLoading: isOrdersLoading } = useOrders(1, 10)
  const { data: wishlistPage, isLoading: isWishlistLoading } = useWishlist(1, 4)

  const orders = orderPage?.items ?? []
  const recentOrders = orders.slice(0, 3)

  // Summary counts
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const shippingCount = orders.filter((o) => o.status === 'shipping').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length
  const needsActionCount = pendingCount + deliveredCount

  const wishlistItems = (wishlistPage?.items ?? []).slice(0, 4)
  const wishlistTotal = wishlistPage?.totalCount ?? 0

  const firstName = user.name?.split(' ').pop() || user.name || 'bạn'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background">
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 lg:px-6">

        {/* ── Hero Greeting ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-primary to-primary/70 p-6 shadow-lg md:p-8">
            {/* Background decoration */}
            <div className="absolute right-0 top-0 h-48 w-48 -translate-y-1/4 translate-x-1/4 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-1/4 rounded-full bg-white/5 blur-xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-1 flex items-center gap-2 text-sm font-medium text-primary-foreground/70">
                  <Sparkles className="h-4 w-4" />
                  {getGreeting()}
                </p>
                <h1
                  className="text-3xl font-extrabold text-primary-foreground md:text-4xl"
                  style={{ fontFamily: 'var(--font-archivo)' }}
                >
                  {firstName} 👋
                </h1>
                <p className="mt-2 text-sm text-primary-foreground/70">
                  Tổng quan hoạt động mua sắm của bạn trên VeloTrust
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                <div>
                  <p className="text-xs font-medium text-primary-foreground/70">Tài khoản</p>
                  <p className="text-sm font-bold text-primary-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Action Alert (nếu có việc cần làm) ── */}
        {!isOrdersLoading && needsActionCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-start gap-4 rounded-2xl border border-amber-300/50 bg-amber-50/80 px-5 py-4 dark:border-amber-700/30 dark:bg-amber-900/10">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  Bạn có {needsActionCount} đơn hàng cần xử lý
                </p>
                <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-400/80">
                  {pendingCount > 0 && `${pendingCount} đơn đang chờ thanh toán`}
                  {pendingCount > 0 && deliveredCount > 0 && ' · '}
                  {deliveredCount > 0 && `${deliveredCount} đơn cần xác nhận đã nhận hàng`}
                </p>
              </div>
              <Button asChild size="sm" className="rounded-xl text-xs font-bold shrink-0 h-8">
                <Link href="/buyer/orders">Xem ngay</Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Summary Stats ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Clock className="h-5 w-5 text-amber-600" />}
              label="Chờ thanh toán"
              value={pendingCount}
              color="bg-amber-100 dark:bg-amber-900/30"
              href="/buyer/orders?status=pending"
              urgent
            />
            <StatCard
              icon={<Truck className="h-5 w-5 text-indigo-600" />}
              label="Đang vận chuyển"
              value={shippingCount}
              color="bg-indigo-100 dark:bg-indigo-900/30"
              href="/buyer/orders?status=shipping"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-teal-600" />}
              label="Cần xác nhận"
              value={deliveredCount}
              color="bg-teal-100 dark:bg-teal-900/30"
              href="/buyer/orders?status=delivered"
              urgent
            />
            <StatCard
              icon={<Heart className="h-5 w-5 text-rose-500" />}
              label="Đang theo dõi"
              value={wishlistTotal}
              color="bg-rose-100 dark:bg-rose-900/30"
              href="/buyer/wishlist"
            />
          </div>
        </motion.section>

        {/* ── Grid: Orders + Wishlist ── */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Orders Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-7 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
                <Package className="mr-2 inline-block h-5 w-5 text-primary" />
                Đơn hàng gần đây
              </h2>
              <Button asChild variant="ghost" size="sm" className="rounded-xl text-sm font-semibold text-primary hover:bg-primary/10">
                <Link href="/buyer/orders">
                  Xem tất cả <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {isOrdersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[82px] rounded-2xl border border-border/40 bg-card animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 bg-card py-12 text-center shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground">Chưa có đơn hàng nào</p>
                <p className="mt-1 text-sm text-muted-foreground">Khám phá các mẫu xe đạp chất lượng</p>
                <Button asChild className="mt-4 rounded-xl font-bold">
                  <Link href="/marketplace">Mua sắm ngay</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <OrderRowMini key={order.id} order={order} />
                ))}
                {(orderPage?.totalCount ?? 0) > 3 && (
                  <Button asChild variant="outline" className="w-full rounded-2xl h-11 font-semibold border-border/50">
                    <Link href="/buyer/orders">
                      Xem tất cả {orderPage?.totalCount} đơn hàng
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </motion.section>

          {/* Wishlist Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="lg:col-span-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
                <Heart className="mr-2 inline-block h-5 w-5 text-rose-500" />
                Đang theo dõi
              </h2>
              <Button asChild variant="ghost" size="sm" className="rounded-xl text-sm font-semibold text-primary hover:bg-primary/10">
                <Link href="/buyer/wishlist">
                  Xem tất cả <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {isWishlistLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 rounded-2xl border border-border/40 bg-card animate-pulse" />
                ))}
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 bg-card py-10 text-center shadow-sm">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/20">
                  <Heart className="h-7 w-7 text-rose-400" />
                </div>
                <p className="font-semibold text-foreground text-sm">Wishlist trống</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-[180px]">
                  Bấm ♡ trên listing để theo dõi xe yêu thích
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wishlistItems.map((item) => (
                  <WishlistCardMini key={item.id} listing={item} />
                ))}
              </div>
            )}
          </motion.section>
        </div>

        {/* ── Explore CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-8"
        >
          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-border/40 bg-card p-6 shadow-sm sm:flex-row md:p-8">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Khám phá thêm xe đạp chất lượng
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-lg">
                Hàng trăm mẫu xe đã qua kiểm định bởi VeloTrust — giao dịch an toàn với Escrow 100%.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-2xl font-bold shadow-athletic shrink-0 h-12 px-8">
              <Link href="/marketplace">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Đến Marketplace
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
