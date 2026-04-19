'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  Clock,
  ShieldCheck,
  Truck,
  MessageCircle,
  AlertCircle,
  FileText
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DetailPageLoading } from '@/components/detail-page-loading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { type Listing, formatVND } from '@/lib/mock-data'
import { getListingDetail } from '@/lib/services/listing-detail-source'
import { cn } from '@/lib/utils'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

/** Demo states for the transaction step. 
 * Real app would have these from the database. */
const STEPS = [
  { id: 'soft_reserve', label: 'Soft Reserve', description: 'Đã hoàn tất đặt cọc 2%' },
  { id: 'inspection', label: '10% Cọc & Kiểm định', description: 'Đang kiểm tra xe' },
  { id: 'full_payment', label: 'Thanh toán Escrow', description: 'Khóa tiền an toàn' },
  { id: 'shipping', label: 'Giao hàng', description: 'Vận chuyển đến bạn' },
  { id: 'done', label: 'Hoàn tất', description: 'Xác nhận nhận xe' },
]

export default function TransactionPage({ params }: PageProps) {
  const { id } = use(params)
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoadingListing, setIsLoadingListing] = useState(true)
  const [isListingMissing, setIsListingMissing] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadListing() {
      setIsLoadingListing(true)
      const row = await getListingDetail(id)

      if (!isMounted) {
        return
      }

      setListing(row)
      setIsListingMissing(!row)
      setIsLoadingListing(false)
    }

    loadListing()

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoadingListing) {
    return <DetailPageLoading />
  }

  if (isListingMissing || !listing) notFound()

  // For demo, we assume the transaction is in the "inspection" stage where 10% is paid,
  // or it just got scheduled. We will hardcode currentStepIndex for visualization.
  const currentStepIndex = 1

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 lg:px-8">
        <nav className="mb-6">
          <Link 
            href="/orders"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Đơn hàng của tôi
          </Link>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
              Trung tâm giao dịch
            </h1>
            <p className="text-muted-foreground mt-2">
              Mã giao dịch: <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground">VT-{listing.id.toUpperCase()}-X9</span>
            </p>
          </div>
          <Badge variant="outline" className="text-base py-1 px-3 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 gap-1.5 rounded-full">
            <Clock className="h-4 w-4 shrink-0" />
            Đang chờ kiểm định
          </Badge>
        </div>


        <section className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="premium-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="eyebrow-chip">Managed order flow</div>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-foreground">
                  One transaction record from reserve to delivery
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  This page now reads like a real control hub: progress, escrow posture, and next-owner action
                  sit together instead of feeling like separate demo states.
                </p>
              </div>
              <Badge className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">
                Inspection stage
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: ShieldCheck,
                label: 'Escrow posture',
                value: 'Funds partially locked',
                sub: 'Reserve and deposit are visible before final settlement.',
              },
              {
                icon: FileText,
                label: 'Current milestone',
                value: 'Inspector coordination',
                sub: 'The report step is the next trust unlock for the buyer.',
              },
              {
                icon: Truck,
                label: 'What comes next',
                value: 'Full payment then shipping',
                sub: 'Keeps the buyer clear on the commercial sequence.',
              },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="premium-subpanel p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </div>
                <div className="mt-3 text-sm font-bold leading-6 tracking-[-0.02em] text-foreground">{value}</div>
                <div className="mt-2 text-xs leading-5 text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </section>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Stepper */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Tiến trình giao dịch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-border pointer-events-none" />
                  
                  <div className="space-y-6">
                    {STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStepIndex
                      const isCurrent = idx === currentStepIndex
                      
                      return (
                        <div key={step.id} className="relative flex gap-4 pl-1">
                          <div className={cn(
                            "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-background",
                            isCompleted ? "border-success bg-success/10 text-success" :
                            isCurrent ? "border-primary bg-primary/10 text-primary" :
                            "border-muted text-muted-foreground"
                          )}>
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : 
                             isCurrent ? <CircleDashed className="h-4 w-4 animate-[spin_3s_linear_infinite]" /> : 
                             <span className="text-xs font-bold">{idx + 1}</span>}
                          </div>
                          
                          <div className={cn("flex-1 pb-2", isCurrent ? "" : "opacity-70")}>
                            <h4 className={cn("text-sm font-bold", isCurrent ? "text-primary" : "text-foreground")}>
                              {step.label}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                            
                            {/* Actions for Current Step */}
                            {isCurrent && step.id === 'inspection' && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 rounded-lg bg-secondary/50 border border-primary/10 p-4"
                              >
                                <p className="text-sm text-foreground mb-3">
                                  Inspector đang tiến hành liên hệ với Seller để đặt lịch kiểm tra xe. Báo cáo sẽ được trả về trong thời gian sớm nhất.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Button size="sm" variant="outline" className="bg-background">
                                    <MessageCircle className="h-4 w-4 mr-2" /> Nhắn tin Inspector
                                  </Button>
                                  <Button size="sm" variant="outline" className="bg-background">
                                    <MessageCircle className="h-4 w-4 mr-2" /> Nhắn tin Seller
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Escrow Status Detail */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-athletic">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Trạng thái khoản tiền Escrow
                </CardTitle>
                <CardDescription>
                  Tiền của bạn đang được VeloTrust giữ an toàn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded border bg-background p-4">
                    <p className="text-xs text-muted-foreground mb-1">Đã khóa an toàn</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatVND(listing.price * 0.12)}
                    </p>
                    <p className="text-xs text-success mt-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Soft Reserve + Cọc kiểm định
                    </p>
                  </div>
                  <div className="rounded border bg-background p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cần thanh toán thêm (sau báo cáo)</p>
                      <p className="text-2xl font-bold text-muted-foreground">
                        {formatVND(listing.price * 0.88)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Listing Summary Aside */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                    <Image 
                      src={listing.images[0]} 
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listing/${listing.id}`} className="font-medium text-foreground text-sm line-clamp-2 hover:text-primary transition-colors">
                      {listing.title}
                    </Link>
                    <p className="text-lg font-bold text-primary mt-1">{formatVND(listing.price)}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Người bán</span>
                    <span className="font-medium">{listing.seller.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thành phố</span>
                    <span className="font-medium">
                      {listing.city === 'hanoi' ? 'Hà Nội' : listing.city === 'hcm' ? 'TP.HCM' : 'Đà Nẵng'}
                    </span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/listing/${listing.id}`}>
                    Xem lại chi tiết tin đăng
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Need Help? */}
            <Card className="bg-secondary/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-medium text-sm">Cần hỗ trợ?</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nếu bạn có thắc mắc hoặc gặp vấn đề, đội ngũ VeloTrust luôn sẵn sàng 24/7.
                </p>
                <Button size="sm" variant="secondary" className="w-full mt-2">
                  Liên hệ CSKH
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

