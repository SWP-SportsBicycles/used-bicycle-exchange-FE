'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bike,
  ClipboardList,
  ShoppingCart,
  Trash2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Check,
  MapPin,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useCart, useCartSelectionMutation, useRemoveCartItemMutation } from '@/modules/buyer/hooks/useCart'
import { formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const CONDITION_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  like_new:  { label: 'Như Mới',    dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' },
  excellent: { label: 'Tuyệt Vời', dot: 'bg-sky-500',     badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300' },
  good:      { label: 'Tốt',       dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300' },
  fair:      { label: 'Khá',       dot: 'bg-rose-400',    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300' },
}

export default function BuyerCartPage() {
  const { data: cart, isLoading } = useCart()
  const selectionMutation = useCartSelectionMutation()
  const removeMutation = useRemoveCartItemMutation()

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="bg-page flex flex-col min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl flex-1 px-4 py-10 lg:px-6 w-full">
          <div className="mb-8 h-14 w-64 animate-pulse rounded-2xl bg-muted" />
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {[1, 2].map(i => (
                <div key={i} className="h-36 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
            <div className="lg:col-span-4">
              <div className="h-64 animate-pulse rounded-3xl bg-muted" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── Empty State ── */
  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-page flex flex-col min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl flex-1 px-4 py-16 lg:px-6 w-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border/50 bg-card p-10 text-center shadow-sm max-w-md w-full"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
              Giỏ hàng trống
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Bạn chưa thêm xe nào vào giỏ hàng. Hãy khám phá hàng trăm xe đạp chất lượng trên SBE Marketplace.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="gap-2 h-11">
                <Link href="/marketplace">
                  <Bike className="h-4 w-4" />
                  Khám phá xe đạp
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2 h-11">
                <Link href="/buyer/orders">
                  <ClipboardList className="h-4 w-4" />
                  Xem đơn hàng
                </Link>
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── Cart with items ── */
  return (
    <div className="bg-page flex flex-col min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-10 lg:px-6 w-full">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
              Giỏ hàng
            </h1>
            <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
              {cart.items.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Chọn xe muốn thanh toán, sau đó tiếp tục checkout.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">

          {/* ── Cart Items ── */}
          <div className="space-y-3 lg:col-span-8">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item, index) => {
                const cond = CONDITION_CONFIG[item.listing.condition] ?? CONDITION_CONFIG.good
                const isRemoving = removeMutation.isPending
                const isToggling = selectionMutation.isPending

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.97 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex flex-col gap-4 rounded-3xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center transition-all duration-200',
                      item.isSelected
                        ? 'border-primary/30 shadow-[0_0_0_2px_hsl(var(--primary)/0.12)]'
                        : 'border-border/50'
                    )}
                  >
                    {/* ── Selection Checkbox ── */}
                    <button
                      type="button"
                      aria-label={item.isSelected ? 'Bỏ chọn' : 'Chọn để thanh toán'}
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
                        item.isSelected
                          ? 'border-primary bg-primary text-primary-foreground scale-105'
                          : 'border-border bg-background text-transparent hover:border-primary/50'
                      )}
                      onClick={() =>
                        selectionMutation.mutate({ cartItemId: item.id, isSelected: !item.isSelected })
                      }
                      disabled={isToggling}
                    >
                      <Check className="h-4 w-4" />
                    </button>

                    {/* ── Thumbnail ── */}
                    <Link
                      href={`/marketplace/${item.listing.id ?? item.listingId}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-secondary block"
                    >
                      <Image
                        src={item.listing.images?.[0] || '/placeholder.png'}
                        alt={item.listing.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement
                          t.src = 'https://placehold.co/200x200/1a1a1a/aee86c?text=SBE'
                        }}
                      />
                    </Link>

                    {/* ── Info ── */}
                    <div className="min-w-0 flex-1">
                      {/* Badges row */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                          cond.badge
                        )}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', cond.dot)} />
                          {cond.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#aee86c]/20 border border-[#aee86c]/40 px-2 py-0.5 text-[10px] font-semibold text-[#2a4a10] dark:text-[#aee86c]">
                          <ShieldCheck className="h-3 w-3" />
                          SBESafe
                        </span>
                      </div>

                      <Link href={`/marketplace/${item.listing.id ?? item.listingId}`}>
                        <p className="line-clamp-2 text-[15px] font-bold text-foreground hover:text-primary transition-colors leading-snug">
                          {item.listing.title}
                        </p>
                      </Link>

                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="font-semibold uppercase tracking-wide">{item.listing.brand}</span>
                        {item.listing.frameSize && <><span>·</span><span>Size {item.listing.frameSize}</span></>}
                        {item.listing.city && (
                          <>
                            <span>·</span>
                            <MapPin className="h-3 w-3" />
                            <span>
                              {item.listing.city === 'hanoi' ? 'Hà Nội' :
                               item.listing.city === 'hcm' ? 'TP.HCM' :
                               item.listing.city === 'danang' ? 'Đà Nẵng' : item.listing.city}
                            </span>
                          </>
                        )}
                      </p>

                      <p
                        className="mt-2.5 text-xl font-extrabold text-primary"
                        style={{ fontFamily: 'var(--font-archivo)' }}
                      >
                        {formatVND(item.listing.price)}
                      </p>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                      <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5">
                        <Link href={`/marketplace/${item.listing.id ?? item.listingId}`}>
                          Xem chi tiết
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => removeMutation.mutate(item.id)}
                        disabled={isRemoving}
                        aria-label="Xóa khỏi giỏ hàng"
                      >
                        {isRemoving ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="sticky top-24 rounded-3xl border border-border/50 bg-card p-6 shadow-sm"
            >
              <h2 className="text-base font-bold mb-5">Tổng quan đơn hàng</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tổng số xe</span>
                  <span className="font-medium">{cart.totalCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Đã chọn</span>
                  <span className={cn('font-medium', cart.selectedCount > 0 ? 'text-primary' : '')}>
                    {cart.selectedCount} xe
                  </span>
                </div>
              </div>

              {/* Divider + subtotal */}
              <div className="my-4 border-t border-border/40" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Tạm tính</span>
                <span
                  className="text-xl font-extrabold text-primary"
                  style={{ fontFamily: 'var(--font-archivo)' }}
                >
                  {formatVND(cart.subtotal)}
                </span>
              </div>

              {/* CTA */}
              <Button
                asChild={cart.selectedCount > 0}
                className="mt-5 h-12 w-full font-bold gap-2"
                disabled={cart.selectedCount === 0}
              >
                {cart.selectedCount > 0 ? (
                  <Link href="/buyer/checkout">
                    Tiếp tục checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span>Chọn xe để checkout</span>
                )}
              </Button>

              {/* Select hint */}
              {cart.selectedCount === 0 && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Nhấn vào vòng tròn ở mỗi xe để chọn.
                </p>
              )}

              {/* Escrow trust badge */}
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-primary/5 border border-primary/15 px-4 py-3">
                <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Thanh toán bảo mật qua{' '}
                  <span className="font-semibold text-foreground">Escrow SBESafe</span>
                  . Tiền chỉ giải phóng khi bạn xác nhận nhận xe.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
