'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ClipboardCheck, 
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ArrowUpRight,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { 
  MOCK_INSPECTOR_ASSIGNMENTS, 
  formatVND,
  CITIES 
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  assigned: 'bg-muted text-muted-foreground',
  scheduled: 'bg-primary/20 text-primary',
  in_progress: 'bg-accent/20 text-accent-foreground',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
}

const statusLabels: Record<string, { vi: string; en: string }> = {
  assigned: { vi: 'Đã giao', en: 'Assigned' },
  scheduled: { vi: 'Đã lên lịch', en: 'Scheduled' },
  in_progress: { vi: 'Đang kiểm', en: 'In Progress' },
  completed: { vi: 'Hoàn thành', en: 'Completed' },
  cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
}

export default function InspectorDashboardPage() {
  const { user } = useAuth()
  const { language } = useLanguage()

  const assignments = MOCK_INSPECTOR_ASSIGNMENTS
  const todayAssignments = assignments.filter(a => a.scheduledDate === '2024-01-14' || a.scheduledDate === '2024-01-15')
  const pendingCount = assignments.filter(a => ['assigned', 'scheduled', 'in_progress'].includes(a.status)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      </div>

      <section className="premium-panel grid gap-4 border border-[#407F3E]/15 bg-gradient-to-br from-white via-[#f5fbf4] to-[#edf7eb] p-5 lg:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
        <div className="space-y-3">
          <span className="eyebrow-chip">{language === 'vi' ? 'Field operations' : 'Field operations'}</span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
              {language === 'vi' ? 'Dieu phoi lich, bang chung va report quality trong mot cockpit inspector.' : 'Coordinate schedule, evidence, and report quality from one inspector cockpit.'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {language === 'vi'
                ? 'Dashboard nay can tao cam giac chuyen nghiep nhu mot field team dang van hanh that ngoai hien truong.'
                : 'This dashboard should feel like a real field team operating in the market, not a lightweight checklist app.'}
            </p>
          </div>
        </div>
        <div className="premium-subpanel space-y-1">
          <p className="metric-label">{language === 'vi' ? 'Open workload' : 'Open workload'}</p>
          <p className="metric-value">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">{language === 'vi' ? 'assignment dang cho xu ly hoac cho bao cao' : 'assignments awaiting inspection or reporting'}</p>
        </div>
        <div className="premium-subpanel space-y-1">
          <p className="metric-label">{language === 'vi' ? 'Today route' : 'Today route'}</p>
          <p className="metric-value">{todayAssignments.length}</p>
          <p className="text-xs text-muted-foreground">{language === 'vi' ? 'diem hen can chot trong ngay' : 'appointments that define today�s field route'}</p>
        </div>
        <div className="premium-subpanel space-y-1">
          <p className="metric-label">{language === 'vi' ? 'Proof quality' : 'Proof quality'}</p>
          <p className="metric-value">4.9</p>
          <p className="text-xs text-muted-foreground">{language === 'vi' ? 'muc danh gia giup vai tro inspector nhin dang tin hon' : 'a quality signal that strengthens inspector credibility in the demo'}</p>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'vi' ? 'Đang Chờ' : 'Pending'}
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'vi' ? 'xe cần kiểm định' : 'bikes to inspect'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'vi' ? 'Hôm Nay' : 'Today'}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'vi' ? 'lịch hẹn' : 'appointments'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'vi' ? 'Đã Hoàn Thành' : 'Completed'}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.completedInspections || 47}</div>
              <p className="text-xs text-success flex items-center gap-1">
                +8 {language === 'vi' ? 'tháng này' : 'this month'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'vi' ? 'Đánh Giá' : 'Rating'}
              </CardTitle>
              <svg className="h-4 w-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.9</div>
              <p className="text-xs text-muted-foreground">
                {language === 'vi' ? 'từ 47 đánh giá' : 'from 47 reviews'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Inspections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{language === 'vi' ? 'Lịch Kiểm Định Sắp Tới' : 'Upcoming Inspections'}</CardTitle>
              <CardDescription>
                {language === 'vi' ? 'Các xe được giao để kiểm định' : 'Bikes assigned for inspection'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/inspector/assigned" className="gap-1">
                {language === 'vi' ? 'Xem tất cả' : 'View all'}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div 
                  key={assignment.id} 
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  {/* Bike Image & Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={assignment.listing.images[0]} 
                        alt={assignment.listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{assignment.listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.listing.brand} {assignment.listing.model}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn('text-xs', statusColors[assignment.status])}>
                          {statusLabels[assignment.status][language]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatVND(assignment.listing.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule & Location */}
                  <div className="flex flex-col sm:items-end gap-1 sm:text-right">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{assignment.scheduledDate} - {assignment.scheduledTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[200px]">{assignment.seller.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{assignment.seller.phone}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex sm:flex-col gap-2">
                    <Button size="sm" className="flex-1 sm:flex-none" asChild>
                      <Link href={`/inspector/inspect/${assignment.id}`}>
                        {assignment.status === 'in_progress' 
                          ? (language === 'vi' ? 'Tiếp tục' : 'Continue')
                          : (language === 'vi' ? 'Bắt đầu' : 'Start')
                        }
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
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
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>
                  {language === 'vi' 
                    ? 'Luôn chụp ảnh số serial và so sánh với thông tin đăng ký'
                    : 'Always photograph serial number and compare with registration'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>
                  {language === 'vi' 
                    ? 'Kiểm tra kỹ khung xe xem có vết nứt hay biến dạng không'
                    : 'Carefully inspect frame for cracks or deformation'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>
                  {language === 'vi' 
                    ? 'Test phanh và hệ thống chuyển số trước khi đánh giá'
                    : 'Test brakes and shifting before evaluation'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
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


