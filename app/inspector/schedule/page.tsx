'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CalendarClock,
  Clock,
  MapPin,
  Phone,
  User,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { MOCK_INSPECTOR_ASSIGNMENTS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type AssignmentStatus = 'assigned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

const statusColors: Record<AssignmentStatus, string> = {
  assigned: 'bg-muted text-muted-foreground border-border',
  scheduled: 'bg-primary/15 text-primary border-primary/30',
  in_progress: 'bg-[#407F3E]/15 text-[#407F3E] border-[#407F3E]/30',
  completed: 'bg-[#407F3E]/15 text-[#407F3E] border-[#407F3E]/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
}

const statusLabels: Record<AssignmentStatus, { vi: string; en: string }> = {
  assigned: { vi: 'Mới giao', en: 'Assigned' },
  scheduled: { vi: 'Đã hẹn lịch', en: 'Scheduled' },
  in_progress: { vi: 'Đang kiểm định', en: 'In Progress' },
  completed: { vi: 'Hoàn thành', en: 'Completed' },
  cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
}

function getDateLabel(rawDate: string, language: 'vi' | 'en') {
  const date = new Date(`${rawDate}T00:00:00`)
  return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function InspectorSchedulePage() {
  const { language } = useLanguage()

  const scheduleGroups = useMemo(() => {
    const activeAssignments = MOCK_INSPECTOR_ASSIGNMENTS.filter(
      (item) => item.status !== 'completed' && item.status !== 'cancelled'
    )

    const grouped = activeAssignments.reduce<Record<string, typeof activeAssignments>>((acc, item) => {
      if (!acc[item.scheduledDate]) {
        acc[item.scheduledDate] = []
      }
      acc[item.scheduledDate].push(item)
      return acc
    }, {})

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)),
      }))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
          {language === 'vi' ? 'Lịch Kiểm Định' : 'Inspection Schedule'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {language === 'vi'
            ? 'Xem lịch hẹn theo ngày để chủ động sắp xếp di chuyển'
            : 'View your appointments by date to plan travel effectively'}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>{language === 'vi' ? 'Tổng quan tuần này' : 'This week overview'}</CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'Lịch được nhóm theo ngày, sắp xếp theo giờ tăng dần'
                : 'Appointments are grouped by date and sorted by time'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit">
            <CalendarClock className="h-3.5 w-3.5 mr-1" />
            {scheduleGroups.reduce((sum, g) => sum + g.items.length, 0)}{' '}
            {language === 'vi' ? 'lịch hẹn' : 'appointments'}
          </Badge>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {scheduleGroups.length > 0 ? (
          scheduleGroups.map((group, groupIndex) => (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.06 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg capitalize">
                      {getDateLabel(group.date, language)}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {group.items.length} {language === 'vi' ? 'cuộc hẹn' : 'slots'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.items.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-lg border border-border/70 p-3 sm:p-4 bg-card hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium truncate">{assignment.listing.title}</p>
                            <Badge variant="outline" className={cn('text-xs', statusColors[assignment.status])}>
                              {statusLabels[assignment.status][language]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {assignment.listing.brand} {assignment.listing.model}
                          </p>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {assignment.scheduledTime}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {assignment.seller.name}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              {assignment.seller.phone}
                            </span>
                            <span className="sm:col-span-2 flex items-start gap-1.5">
                              <MapPin className="h-3.5 w-3.5 mt-0.5" />
                              {assignment.seller.address}
                            </span>
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-2">
                          <Button asChild className="flex-1">
                            <Link href={`/inspector/inspect/${assignment.id}`}>
                              {assignment.status === 'in_progress'
                                ? language === 'vi'
                                  ? 'Tiếp tục'
                                  : 'Continue'
                                : language === 'vi'
                                  ? 'Bắt đầu'
                                  : 'Start'}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {language === 'vi'
                ? 'Chưa có lịch kiểm định nào được sắp xếp.'
                : 'No inspection appointments have been scheduled yet.'}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
