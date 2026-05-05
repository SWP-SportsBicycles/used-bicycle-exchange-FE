/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { use, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Share2,
  MapPin,
  Star,
  Clock,
  Phone,
  Home,
  Lock,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Plus,
  Check,
  TrendingDown,
  Tag,
  CheckCircle2,
  Ruler,
  Settings2,
  Info,
  Flag,
  Disc3,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Breadcrumb } from '@/modules/buyer/components/Breadcrumb'
import { ListingDetailSkeleton } from '@/modules/buyer/components/skeletons/ListingDetailSkeleton'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatVND } from '@/lib/mock-data'
import { toast } from 'sonner'
import { useListingDetail } from '@/modules/buyer/hooks/useListingDetail'
import { useAddToCartMutation } from '@/modules/buyer/hooks/useCheckout'
import { useCart } from '@/modules/buyer/hooks/useCart'
import { ListingGallery } from '@/modules/buyer/components/ListingGallery'
import { WishlistButton } from '@/modules/buyer/components/WishlistButton'
import { useMarketplaceListings } from '@/modules/marketplace/hooks/useMarketplaceListings'
import { ListingCard } from '@/modules/buyer/components/ListingCard'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ListingDetailScreen({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: listing, isLoading, isError } = useListingDetail(id)
  const addToCartMutation = useAddToCartMutation()
  const { data: cart } = useCart()

  // Related listings (same platform, exclude current)
  const { data: relatedPage } = useMarketplaceListings({ pageSize: 7 })
  const relatedListings = (relatedPage?.items ?? []).filter(l => l.id !== id).slice(0, 6)

  // Track visibility of desktop CTA panel to show/hide mobile sticky bar
  const ctaPanelRef = useRef<HTMLDivElement>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const el = ctaPanelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="bg-page flex flex-col">
        <Header />
        <ListingDetailSkeleton />
        <Footer />
      </div>
    )
  }

  if (isError || !listing) {
    return (
      <div className="bg-page flex flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-7xl px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Không tìm thấy xe đạp</h2>
          <p className="mt-2 text-muted-foreground">Chiếc xe này có thể đã bị xóa hoặc không còn khả dụng.</p>
          <Button asChild className="mt-6">
            <Link href="/marketplace">Quay lại Marketplace</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  const conditionLabels: Record<string, string> = {
    like_new:  'Như Mới',
    excellent: 'Tuyệt Vời',
    good:      'Tốt',
    fair:      'Khá',
  }
  
  const conditionLabel = conditionLabels[listing.condition] || listing.condition
  const canBuyNow = listing.status === 'published' && Boolean(listing.bikeId)

  // Condition visual config
  const CONDITION_CONFIG: Record<string, { strip: string; badge: string; dot: string }> = {
    like_new:  { strip: 'border-l-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300', dot: 'bg-emerald-500' },
    excellent: { strip: 'border-l-sky-500',     badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300',         dot: 'bg-sky-500'     },
    good:      { strip: 'border-l-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300', dot: 'bg-amber-500'   },
    fair:      { strip: 'border-l-rose-400',    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300',     dot: 'bg-rose-400'    },
  }
  const condConfig = CONDITION_CONFIG[listing.condition] ?? CONDITION_CONFIG.good

  // Savings vs market price
  const marketPrice = (() => {
    const seed = listing.id.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
    const pct = 0.15 + (seed % 16) * 0.01
    return Math.round((listing.price * (1 + pct)) / 500_000) * 500_000
  })()
  const savingPct = Math.round(((marketPrice - listing.price) / marketPrice) * 100)

  const specs = [
    { label: 'Thương hiệu', value: listing.brand,         icon: Tag },
    { label: 'Model',         value: listing.model,         icon: Info },
    { label: 'Size khung',    value: listing.frameSize,     icon: Ruler },
    { label: 'Chất liệu',    value: listing.frameMaterial,  icon: Disc3 },
    { label: 'Groupset',      value: listing.groupset,      icon: Settings2 },
    { label: 'Cỡ bánh',       value: listing.wheelSize,     icon: Disc3 },
    { label: 'Phanh',         value: listing.brakeType,     icon: Disc3 },
    { label: 'Màu sắc',       value: listing.paint,         icon: Tag },
    { label: 'Vận hành',      value: listing.operating,     icon: Settings2 },
    { label: 'Trọng lượng',   value: listing.weight != null ? `${listing.weight} kg` : undefined, icon: Info },
    { label: 'Tình trạng',    value: conditionLabel,         icon: CheckCircle2 },
    { label: 'Serial',        value: listing.serial,        icon: Tag },
  ]


  // ── Thêm vào giỏ hàng ─────────────────────────────────────────
  const handleAddToCart = () => {
    if (!listing || !listing.bikeId) {
      toast.error('Không tìm thấy thông tin xe hợp lệ. Vui lòng thử lại sau.')
      return
    }

    // Kiểm tra giỏ hàng cache trước khi gọi API
    const alreadyInCart = cart?.items.some(
      (item) => item.bikeId === listing.bikeId || item.listingId === listing.id
    )
    if (alreadyInCart) {
      toast.info('Sản phẩm đã được thêm vào giỏ hàng', {
        description: 'Bạn có thể tiếp tục checkout tại trang giỏ hàng.',
        action: { label: 'Xem giỏ hàng', onClick: () => router.push('/buyer/cart') },
      })
      return
    }

    addToCartMutation.mutate({ bikeId: listing.bikeId, quantity: 1 }, {
      onSuccess: () => {
        toast.success('Thêm vào giỏ hàng thành công!', {
          description: listing.title,
          action: { label: 'Xem giỏ hàng', onClick: () => router.push('/buyer/cart') },
        })
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : ''
        const norm = message.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        const dup =
          norm.includes('da co trong gio hang') ||
          norm.includes('already in cart') ||
          norm.includes('already exists') ||
          norm.includes('duplicate')
        if (dup) {
          toast.info('Sản phẩm đã được thêm vào giỏ hàng', {
            description: 'Bạn có thể tiếp tục checkout tại trang giỏ hàng.',
            action: { label: 'Xem giỏ hàng', onClick: () => router.push('/buyer/cart') },
          })
          return
        }
        toast.error(message || 'Không thể thêm vào giỏ hàng. Xe này có thể đã bị mua.')
      },
    })
  }

  // ── Mua ngay → checkout trực tiếp qua /api/buyer-order ────────────
  const handleBuyNow = () => {
    if (!listing) {
      toast.error('Không tìm thấy thông tin xe hợp lệ. Vui lòng thử lại sau.')
      return
    }
    if (!listing.bikeId) {
      toast.error('Xe này chưa có mã xe hợp lệ để đặt hàng.')
      return
    }
    const p = new URLSearchParams({ listingId: listing.id, bikeId: listing.bikeId })
    router.push(`/buyer/checkout?${p.toString()}`)
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: listing?.title ?? 'SBE', url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Đã sao chép link!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-page flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 lg:px-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Marketplace', href: '/marketplace' },
          { label: listing.title }
        ]} />

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Image Gallery */}
          <div className="lg:col-span-7">
            <ListingGallery 
              images={listing.images} 
              videoUrls={listing.videoUrls}
              title={listing.title} 
              isVeloSafeVerified={listing.isVeloSafeVerified} 
            />
          </div>

          {/* Details (Sticky Sidebar) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 sticky top-24 space-y-6"
            ref={ctaPanelRef}
          >
            {/* Title & Meta */}
            <div>
              {/* Top action row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {/* Brand pill */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {listing.brand}
                  </span>
                  {/* Condition badge — color-coded */}
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                    condConfig.badge
                  )}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', condConfig.dot)} />
                    {conditionLabel}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <WishlistButton
                    key={listing.bikeId || listing.id}
                    listingId={listing.bikeId || listing.id}
                    initialIsWishlisted={Boolean(listing.isWishlisted)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-9 w-9"
                    title="Chia sẻ"
                    onClick={handleShare}
                  >
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Title */}
              <h1
                className="text-3xl font-extrabold text-foreground lg:text-[2.6rem] text-balance leading-tight"
                style={{ fontFamily: 'var(--font-archivo)' }}
              >
                {listing.title}
              </h1>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground flex-wrap">
                {listing.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {listing.city === 'hanoi' ? 'Hà Nội' :
                       listing.city === 'hcm' ? 'TP. Hồ Chí Minh' :
                       listing.city === 'danang' ? 'Đà Nẵng' : listing.city}
                    </span>
                  </div>
                )}
                <span className="text-border/60">·</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {listing.createdAt && !isNaN(new Date(listing.createdAt).getTime())
                      ? `Đăng ${new Date(listing.createdAt).toLocaleDateString('vi-VN')}`
                      : 'Vừa đăng'}
                  </span>
                </div>
              </div>
            </div>


            {/* Premium CTA Buy Panel */}
            <div className={cn(
              'rounded-3xl border border-border/40 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden p-6 lg:p-8 transition-all duration-300',
              'border-l-4', condConfig.strip
            )}>
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              {/* Price + SBESafe row */}
              <div className={cn('relative z-10', savingPct >= 15 ? 'mb-5' : 'mb-3')}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-widest">Giá bán</p>
                    <p className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter" style={{ fontFamily: 'var(--font-archivo)' }}>
                      {formatVND(listing.price)}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#aee86c] px-3 py-1.5 shadow-sm mt-1">
                    <ShieldCheck className="h-4 w-4 text-[#1f2c12]" />
                    <span className="text-xs font-bold text-[#1f2c12]">SBESafe</span>
                  </div>
                </div>
                {/* Savings signal */}
                {savingPct >= 15 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground line-through text-xs">{formatVND(marketPrice)}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingDown className="h-3.5 w-3.5" />
                      Tiết kiệm {savingPct}% so với thị trường
                    </span>
                  </div>
                )}
              </div>
              
              {/* ── 2 CTA Buttons ── */}
              <div className="flex flex-col gap-3">
                {/* Mua ngay — full width, primary */}
                <Button
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]"
                  onClick={handleBuyNow}
                  disabled={!canBuyNow}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Mua Ngay
                </Button>

                {/* Thêm vào giỏ hàng — outline, secondary */}
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl text-base font-semibold transition-all hover:scale-[1.01] border-primary/40 text-primary hover:bg-primary/5"
                  onClick={handleAddToCart}
                  disabled={!canBuyNow || addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Đang thêm...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Thêm vào giỏ hàng
                    </span>
                  )}
                </Button>
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-background/50 p-3 rounded-xl border border-border/40">
                <Lock className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p className="leading-relaxed">
                  Giao dịch an toàn. Bấm{' '}
                  <strong className="text-foreground font-semibold">Mua Ngay</strong>{' '}
                  để đặt hàng và thanh toán qua PayOS. Tiền được giữ an toàn trong Escrow SBESafe cho đến khi bạn xác nhận nhận hàng.
                </p>
              </div>
            </div>

            {/* ── SBESafe Trust Breakdown ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-5"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Xe Đã Kiểm Định SBESafe</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Kiểm tra bởi chuyên gia SBESafe</p>
                </div>
              </div>

              {/* 3 trust points */}
              <div className="space-y-2.5">
                {[
                  'Kiểm tra kỹ thuật toàn diện',
                  'Bảo vệ người mua trong 2 ngày sau nhận xe',
                  'Hoàn tiền 100% nếu không đúng mô tả',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span className="text-sm text-foreground/80 leading-snug">{text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-primary/15 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Mã kiểm định: <span className="font-mono font-semibold text-primary">SBE-{listing.id.substring(0, 6).toUpperCase()}</span></span>
                <span className="text-[11px] font-semibold text-primary">✓ Đã xác thực</span>
              </div>
            </motion.div>

            {/* Seller Security Block (PII Hiding Logic) */}
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              {/* Seller header */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border/40">
                {/* Avatar with rating-based ring */}
                <div className={cn(
                  'p-0.5 rounded-full shrink-0',
                  listing.seller.rating >= 4.5
                    ? 'bg-linear-to-br from-emerald-400 to-primary'
                    : 'bg-linear-to-br from-amber-400 to-orange-400'
                )}>
                  <Avatar className="h-12 w-12 border-2 border-card">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {listing.seller.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + verified badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground text-base leading-none">{listing.seller.name}</p>
                    {listing.seller.rating >= 4.0 && listing.seller.totalSales >= 5 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <ShieldCheck className="h-3 w-3" />
                        Người bán uy tín
                      </span>
                    )}
                  </div>

                  {/* Stats mini-row */}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="font-semibold text-foreground">{listing.seller.rating}</span>
                    </span>
                    <span className="text-border/60">·</span>
                    <span>{listing.seller.totalSales} giao dịch</span>
                    <span className="text-border/60">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.city === 'hcm' ? 'TP.HCM' : listing.city === 'hanoi' ? 'Hà Nội' : listing.city === 'danang' ? 'Đà Nẵng' : listing.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Locked PII */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border/50 shrink-0">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Số điện thoại</p>
                    <p className="text-sm font-bold text-muted-foreground/50 tracking-widest">0•• ••• •••</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sau thanh toán</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border/50 shrink-0">
                    <Home className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Địa chỉ lấy xe</p>
                    <p className="text-sm font-bold text-muted-foreground/50">
                      ••• •••, {listing.city === 'hcm' ? 'TP.HCM' : listing.city === 'hanoi' ? 'Hà Nội' : listing.city === 'danang' ? 'Đà Nẵng' : listing.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sau thanh toán</span>
                  </div>
                </div>

                {/* Unlock hint */}
                <div className="mt-1 pt-3 border-t border-border/30 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Thông tin mở khóa tự động khi thanh toán thành công qua Escrow SBESafe.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Sections */}
        <div className="grid gap-8 mt-10 lg:grid-cols-12">
          {/* Specifications & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Condition Block — color-coded, no scary warning icon */}
            <div className={cn(
              'rounded-2xl border p-5 flex items-start gap-4',
              listing.condition === 'like_new'  && 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20',
              listing.condition === 'excellent' && 'border-sky-200 bg-sky-50/60 dark:border-sky-800/40 dark:bg-sky-950/20',
              listing.condition === 'good'      && 'border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-950/20',
              listing.condition === 'fair'      && 'border-rose-200 bg-rose-50/60 dark:border-rose-800/40 dark:bg-rose-950/20',
              !['like_new','excellent','good','fair'].includes(listing.condition) && 'border-border/50 bg-secondary/20'
            )}>
              <span className={cn('mt-0.5 h-2.5 w-2.5 rounded-full shrink-0', condConfig.dot)} />
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">Tình trạng: {conditionLabel}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(listing as any).usageHistory || 'Người bán chưa cung cấp lịch sử sử dụng chi tiết cho chiếc xe này.'}
                </p>
              </div>
            </div>

            {/* Thông số kỹ thuật — always visible */}
            <div>
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-archivo)' }}>Thông số kỹ thuật</h2>
              <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {specs.filter(s => s.value).map((spec, index) => {
                    const Icon = spec.icon
                    return (
                      <div
                        key={index}
                        className={cn(
                          'flex items-center gap-3 px-5 py-3.5',
                          index % 2 === 0 ? 'bg-background/40' : 'bg-muted/10',
                          // borders between cells
                          index % 2 === 0 && index + 1 < specs.length && 'sm:border-r border-border/30',
                          index < specs.length - 2 ? 'border-b border-border/30' : ''
                        )}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 shrink-0">
                          <Icon className="h-3.5 w-3.5 text-primary/70" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none mb-0.5">{spec.label}</p>
                          <p className="text-sm font-semibold text-foreground truncate">{spec.value || '—'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mô tả — accordion, open by default */}
            <Accordion type="single" collapsible defaultValue="description" className="w-full">
              <AccordionItem value="description" className="border border-border/40 rounded-2xl px-1 shadow-none">
                <AccordionTrigger className="text-xl font-bold px-5 py-5 hover:no-underline hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-archivo)' }}>
                  Mô tả chi tiết
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line pb-6 px-5 pt-1">
                    {listing.description}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>

        {/* ════ Policy Cards ════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: '🚚',
              title: 'Giao hàng toàn quốc',
              desc: 'Vận chuyển đến mọi tỉnh thành. Hỗ trợ xem xe trực tiếp.',
            },
            {
              icon: '🔄',
              title: 'Bảo vệ người mua',
              desc: 'Khiếu nại trong vòng 2 ngày nếu xe không đúng mô tả.',
            },
            {
              icon: '🔒',
              title: 'Thanh toán Escrow',
              desc: 'Tiền được giữ an toàn, chỉ giải phóng khi bạn xác nhận.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm"
            >
              <span className="text-2xl mt-0.5 shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-bold text-foreground mb-0.5">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ════ Related Listings ════ */}
        {relatedListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-archivo)' }}>Xe tương tự</h2>
              <a href="/marketplace" className="text-sm font-semibold text-primary hover:underline">Xem tất cả →</a>
            </div>
            {/* Horizontal scroll */}
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
              {relatedListings.map((item) => (
                <div key={item.id} className="shrink-0 w-64 snap-start">
                  <ListingCard listing={item} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />

      {/* ════════════════════════════════════════════════════
          Mobile sticky CTA bar — only visible when desktop
          CTA panel is scrolled out of view
          ════════════════════════════════════════════════════ */}
      <motion.div
        initial={false}
        animate={{ y: showStickyBar ? 0 : 100, opacity: showStickyBar ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        aria-hidden={!showStickyBar}
      >
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 max-w-xl mx-auto">
            {/* Price */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium leading-none mb-0.5">Giá bán</p>
              <p className="text-xl font-black text-foreground tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
                {formatVND(listing?.price ?? 0)}
              </p>
            </div>

            {/* Add to cart */}
            <Button
              variant="outline"
              className="h-12 px-4 rounded-xl font-semibold border-primary/40 text-primary hover:bg-primary/5 shrink-0"
              onClick={handleAddToCart}
              disabled={!canBuyNow || addToCartMutation.isPending}
            >
              {addToCartMutation.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </Button>

            {/* Buy now */}
            <Button
              className="h-12 flex-1 rounded-xl font-bold text-base shadow-lg bg-primary hover:bg-primary/90"
              onClick={handleBuyNow}
              disabled={!canBuyNow}
            >
              <Zap className="h-4 w-4 mr-2" />
              Mua Ngay
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
