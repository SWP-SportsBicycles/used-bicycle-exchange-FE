'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Bike,
  Calendar,
  Clock,
  Filter,
  MapPin,
  Phone,
  Search,
  User,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/lib/language-context'
import { MOCK_INSPECTOR_ASSIGNMENTS, formatVND } from '@/lib/mock-data'
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

export default function InspectorAssignedPage() {
  const { language } = useLanguage()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AssignmentStatus>('all')

  const activeAssignments = useMemo(
    () => MOCK_INSPECTOR_ASSIGNMENTS.filter((item) => item.status !== 'completed' && item.status !== 'cancelled'),
    []
  )

  const filteredAssignments = useMemo(() => {
    return activeAssignments.filter((item) => {
      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      const q = query.trim().toLowerCase()

      if (!q) return matchStatus

      const cityLabel = item.listing.city.toLowerCase()
      const fields = [
        item.listing.title,
        item.listing.brand,
        item.listing.model,
        item.seller.name,
        item.seller.phone,
        item.seller.address,
        item.buyer.name,
        cityLabel,
      ]

      const matchQuery = fields.some((field) => field.toLowerCase().includes(q))
      return matchStatus && matchQuery
    })
  }, [activeAssignments, query, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            {language === 'vi' ? 'Xe Được Giao' : 'Assigned Bikes'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'vi'
              ? 'Danh sách xe bạn đang phụ trách kiểm định'
              : 'Bikes currently assigned to you for inspection'}
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Bike className="h-3.5 w-3.5 mr-1" />
          {filteredAssignments.length} {language === 'vi' ? 'xe' : 'bikes'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{language === 'vi' ? 'Bộ lọc nhanh' : 'Quick filters'}</CardTitle>
          <CardDescription>
            {language === 'vi'
              ? 'Tìm theo tên xe, người bán, địa chỉ, số điện thoại'
              : 'Search by bike, seller, address, or phone'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              placeholder={
                language === 'vi' ? 'Tìm xe, người bán, địa chỉ...' : 'Search bike, seller, address...'
              }
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'assigned', 'scheduled', 'in_progress'] as const).map((status) => {
              const isActive = statusFilter === status
              const label =
                status === 'all'
                  ? language === 'vi'
                    ? 'Tất cả'
                    : 'All'
                  : statusLabels[status][language]

              return (
                <Button
                  key={status}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={cn(!isActive && 'text-muted-foreground')}
                >
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  {label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-border/70 hover:border-primary/40 transition-colors">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={assignment.listing.images[0]}
                          alt={assignment.listing.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{assignment.listing.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.listing.brand} {assignment.listing.model} • {formatVND(assignment.listing.price)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={cn('text-xs', statusColors[assignment.status])}>
                            {statusLabels[assignment.status][language]}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {assignment.scheduledDate}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {assignment.scheduledTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground lg:min-w-[340px]">
                      <p className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {assignment.seller.name}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {assignment.seller.phone}
                      </p>
                      <p className="sm:col-span-2 flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 mt-0.5" />
                        <span>{assignment.seller.address}</span>
                      </p>
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                      <Button asChild className="flex-1">
                        <Link href={`/inspector/inspect/${assignment.id}`}>
                          {assignment.status === 'in_progress'
                            ? language === 'vi'
                              ? 'Tiếp tục kiểm'
                              : 'Continue'
                            : language === 'vi'
                              ? 'Bắt đầu kiểm'
                              : 'Start'}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card>
            <CardContent className="py-14 text-center">
              <p className="text-sm text-muted-foreground">
                {language === 'vi'
                  ? 'Không có xe phù hợp với bộ lọc hiện tại.'
                  : 'No assignments matched the current filters.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
