'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bike, ClipboardList, ShoppingCart, Trash2, CheckCircle2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useCart, useCartSelectionMutation, useRemoveCartItemMutation } from '@/modules/buyer/hooks/useCart'
import { formatVND } from '@/lib/mock-data'

export default function BuyerCartPage() {
  const { data: cart, isLoading } = useCart()
  const selectionMutation = useCartSelectionMutation()
  const removeMutation = useRemoveCartItemMutation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col">
        <Header />
        <main className="mx-auto max-w-5xl flex-1 px-4 py-10 lg:px-6">
          <div className="h-56 animate-pulse rounded-3xl border border-border/50 bg-card" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col">
        <Header />
        <main className="mx-auto max-w-5xl flex-1 px-4 py-10 lg:px-6">
          <div className="rounded-3xl border border-border/50 bg-card p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
              Giỏ hàng của bạn đang trống
            </h1>
            <p className="mt-3 text-muted-foreground">
              Thêm xe vào giỏ hàng để tiếp tục checkout và thanh toán.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/marketplace" className="gap-2">
                  <Bike className="h-4 w-4" />
                  Tiếp tục mua sắm
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/buyer/orders" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Xem đơn hàng của tôi
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col">
      <Header />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-10 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            Giỏ hàng của bạn
          </h1>
          <p className="mt-2 text-muted-foreground">
            Chọn item muốn thanh toán, bỏ item không cần, sau đó tiếp tục checkout.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:flex-row sm:items-center"
              >
                <button
                  type="button"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    item.isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                  onClick={() =>
                    selectionMutation.mutate({
                      cartItemId: item.id,
                      isSelected: !item.isSelected,
                    })
                  }
                  disabled={selectionMutation.isPending}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>

                <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-border/50 bg-secondary">
                  <Image
                    src={item.listing.images[0] || '/placeholder.png'}
                    alt={item.listing.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://placehold.co/200x200/1a1a1a/aee86c?text=No+Image'
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-lg font-bold text-foreground">{item.listing.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.listing.brand} • {item.listing.frameSize} •{' '}
                    {item.listing.city === 'hanoi' ? 'Hà Nội' :
                     item.listing.city === 'hcm' ? 'TP.HCM' :
                     item.listing.city === 'danang' ? 'Đà Nẵng' : item.listing.city}
                  </p>
                  <p className="mt-3 text-xl font-extrabold text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>
                    {formatVND(item.listing.price)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/marketplace/${item.listingId}`}>Xem chi tiết</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeMutation.mutate(item.id)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa khỏi giỏ hàng</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold">Tổng quan giỏ hàng</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng số item</span>
                  <span className="font-medium">{cart.totalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đã chọn checkout</span>
                  <span className="font-medium">{cart.selectedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-bold text-primary">{formatVND(cart.subtotal)}</span>
                </div>
              </div>

              {cart.selectedCount > 0 ? (
                <Button asChild className="mt-6 h-12 w-full font-bold">
                  <Link href="/buyer/checkout">Tiếp tục checkout</Link>
                </Button>
              ) : (
                <Button className="mt-6 h-12 w-full font-bold" disabled>
                  Tiếp tục checkout
                </Button>
              )}

              {cart.selectedCount === 0 && (
                <p className="mt-3 rounded-xl border border-border/50 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  Chọn ít nhất 1 sản phẩm để tiếp tục thanh toán.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
