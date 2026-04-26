/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { use } from 'react'
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
  ShoppingCart,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Plus
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

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ListingDetailScreen({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: listing, isLoading, isError } = useListingDetail(id)
  const addToCartMutation = useAddToCartMutation()
  const { data: cart } = useCart()

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
    like_new: 'Like New (Như mới)',
    excellent: 'Tuyệt vời',
    good: 'Tốt',
    fair: 'Khá'
  }
  
  const conditionLabel = conditionLabels[listing.condition] || listing.condition
  const canBuyNow = listing.status === 'published' && Boolean(listing.bikeId)

  const specs = [
    { label: 'Thương hiệu', value: listing.brand },
    { label: 'Model', value: listing.model },
    { label: 'Size khung', value: listing.frameSize },
    { label: 'Chất liệu khung', value: listing.frameMaterial },
    { label: 'Groupset', value: listing.groupset },
    { label: 'Cỡ bánh', value: listing.wheelSize },
    { label: 'Tình trạng', value: conditionLabel },
    { label: 'Serial', value: listing.serial },
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
    // listingId: để CheckoutScreen tải thông tin xe hiển thị
    // bikeId: để gọi /api/buyer-order tạo đơn trực tiếp
    const params = new URLSearchParams({
      listingId: listing.id,
      bikeId: listing.bikeId,
    })
    router.push(`/buyer/checkout?${params.toString()}`)
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
          >
            {/* Title & Meta */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">{listing.brand}</Badge>
                  <Badge variant="outline" className="border-border/60 bg-background">
                    {conditionLabel}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <WishlistButton
                    key={listing.bikeId ?? listing.id}
                    listingId={listing.bikeId ?? listing.id}
                    initialIsWishlisted={Boolean(listing.isWishlisted)}
                  />
                  <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground lg:text-4xl text-balance leading-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
                {listing.title}
              </h1>
              <div className="flex items-center gap-3 mt-3 text-muted-foreground text-sm flex-wrap">
                {listing.city && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {listing.city === 'hanoi' ? 'Hà Nội' : 
                         listing.city === 'hcm' ? 'TP. Hồ Chí Minh' : 
                         listing.city === 'danang' ? 'Đà Nẵng' : listing.city}
                      </span>
                    </div>
                    <span className="text-border">|</span>
                  </>
                )}
                {listing.createdAt && !isNaN(new Date(listing.createdAt).getTime()) && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>Đăng {new Date(listing.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>


            {/* Premium CTA Buy Panel */}
            <div className="rounded-3xl border border-border/40 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden p-6 lg:p-8 transition-all duration-300">
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <div className="mb-8 flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Giá bán niêm yết</p>
                  <p className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter" style={{ fontFamily: 'var(--font-archivo)' }}>
                    {formatVND(listing.price)}
                  </p>
                </div>
                {listing.isVeloSafeVerified && (
                  <div className="flex flex-col items-end">
                    <ShieldCheck className="h-6 w-6 text-primary mb-1" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Bảo chứng</span>
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
                  để đặt hàng và thanh toán qua PayOS. Tiền được giữ an toàn trong Escrow VeloTrust cho đến khi bạn xác nhận nhận hàng.
                </p>
              </div>
            </div>

            {/* Seller Security Block (PII Hiding Logic) */}
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border/40">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {listing.seller.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground text-base">{listing.seller.name}</p>
                    <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{listing.seller.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{listing.seller.totalSales} giao dịch thành công</p>
                </div>
              </div>

              {/* Locked PII */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Số điện thoại liên hệ</p>
                    <p className="text-sm font-bold text-slate-400 tracking-widest">0*** *** ***</p>
                  </div>
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                    <Home className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Địa chỉ lấy xe</p>
                    <p className="text-sm font-bold text-slate-400">*** ***, {listing.city === 'hcm' ? 'TP.HCM' : listing.city === 'hanoi' ? 'Hà Nội' : listing.city === 'danang' ? 'Đà Nẵng' : listing.city}</p>
                  </div>
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                
                <p className="text-[11px] text-center text-muted-foreground pt-2">
                  <ShieldCheck className="inline-block h-3.5 w-3.5 mr-1 text-primary" />
                  Thông tin người bán được bảo mật và chỉ mở khóa khi thanh toán thành công.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Sections */}
        <div className="grid gap-8 mt-12 lg:grid-cols-12">
          {/* Specifications & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Condition Alert Block */}
            <div className="rounded-2xl border border-border/50 bg-secondary/20 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Tình trạng xe: {conditionLabel}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(listing as any).usageHistory || "Người bán chưa cung cấp lịch sử sử dụng chi tiết cho chiếc xe này."}
              </p>
            </div>

            <Accordion type="single" collapsible defaultValue="description" className="w-full">
              <AccordionItem value="description" className="border-border/40 border-b">
                <AccordionTrigger className="text-xl font-bold py-6 hover:no-underline hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-archivo)' }}>
                  Mô tả chi tiết
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line pb-6 pt-2">
                    {listing.description}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="specs" className="border-none">
                <AccordionTrigger className="text-xl font-bold py-6 hover:no-underline hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-archivo)' }}>
                  Thông số kỹ thuật
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-2xl border border-border/50 bg-card overflow-hidden my-2">
                    <div className="flex flex-col">
                      {specs.map((spec, index) => (
                        <div 
                          key={index}
                          className={cn(
                            "flex flex-col sm:flex-row sm:items-center py-3 px-5",
                            index !== specs.length - 1 && "border-b border-border/30",
                            index % 2 === 0 ? "bg-background/30" : "bg-muted/10"
                          )}
                        >
                          <span className="text-sm text-muted-foreground sm:w-1/3">{spec.label}</span>
                          <span className="font-medium text-foreground text-sm mt-1 sm:mt-0 sm:w-2/3">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>Mã tin: #{listing.id.substring(0, 8)}</span>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                Báo cáo tin
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
