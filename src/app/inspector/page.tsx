'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Star,
  FileWarning,
  ChevronRight,
  Clock,
  ArrowUpRight,
  Loader2,
  Calendar,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { inspectorApi } from '@/lib/api/inspector-api'
import { cn } from '@/lib/utils'

export default function InspectorDashboardPage() {
  const { user } = useAuth()
  const { language } = useLanguage()

  const pendingListingsQuery = useQuery({
    queryKey: ['inspector-listings', 'pending'],
    queryFn: inspectorApi.getPendingListings,
    refetchInterval: 15000,
  })

  const allQuery = useQuery({
    queryKey: ['inspector-all', 1, 10],
    queryFn: () => inspectorApi.getAll(1, 10),
    refetchInterval: 30000,
  })

  const reportsQuery = useQuery({
    queryKey: ['inspector-reports', 1, 50],
    queryFn: () => inspectorApi.getReportsPaged(1, 50),
    refetchInterval: 30000,
  })

  const historyQuery = useQuery({
    queryKey: ['inspector-history', 1, 5],
    queryFn: () => inspectorApi.getHistory(1, 5),
  })

  const pendingListings = pendingListingsQuery.data ?? []
  const pendingCount = pendingListings.length
  const completedCount = historyQuery.data?.totalItems ?? 0
  const recentHistory = historyQuery.data?.items ?? []
  const allCount = allQuery.data?.totalItems ?? pendingCount + completedCount
  const reportItems = reportsQuery.data?.items ?? []
  const reportTotal = reportsQuery.data?.totalItems ?? reportItems.length

  const stats = [
    {
      label: { vi: 'Chờ Kiểm Định', en: 'Pending' },
      value: pendingCount,
      icon: ClipboardCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200/60',
      href: '/inspector/assigned',
    },
    {
      label: { vi: 'Báo Cáo', en: 'Reports' },
      value: reportTotal,
      icon: FileWarning,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      borderColor: 'border-rose-200/60',
      href: '/inspector/report',
    },
    {
      label: { vi: 'Đã Hoàn Thành', en: 'Completed' },
      value: completedCount,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200/60',
      href: '/inspector/assigned',
    },
    {
      label: { vi: 'Tổng Kiểm Định', en: 'Total' },
      value: allCount,
      icon: Star,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200/60',
      href: '/inspector/assigned',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {language === 'vi' ? 'Xin chào,' : 'Hello,'} {user.name}
        </h1>
        <p className="text-muted-foreground">
          {language === 'vi'
            ? 'Cổng quản lý kiểm định xe đạp'
            : 'Bicycle inspection management portal'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label.en}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
          >
            <Link href={stat.href}>
              <Card className={cn(
                'group relative overflow-hidden border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
                stat.borderColor
              )}>
                <div className={cn('absolute inset-0 opacity-40', stat.bg)} />
                <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label[language]}
                  </CardTitle>
                  <div className={cn('rounded-lg p-2', stat.bg)}>
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {language === 'vi' ? 'Xem chi tiết' : 'View details'}
                    <ArrowUpRight className="h-3 w-3" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Two-column: Action Items + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Needs Action */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    {language === 'vi' ? 'Cần Xử Lý Ngay' : 'Needs Action'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'vi'
                      ? 'Tin đăng đang chờ xử lý'
                      : 'Listings awaiting your action'}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/inspector/assigned">
                    {language === 'vi' ? 'Xem tất cả' : 'View all'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pendingListingsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                </div>
              ) : pendingListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mb-3 text-emerald-400" />
                  <p className="font-medium">{language === 'vi' ? 'Tuyệt vời!' : 'All clear!'}</p>
                  <p className="text-sm">{language === 'vi' ? 'Không có mục nào cần xử lý' : 'No pending items'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingListings.slice(0, 3).map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/inspector/assigned/${listing.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-muted/50 transition-all group"
                    >
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/40">
                        <ClipboardCheck className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{listing.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {listing.brand || '-'} • {listing.city || (language === 'vi' ? 'Chưa cập nhật' : 'N/A')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                        {language === 'vi' ? 'Tin đăng' : 'Listing'}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  ))}

                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Recent Activity */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {language === 'vi' ? 'Kiểm Định Gần Đây' : 'Recent Inspections'}
              </CardTitle>
              <CardDescription>
                {language === 'vi' ? 'Lịch sử kiểm định gần nhất' : 'Latest inspection history'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyQuery.isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                </div>
              ) : recentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Clock className="h-10 w-10 mb-3 text-muted-foreground/40" />
                  <p className="text-sm">{language === 'vi' ? 'Chưa có hoạt động nào' : 'No activity yet'}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentHistory.map((item, index) => {
                    const scoreColor = item.score >= 80 ? 'text-emerald-600' : item.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                    const scoreBg = item.score >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/40' : item.score >= 50 ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-rose-50 dark:bg-rose-950/40'

                    return (
                      <div key={item.id} className="flex items-start gap-3 py-2.5">
                        <div className="relative flex flex-col items-center">
                          <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold', scoreBg, scoreColor)}>
                            {item.score}
                          </div>
                          {index < recentHistory.length - 1 && (
                            <div className="w-px h-full bg-border/60 absolute top-9" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
                          <p className="text-sm font-medium">
                            {language === 'vi' ? 'Kiểm định' : 'Inspection'} #{item.id.slice(0, 8)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={cn('flex items-center gap-1 text-xs', item.frame ? 'text-emerald-600' : 'text-rose-500')}>
                              {item.frame ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {language === 'vi' ? 'Khung xe' : 'Frame'}
                            </span>
                            <span className={cn('flex items-center gap-1 text-xs', item.paintCondition ? 'text-emerald-600' : 'text-rose-500')}>
                              {item.paintCondition ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {language === 'vi' ? 'Nước sơn' : 'Paint'}
                            </span>
                            <span className={cn('flex items-center gap-1 text-xs', item.drivetrain ? 'text-emerald-600' : 'text-rose-500')}>
                              {item.drivetrain ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {language === 'vi' ? 'Bộ truyền động' : 'Drivetrain'}
                            </span>
                            <span className={cn('flex items-center gap-1 text-xs', item.brakes ? 'text-emerald-600' : 'text-rose-500')}>
                              {item.brakes ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {language === 'vi' ? 'Hệ thống phanh' : 'Brakes'}
                            </span>
                          </div>
                          {item.inspectionDate && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.inspectionDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">
                {language === 'vi' ? 'Lưu Ý Kiểm Định' : 'Inspection Tips'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Luôn chụp ảnh số serial và so sánh với thông tin đăng ký'
                    : 'Always photograph serial number and compare with registration'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Kiểm tra kỹ khung xe xem có vết nứt hay biến dạng không'
                    : 'Carefully inspect frame for cracks or deformation'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Test phanh và hệ thống chuyển số trước khi đánh giá'
                    : 'Test brakes and shifting before evaluation'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Ghi chú chi tiết mọi vấn đề phát hiện được'
                    : 'Document all issues found in detail'}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
