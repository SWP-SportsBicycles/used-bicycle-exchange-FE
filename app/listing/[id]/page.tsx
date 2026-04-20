'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart,
  Share2,
  ShieldCheck,
  MapPin,
  Star,
  Clock,
  Phone,
  Home,
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  MessageCircle
} from 'lucide-react'
import { Header } from '@/components/header'
import { DepositModal } from '@/components/deposit-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { 
  getListingById, 
  formatVND, 
  calculateDeposit,
  getConditionColor,
  CONDITIONS,
  type ChecklistItem
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

function StatusIcon({ status }: { status: ChecklistItem['status'] }) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="h-5 w-5 text-success" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    case 'fail':
      return <XCircle className="h-5 w-5 text-destructive" />
  }
}

export default function ListingDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const listing = getListingById(id)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [depositFlowType, setDepositFlowType] = useState<'soft_reserve' | 'inspection_deposit'>('soft_reserve')
  const [isSoftReserved, setIsSoftReserved] = useState(false)
  const [isInspectionDepositPaid, setIsInspectionDepositPaid] = useState(false)

  if (!listing) {
    notFound()
  }

  const depositAmount = calculateDeposit(listing.price)
  const softReserveAmount = Math.min(Math.round(listing.price * 0.02), 500000)
  const conditionLabel = CONDITIONS.find(c => c.value === listing.condition)?.label || listing.condition
  const transactionState = isInspectionDepositPaid
    ? 'inspection_scheduled'
    : isSoftReserved
      ? 'soft_reserved'
      : 'pending_deposit'

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    )
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
              <Image
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Navigation Arrows */}
              {listing.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* VeloSafe Badge */}
              {listing.isVeloSafeVerified && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-success text-success-foreground border-0 gap-1.5 shadow-lg px-3 py-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    VeloSafe Verified
                  </Badge>
                </div>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium">
                {currentImageIndex + 1} / {listing.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg transition-all",
                      index === currentImageIndex 
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${listing.title} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

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
                  <Badge variant="secondary">{listing.category === 'road' ? 'Road Bike' : listing.category === 'mtb' ? 'MTB' : listing.category === 'gravel' ? 'Gravel' : 'Urban'}</Badge>
                  <Badge 
                    variant="outline" 
                    className={cn("border", getConditionColor(listing.condition))}
                  >
                    {conditionLabel}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart className={cn("h-4 w-4", isWishlisted && "fill-destructive text-destructive")} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground lg:text-3xl text-balance" style={{ fontFamily: 'var(--font-archivo)' }}>
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {listing.city === 'hanoi' ? 'Hà Nội' : 
                   listing.city === 'hcm' ? 'TP. Hồ Chí Minh' : 'Đà Nẵng'}
                </span>
                <span className="text-border">|</span>
                <Clock className="h-4 w-4" />
                <span>Đăng {new Date(listing.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {/* Price Card */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-athletic">
              <CardContent className="p-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Giá bán</p>
                    <p className="text-3xl font-extrabold text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>{formatVND(listing.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Cọc kiểm định</p>
                    <p className="text-xl font-bold text-foreground">{formatVND(depositAmount)}</p>
                  </div>
                </div>
                <Button
                  className="w-full mb-2"
                  size="lg"
                  variant={isSoftReserved ? 'secondary' : 'default'}
                  onClick={() => {
                    setDepositFlowType('soft_reserve')
                    setIsDepositModalOpen(true)
                  }}
                >
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  {isSoftReserved ? 'Đã Soft Reserve' : `Soft Reserve (${formatVND(softReserveAmount)})`}
                </Button>
                <Button
                  className="w-full mb-3"
                  size="lg"
                  disabled={!isSoftReserved}
                  onClick={() => {
                    setDepositFlowType('inspection_deposit')
                    setIsDepositModalOpen(true)
                  }}
                >
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  Đặt cọc kiểm định (5-10%)
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Bước 1: Soft Reserve để mở khóa liên hệ. Bước 2: Cọc kiểm định để kích hoạt Inspector.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Trạng thái giao dịch & Escrow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <span className="text-muted-foreground">Trạng thái hiện tại</span>
                  <Badge variant="outline">
                    {transactionState === 'pending_deposit' && 'Chờ Soft Reserve'}
                    {transactionState === 'soft_reserved' && 'Đã Soft Reserve'}
                    {transactionState === 'inspection_scheduled' && 'Đang chờ kiểm định'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <span className="text-muted-foreground">Đang chờ hành động từ</span>
                  <span className="font-medium text-foreground">
                    {transactionState === 'pending_deposit' && 'Buyer'}
                    {transactionState === 'soft_reserved' && 'Buyer (đặt cọc kiểm định)'}
                    {transactionState === 'inspection_scheduled' && 'Inspector'}
                  </span>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="font-medium text-foreground mb-1">Escrow policy</p>
                  <p className="text-muted-foreground">
                    Khoản thanh toán cuối sẽ được giữ trong escrow cho đến khi giao hàng + xác nhận hoàn tất hoặc timeout tự động.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Người bán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {listing.seller.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{listing.seller.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="font-medium text-foreground">{listing.seller.rating}</span>
                      <span>({listing.seller.totalSales} giao dịch)</span>
                    </div>
                  </div>
                </div>

                {/* Locked PII */}
                <div className="space-y-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-not-allowed">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 text-sm text-muted-foreground">
                            {isSoftReserved ? (listing.seller.phone || 'Đã mở khóa - liên hệ qua chat') : '0*** *** ***'}
                          </span>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">Hiển thị sau khi đặt cọc</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Theo chính sách SRS, thông tin liên hệ của Seller chỉ được hiển thị sau khi Buyer đặt cọc thành công.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-not-allowed">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 text-sm text-muted-foreground">
                            {isSoftReserved
                              ? (listing.seller.address || `Đã mở khóa địa chỉ tại ${listing.city === 'hanoi' ? 'Hà Nội' : listing.city === 'hcm' ? 'TP.HCM' : 'Đà Nẵng'}`)
                              : `*** ***, *** ***, ${listing.city === 'hanoi' ? 'Hà Nội' : listing.city === 'hcm' ? 'TP.HCM' : 'Đà Nẵng'}`}
                          </span>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">Hiển thị sau khi đặt cọc</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Địa chỉ đầy đủ sẽ được cung cấp sau khi bạn đặt cọc để đảm bảo quyền riêng tư của người bán.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Nhắn tin với người bán
                </Button>
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
            <Card>
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

          {/* Inspection Report / Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={listing.isVeloSafeVerified ? "border-success/30 shadow-athletic" : "shadow-sm"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {listing.isVeloSafeVerified && (
                    <ShieldCheck className="h-5 w-5 text-success" />
                  )}
                  Báo cáo kiểm định VeloSafe
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listing.inspection && listing.isVeloSafeVerified ? (
                  <div className="space-y-4">
                    {/* Overall Grade */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/30">
                      <div>
                        <p className="text-sm text-muted-foreground">Đánh giá tổng quan</p>
                        <p className="text-lg font-semibold text-foreground">
                          Hạng {listing.inspection.report.overallGrade}
                        </p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground text-2xl font-bold">
                        {listing.inspection.report.overallGrade}
                      </div>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground mb-3">Checklist kiểm tra</p>
                      {[
                        { label: 'Khung xe', item: listing.inspection.report.frameCondition },
                        { label: 'Hệ thống phanh', item: listing.inspection.report.brakeSystem },
                        { label: 'Truyền động', item: listing.inspection.report.drivetrain },
                        { label: 'Bánh xe', item: listing.inspection.report.wheels },
                      ].map((check, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                        >
                          <StatusIcon status={check.item.status} />
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{check.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{check.item.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Inspector Info */}
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        Kiểm định bởi <span className="text-foreground font-medium">{listing.inspection.inspectorName}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(listing.inspection.inspectedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-2">Chưa có báo cáo kiểm định</h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Xe này chưa được kiểm định. Đặt cọc để yêu cầu Inspector VeloSafe kiểm tra xe tại nhà người bán.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
              {listing.usageHistory && (
                <div className="mt-4 p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm font-medium text-foreground mb-1">Lịch sử sử dụng</p>
                  <p className="text-sm text-muted-foreground">{listing.usageHistory}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Deposit Modal */}
      <DepositModal 
        listing={listing}
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        flowType={depositFlowType}
        onSuccess={(flowType) => {
          if (flowType === 'soft_reserve') {
            setIsSoftReserved(true)
          }
          if (flowType === 'inspection_deposit') {
            setIsInspectionDepositPaid(true)
          }
        }}
      />
    </div>
  )
}
