'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  FileText,
  User,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/language-context'
import { inspectorApi } from '@/lib/api/inspector-api'
import { cn } from '@/lib/utils'

export default function HistoryDetailPage() {
  const { language } = useLanguage()
  const params = useParams()
  const inspectionId = params.id as string

  const historyQuery = useQuery({
    queryKey: ['inspector-history-detail', inspectionId],
    queryFn: () => inspectorApi.getHistoryById(inspectionId),
  })

  const history = historyQuery.data

  if (historyQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (historyQuery.error || !history) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">
          {language === 'vi' ? 'Không tìm thấy lịch sử kiểm định' : 'Inspection history not found'}
        </p>
        <Button asChild variant="outline">
          <Link href="/inspector/assigned">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Quay lại' : 'Go back'}
          </Link>
        </Button>
      </div>
    )
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { color: 'bg-green-100 text-green-700 border-green-200', label: language === 'vi' ? 'Đạt tốt' : 'Good' }
    if (score >= 50) return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: language === 'vi' ? 'Trung bình' : 'Average' }
    return { color: 'bg-red-100 text-red-700 border-red-200', label: language === 'vi' ? 'Yếu' : 'Poor' }
  }

  const scoreBadge = getScoreBadge(history.score)

  const checklistItems = [
    { key: 'frame', label: language === 'vi' ? 'Khung xe' : 'Frame', value: history.frame },
    { key: 'paintCondition', label: language === 'vi' ? 'Tình trạng sơn' : 'Paint Condition', value: history.paintCondition },
    { key: 'drivetrain', label: language === 'vi' ? 'Hệ truyền động' : 'Drivetrain', value: history.drivetrain },
    { key: 'brakes', label: language === 'vi' ? 'Hệ thống phanh' : 'Brakes', value: history.brakes },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/inspector/assigned">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
              {language === 'vi' ? 'Chi tiết kiểm định' : 'Inspection Details'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'vi' ? 'Mã kiểm định' : 'Inspection ID'}: {history.id.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{history.score}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'vi' ? 'Điểm kiểm định' : 'Inspection Score'}
                </p>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn('text-sm', scoreBadge.color)}
                  >
                    {scoreBadge.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    / 100 {language === 'vi' ? 'điểm' : 'points'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === 'vi' ? 'Danh sách kiểm tra' : 'Checklist'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {checklistItems.map((item) => (
                <div 
                  key={item.key}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border',
                    item.value ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.value ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comment */}
      {history.comment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                {language === 'vi' ? 'Nhận xét' : 'Comment'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{history.comment}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {language === 'vi' ? 'Thông tin thêm' : 'Additional Info'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {language === 'vi' ? 'Ngày kiểm định' : 'Inspection Date'}
              </span>
              <span>{new Date(history.inspectionDate).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {language === 'vi' ? 'Người kiểm định ID' : 'Inspector ID'}
              </span>
              <span className="font-mono">{history.userId.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span>{language === 'vi' ? 'Mã kiểm định' : 'Inspection ID'}</span>
              <span className="font-mono">{history.id}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
