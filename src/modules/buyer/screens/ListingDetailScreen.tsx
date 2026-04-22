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
  ArrowLeft,
  ShoppingCart
} from 'lucide-react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { formatVND } from '@/lib/mock-data'
import { toast } from 'sonner'
import { useListingDetail } from '@/modules/buyer/hooks/useListingDetail'
import { useAddToCartMutation } from '@/modules/buyer/hooks/useCheckout'
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 animate-pulse">
          <div className="h-8 w-40 bg-muted rounded mb-6" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-4/3 bg-muted rounded-xl" />
            <div className="space-y-4">
              <div className="h-10 w-3/4 bg-muted rounded" />
              <div className="h-6 w-1/2 bg-muted rounded" />
              <div className="h-40 w-full bg-muted rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Không tìm thấy xe đạp</h2>
          <p className="mt-2 text-muted-foreground">Chiếc xe này có thể đã bị xóa hoặc không còn khả dụng.</p>
          <Button asChild className="mt-6">
            <Link href="/marketplace">Quay lại Marketplace</Link>
          </Button>
        </main>
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


  
  const handleBuyNow = () => {
    if (!listing) return
    
    addToCartMutation.mutate({ listingId: listing.id, quantity: 1 }, {
      onSuccess: () => {
        router.push(`/buyer/checkout?listingId=${listing.id}`)
      },
      onError: (err) => {
        toast.error("Không thể thêm vào giỏ hàng. Xe này có thể đã bị mua.")
        console.error(err)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center justify-between">
          <Link 
            href="/marketplace"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <ListingGallery 
            images={listing.images} 
            title={listing.title} 
            isVeloSafeVerified={listing.isVeloSafeVerified} 
          />

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="uppercase">{listing.category}</Badge>
                  <Badge variant="outline" className="border">
                    {conditionLabel}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <WishlistButton 
                    listingId={listing.id} 
                    // initialIsWishlisted={listing.isWishlisted} // if backend provides it
                  />
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground lg:text-3xl text-balance" style={{ fontFamily: 'var(--font-archivo)' }}>
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>
                  {listing.city === 'hanoi' ? 'Hà Nội' : 
                   listing.city === 'hcm' ? 'TP. Hồ Chí Minh' : 
                   listing.city === 'danang' ? 'Đà Nẵng' : listing.city}
                </span>
                <span className="text-border">|</span>
                <Clock className="h-4 w-4" />
                <span>Đăng {new Date(listing.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {/* CTA Buy Card */}
            <Card className="border-primary/30 bg-linear-to-br from-primary/5 to-primary/10 shadow-athletic">
              <CardContent className="p-6">
                <div className="mb-5">
                  <p className="text-sm text-muted-foreground mb-1">Giá bán niêm yết</p>
                  <p className="text-4xl font-extrabold text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>{formatVND(listing.price)}</p>
                </div>
                
                <Button
                  className="w-full h-12 text-lg font-bold shadow-lg animate-pulse-glow"
                  onClick={handleBuyNow}
                  disabled={listing.isLocked || listing.status !== 'published'}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {listing.isLocked ? "Đang có người giao dịch" : "Mua Ngay - Khóa Xe (5:00)"}
                </Button>
                
                <p className="mt-3 text-xs text-center text-muted-foreground">
                  Bấm Mua ngay sẽ giữ xe cho bạn trong 5 phút để hoàn tất thanh toán. 
                  Tiền được bảo vệ bởi Escrow VeloTrust.
                </p>
              </CardContent>
            </Card>

            {/* Seller Info (PII Hiding Logic) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Người bán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {listing.seller.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{listing.seller.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="font-semibold text-foreground">{listing.seller.rating}</span>
                      <span>({listing.seller.totalSales} giao dịch)</span>
                    </div>
                  </div>
                </div>

                {/* Locked PII */}
                <div className="space-y-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-not-allowed border border-border/50">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 text-sm text-muted-foreground font-medium">
                            {listing.seller.phone ? listing.seller.phone : '0*** *** *** (Đã ẩn)'}
                          </span>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-semibold text-sm">Bảo vệ quyền riêng tư</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Số điện thoại chỉ hiện đầy đủ cho người mua sau khi đã thanh toán thành công.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-not-allowed border border-border/50">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 text-sm text-muted-foreground font-medium">
                            {listing.seller.district || `*** ***, ${listing.city}`}
                          </span>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-semibold text-sm">Bảo vệ quyền riêng tư</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Địa chỉ lấy hàng chi tiết sẽ hiển thị trong Đơn hàng sau khi bạn thanh toán.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Sections */}
        <div className="grid gap-6 mt-8 lg:grid-cols-2">
          {/* Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Thông số kỹ thuật
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {specs.map((spec, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-secondary/50"
                    >
                      <p className="text-xs text-muted-foreground mb-1">{spec.label}</p>
                      <p className="font-medium text-foreground text-sm">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Mô tả chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
                  {listing.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
