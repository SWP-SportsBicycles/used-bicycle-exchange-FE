'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ShieldCheck,
  Star,
  Wrench,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/language-context'
import { MOCK_LISTINGS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const gradeColors: Record<'A' | 'B' | 'C' | 'D' | 'F', string> = {
  A: 'bg-[#407F3E]/15 text-[#407F3E] border-[#407F3E]/30',
  B: 'bg-primary/15 text-primary border-primary/30',
  C: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  D: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  F: 'bg-destructive/15 text-destructive border-destructive/30',
}

const statusLabels = {
  pass: { vi: 'Đạt', en: 'Pass' },
  warning: { vi: 'Cần lưu ý', en: 'Warning' },
  fail: { vi: 'Không đạt', en: 'Fail' },
}

export default function InspectorCompletedPage() {
  const { language } = useLanguage()

  const completedInspections = useMemo(() => {
    return MOCK_LISTINGS.filter((listing) => listing.inspection?.status === 'completed')
      .sort((a, b) => {
        const aDate = a.inspection?.inspectedAt ?? ''
        const bDate = b.inspection?.inspectedAt ?? ''
        return bDate.localeCompare(aDate)
      })
  }, [])

  const stats = useMemo(() => {
    const total = completedInspections.length
    const gradeA = completedInspections.filter((item) => item.inspection?.report.overallGrade === 'A').length
    const withWarning = completedInspections.filter((item) => {
      const report = item.inspection?.report
      if (!report) return false
      const statuses = [
        report.frameCondition.status,
        report.brakeSystem.status,
        report.drivetrain.status,
        report.wheels.status,
        report.suspension?.status,
      ].filter(Boolean)
      return statuses.includes('warning') || statuses.includes('fail')
    }).length

    return { total, gradeA, withWarning }
  }, [completedInspections])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
          {language === 'vi' ? 'Đã Hoàn Thành' : 'Completed Inspections'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {language === 'vi'
            ? 'Lịch sử xe đã kiểm định và kết quả đánh giá tổng hợp'
            : 'History of inspected bikes with summarized outcomes'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'vi' ? 'Tổng báo cáo' : 'Total reports'}</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" />
            {language === 'vi' ? 'đã bàn giao cho hệ thống' : 'submitted to system'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'vi' ? 'Xếp hạng A' : 'Grade A'}</CardDescription>
            <CardTitle className="text-2xl">{stats.gradeA}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" />
            {language === 'vi' ? 'tình trạng xuất sắc' : 'excellent condition'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'vi' ? 'Có cảnh báo' : 'Has warning'}</CardDescription>
            <CardTitle className="text-2xl">{stats.withWarning}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5" />
            {language === 'vi' ? 'cần theo dõi bảo dưỡng' : 'needs maintenance follow-up'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'vi' ? 'Lịch sử kiểm định' : 'Inspection history'}</CardTitle>
          <CardDescription>
            {language === 'vi'
              ? 'Danh sách xe đã kiểm định hoàn tất'
              : 'List of bikes with completed inspection'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {completedInspections.length > 0 ? (
            completedInspections.map((listing, index) => {
              const report = listing.inspection?.report
              const grade = report?.overallGrade ?? 'B'
              const checks = [
                report?.frameCondition,
                report?.brakeSystem,
                report?.drivetrain,
                report?.wheels,
                report?.suspension,
              ].filter(Boolean)

              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-border/70 p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image src={listing.images[0]} alt={listing.title} width={56} height={56} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {listing.brand} {listing.model} • {listing.inspection?.inspectorName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {listing.inspection?.inspectedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <Badge variant="outline" className={cn('text-xs', gradeColors[grade])}>
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                        {language === 'vi' ? 'Xếp hạng' : 'Grade'} {grade}
                      </Badge>

                      {checks.slice(0, 3).map((check, idx) =>
                        check ? (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {statusLabels[check.status][language]}
                          </Badge>
                        ) : null,
                      )}

                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        {language === 'vi' ? 'Hoàn tất' : 'Done'}
                      </Badge>
                    </div>
                  </div>

                  {report?.notes && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{report.notes}</p>
                  )}
                </motion.div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {language === 'vi'
                ? 'Chưa có báo cáo hoàn tất nào.'
                : 'No completed inspection report yet.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
