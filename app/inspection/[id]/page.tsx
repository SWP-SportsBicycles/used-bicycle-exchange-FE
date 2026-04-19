'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  FileText,
  Star,
  Download,
  AlertCircle
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DetailPageLoading } from '@/components/detail-page-loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { type Listing, type ChecklistItem } from '@/lib/mock-data'
import { getListingDetail } from '@/lib/services/listing-detail-source'
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

export default function InspectionReportPage({ params }: PageProps) {
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
    return (
      <DetailPageLoading
        maxWidthClassName="max-w-4xl"
        gridClassName="grid gap-8 md:grid-cols-3"
        primaryColumnClassName="md:col-span-2 h-96 animate-pulse rounded-2xl bg-muted"
        secondaryColumnClassName="h-96 animate-pulse rounded-2xl bg-muted"
      />
    )
  }

  if (isListingMissing || !listing || !listing.inspection) notFound()

  const { inspection } = listing
  const { report } = inspection

  // Helper arrays to map through checklist
  const checkItems: Array<{ label: string; key: string; value: ChecklistItem }> = [
    { label: 'Tình trạng khung xe', key: 'frameCondition', value: report.frameCondition },
    { label: 'Hệ thống phanh', key: 'brakeSystem', value: report.brakeSystem },
    { label: 'Hệ thống truyền động', key: 'drivetrain', value: report.drivetrain },
    { label: 'Bánh xe và lốp', key: 'wheels', value: report.wheels },
  ]
  if (report.suspension) {
    checkItems.push({ label: 'Hệ thống phuộc', key: 'suspension', value: report.suspension })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 lg:px-8">
        <nav className="mb-6 flex justify-between items-center">
          <Link 
            href={`/transaction/${listing.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to transaction
          </Link>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3" style={{ fontFamily: 'var(--font-archivo)' }}>
              Inspection Report
              <ShieldCheck className="h-8 w-8 text-success" />
            </h1>
            <p className="text-muted-foreground mt-2">
              Chứng nhận VeloSafe cho sản phẩm: <strong className="text-foreground">{listing.title}</strong>
            </p>
          </div>
        </div>


        <section className="mb-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="premium-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="eyebrow-chip">Inspection proof layer</div>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-foreground">
                  Evidence before money moves further
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  The report now reads more like a trust artifact in the buyer journey: grade, checklist,
                  proof, and commercial consequence are visually tied together.
                </p>
              </div>
              <Badge className="rounded-full bg-success px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-success-foreground">
                Grade {report.overallGrade}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: ShieldCheck,
                label: 'Trust outcome',
                value: report.overallGrade === 'A' ? 'Strong pass signal' : 'Review with caution',
                sub: 'Supports buyer confidence before the escrow balance is released.',
              },
              {
                icon: FileText,
                label: 'Report scope',
                value: '50+ point inspection',
                sub: 'Checklist language is framed as a buyer decision input.',
              },
              {
                icon: AlertCircle,
                label: 'Commercial effect',
                value: 'Accept or dispute next',
                sub: 'Makes the report feel connected to the payment path, not isolated.',
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
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Report Column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Overall Grade Card */}
            <Card className="border-success/20 overflow-hidden shadow-sm">
              <div className="bg-success/5 p-6 flex items-center gap-6">
                <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-4 border-success bg-background shadow-inner">
                  <span className="text-4xl font-black text-success leading-none" style={{ fontFamily: 'var(--font-archivo)' }}>
                    {report.overallGrade}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground tracking-widest mt-1">HẠNG</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Kết quả đánh giá tổng quan</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Xe đạt tiêu chuẩn VeloSafe. Có một số vết xước nhỏ ở khung nhưng toàn bộ hệ thống cơ khí và truyền động hoạt động hoàn hảo.
                  </p>
                </div>
              </div>
            </Card>

            {/* Checklist Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chi tiết 50+ điểm kiểm tra
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {checkItems.map((item, index) => (
                    <motion.div 
                      key={item.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 flex gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="mt-0.5">
                        <StatusIcon status={item.value.status} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{item.label}</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {item.value.notes}
                        </p>
                      </div>
                      <div>
                        {item.value.status === 'pass' && <Badge variant="outline" className="bg-success/10 text-success border-success/30">Đạt</Badge>}
                        {item.value.status === 'warning' && <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Cần lưu ý</Badge>}
                        {item.value.status === 'fail' && <Badge variant="destructive">Lỗi</Badge>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            {report.photos && report.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hình ảnh thực tế từ Inspector</CardTitle>
                  <CardDescription>Các khu vực có vết xước hoặc hao mòn đã được ghi nhận</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {report.photos.map((photo, i) => (
                      <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-muted group cursor-zoom-in">
                        <Image src={photo} alt={`Inspection proof ${i+1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inspector Notes */}
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-lg">Ghi chú thêm từ chuyên gia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  "{report.notes}"
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin chứng nhận</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Mã báo cáo</span>
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground text-xs">VSR-{listing.id.substring(0,6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ngày kiểm định</span>
                  <span className="font-medium text-foreground">{new Date(inspection.inspectedAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Chuyên gia</span>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                      {inspection.inspectorName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground">{inspection.inspectorName}</span>
                  </div>
                </div>
                <Separator />
                <Button className="w-full" asChild>
                  <Link href={`/transaction/${listing.id}`}>
                    Continue transaction
                  </Link>
                </Button>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Reject bike & refund deposit
                </Button>
                <p className="text-[10px] text-muted-foreground text-center leading-tight">
                  Theo chính sách Escrow, bạn có quyền từ chối nhận xe nếu thực tế khác với báo cáo hoặc phát sinh lỗi nghiêm trọng.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}




