'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  AlertOctagon,
  FileSearch,
  MessageCircle,
  Gavel,
  ShieldCheck,
  Scale,
  UploadCloud,
  CheckCircle2,
  Lock
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DetailPageLoading } from '@/components/detail-page-loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { DISPUTE_TYPE_LABELS, type Listing } from '@/lib/mock-data'
import { getListingDetail } from '@/lib/services/listing-detail-source'
import { cn } from '@/lib/utils'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

type DisputeStep = 'form' | 'submitted'

export default function DisputeCenterPage({ params }: PageProps) {
  const { id } = use(params)
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoadingListing, setIsLoadingListing] = useState(true)
  const [isListingMissing, setIsListingMissing] = useState(false)
  
  // Fake state
  const [step, setStep] = useState<DisputeStep>('form')
  const [disputeType, setDisputeType] = useState<keyof typeof DISPUTE_TYPE_LABELS | ''>('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    return (
      <DetailPageLoading
        primaryColumnClassName="lg:col-span-2 h-96 animate-pulse rounded-2xl bg-muted"
        secondaryColumnClassName="h-96 animate-pulse rounded-2xl bg-muted"
      />
    )
  }

  if (isListingMissing || !listing) notFound()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!disputeType || !description) return
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(res => setTimeout(res, 1500))
    setIsSubmitting(false)
    setStep('submitted')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 lg:px-8">
        <nav className="mb-6">
          <Link 
            href={`/transaction/${listing.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại giao dịch
          </Link>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3" style={{ fontFamily: 'var(--font-archivo)' }}>
              Trung tâm Khiếu nại & Tranh chấp
            </h1>
            <p className="text-muted-foreground mt-2">
              Chúng tôi sẽ đóng băng giao dịch và làm việc với cả hai bên để đảm bảo tính công bằng.
            </p>
          </div>
          <Badge variant="outline" className="text-base py-1 px-3 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 gap-1.5 rounded-full">
            <Lock className="h-4 w-4 shrink-0" />
            Escrow đang khóa tiền
          </Badge>
        </div>


        <section className="mb-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="premium-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="eyebrow-chip">Protected resolution flow</div>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-foreground">
                  Disputes now feel like part of the platform, not an afterthought
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Escrow lock, evidence submission, platform review, and the expected timeline are framed as one
                  serious operational experience.
                </p>
              </div>
              <Badge className="rounded-full bg-destructive px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                Escrow frozen
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: Lock,
                label: 'Fund status',
                value: 'Money is held safely',
                sub: 'Signals control before either side can force an outcome.',
              },
              {
                icon: UploadCloud,
                label: 'Evidence quality',
                value: 'Photos and notes expected',
                sub: 'Encourages a more believable case-building workflow.',
              },
              {
                icon: Scale,
                label: 'Platform role',
                value: 'VeloTrust reviews both sides',
                sub: 'Makes the dispute center feel operational, not decorative.',
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
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            
            <AnimatePresence mode="wait">
              {step === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="border-destructive/20 shadow-sm overflow-hidden">
                    <div className="bg-destructive/5 px-6 py-4 border-b border-destructive/10 flex items-start gap-4">
                      <div className="bg-background rounded-full p-2 border border-destructive/20 shrink-0">
                        <AlertOctagon className="h-6 w-6 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Bạn đang gặp vấn đề gì với đơn hàng này?</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Vui lòng cung cấp chi tiết trung thực. Quyết định của VeloTrust sẽ dựa trên báo cáo kiểm định và bằng chứng hình ảnh.
                        </p>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type Selection */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-foreground">Loại khiếu nại <span className="text-destructive">*</span></label>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {Object.entries(DISPUTE_TYPE_LABELS).map(([key, item]) => (
                              <label
                                key={key}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                  disputeType === key 
                                    ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                    : "border-border hover:border-muted-foreground bg-background"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="disputeType"
                                  value={key}
                                  checked={disputeType === key}
                                  onChange={(e) => setDisputeType(e.target.value as any)}
                                  className="accent-primary"
                                  required
                                />
                                <span className="text-sm font-medium text-foreground">{item.vi}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-foreground flex justify-between">
                            <span>Mô tả chi tiết vấn đề <span className="text-destructive">*</span></span>
                            <span className="text-xs text-muted-foreground font-normal">Tối thiểu 50 ký tự</span>
                          </label>
                          <Textarea 
                            placeholder="Ví dụ: Xe bị móp khung ở vị trí sườn dưới khác với trên báo cáo kiểm định. Lỗi phanh trước không ăn..."
                            className="min-h-[120px] resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            minLength={50}
                          />
                        </div>

                        {/* Evidence Upload */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-foreground text-foreground">
                            Bằng chứng hình ảnh/video <span className="text-muted-foreground font-normal">(Tuỳ chọn nhưng rất khuyến khích)</span>
                          </label>
                          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer flex flex-col items-center justify-center">
                            <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium text-foreground">Nhấn để tải lên hoặc kéo thả file vào đây</p>
                            <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG, MP4 (Tối đa 5 file, 20MB/file)</p>
                            <Button variant="secondary" size="sm" type="button" className="mt-4 pointer-events-none">
                              Chọn File
                            </Button>
                          </div>
                        </div>

                        <Separator />
                        
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" type="button" asChild>
                            <Link href={`/transaction/${listing.id}`}>Hủy bỏ</Link>
                          </Button>
                          <Button type="submit" disabled={isSubmitting || !disputeType || description.length < 50}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi khiếu nại cho VeloTrust'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 'submitted' && (
                <motion.div
                  key="submitted"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-border rounded-xl p-8 text-center shadow-sm"
                >
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 mb-6">
                    <Scale className="h-10 w-10 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Đã mở tranh chấp thành công</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Giao dịch của bạn đã bị tạm thời <strong>đóng băng</strong>. Đội ngũ chuyên gia xử lý tranh chấp của VeloTrust sẽ tiếp nhận và phản hồi trong 24 giờ tới.
                  </p>
                  
                  <div className="bg-secondary/50 rounded-lg p-4 max-w-sm mx-auto text-left mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mã tranh chấp:</span>
                      <span className="font-mono text-foreground font-medium">DISP-{Date.now().toString(36).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="text-foreground">{new Date().toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Khoản Escrow bị khóa:</span>
                      <span className="text-primary font-bold">{listing.price.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" asChild>
                      <Link href={`/transaction/${listing.id}`}>Quay lại giao dịch</Link>
                    </Button>
                    <Button>
                      <MessageCircle className="mr-2 h-4 w-4" /> Go to Dispute Chat
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Sidebar / Info Area */}
          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-primary" />
                  Quy trình giải quyết
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="flex bg-primary text-primary-foreground rounded-full w-5 h-5 items-center justify-center shrink-0 font-bold text-xs mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-foreground">Bạn gửi khiếu nại</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Giao dịch bị đóng băng ngay lập tức. Tiền được giữ lại an toàn.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex bg-muted text-muted-foreground rounded-full w-5 h-5 items-center justify-center shrink-0 font-bold text-xs mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-foreground">Phản hồi từ Seller</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Seller có 48h để đưa ra ý kiến phản hồi về khiếu nại.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex bg-muted text-muted-foreground rounded-full w-5 h-5 items-center justify-center shrink-0 font-bold text-xs mt-0.5">3</div>
                    <div>
                      <p className="font-medium text-foreground border-b-2 border-primary/30 inline-block">VeloTrust vào cuộc phân xử</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Dựa trên ảnh báo cáo kiểm định và bằng chứng hai bên cung cấp.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex bg-muted text-muted-foreground rounded-full w-5 h-5 items-center justify-center shrink-0 font-bold text-xs mt-0.5">4</div>
                    <div>
                      <p className="font-medium text-foreground">Phán quyết & Hoàn tiền</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Dựa trên ai đúng/sai, hệ thống hoàn trả xe hoặc hoàn cả tiền cho bạn.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reference info */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm text-muted-foreground">Tham chiếu cho tranh chấp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full justify-start" asChild>
                  <Link href={`/inspection/${listing.id}`}>
                    <FileSearch className="mr-2 h-4 w-4" /> Xem lại Báo cáo Kiểm định
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full justify-start" asChild>
                  <Link href={`/listing/${listing.id}`}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Xem lại Tin đăng ban đầu
                  </Link>
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

