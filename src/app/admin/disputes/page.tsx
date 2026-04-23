'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertOctagon,
  User,
  MessageSquare,
  ChevronRight,
  Scale,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useLanguage } from '@/lib/language-context'
import { MOCK_DISPUTES, formatVND, DISPUTE_TYPE_LABELS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  open: 'bg-destructive/20 text-destructive border-destructive/30',
  investigating: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  resolved_buyer_favor: 'bg-success/20 text-success border-success/30',
  resolved_seller_favor: 'bg-success/20 text-success border-success/30',
  closed: 'bg-muted text-muted-foreground border-border',
}

const statusLabels: Record<string, { vi: string; en: string }> = {
  open: { vi: 'Mở', en: 'Open' },
  investigating: { vi: 'Đang xử lý', en: 'Investigating' },
  resolved_buyer_favor: { vi: 'Giải quyết (Người mua)', en: 'Resolved (Buyer)' },
  resolved_seller_favor: { vi: 'Giải quyết (Người bán)', en: 'Resolved (Seller)' },
  closed: { vi: 'Đã đóng', en: 'Closed' },
}

function getSla(createdAt: string) {
  const createdMs = new Date(createdAt).getTime()
  const ackDue = createdMs + 8 * 60 * 60 * 1000
  const resolveDue = createdMs + 48 * 60 * 60 * 1000
  const now = Date.now()
  return {
    ackOverdue: now > ackDue,
    resolveOverdue: now > resolveDue,
    ackDue,
    resolveDue,
  }
}

function getEvidenceScore(description: string) {
  const descScore = Math.min(40, Math.floor(description.trim().length / 4))
  const base = 35
  const randomLikeWeight = 15
  return Math.min(100, base + descScore + randomLikeWeight)
}

export default function DisputesPage() {
  const { language } = useLanguage()
  type LocalDispute = (typeof MOCK_DISPUTES)[number] & {
    resolutionMeta?: {
      resolvedBy: string
      resolvedAt: string
      notes: string
    }
  }
  const [disputes, setDisputes] = useState<LocalDispute[]>(MOCK_DISPUTES)
  const [selectedDispute, setSelectedDispute] = useState<LocalDispute | null>(null)
  const [resolution, setResolution] = useState<'buyer' | 'seller'>('buyer')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'sla_overdue' | 'high_value'>('all')
  const [logSearch, setLogSearch] = useState('')
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'resolved_buyer_favor' | 'resolved_seller_favor' | 'closed'>('all')
  const [logResolverFilter, setLogResolverFilter] = useState<'all' | string>('all')
  const [logFromDate, setLogFromDate] = useState('')
  const [logToDate, setLogToDate] = useState('')
  const [logPage, setLogPage] = useState(1)
  const [logPageSize, setLogPageSize] = useState<5 | 10 | 20>(5)
  const [logSort, setLogSort] = useState<'resolved_at_desc' | 'resolved_at_asc' | 'sla_breach_desc' | 'resolver_asc'>('resolved_at_desc')

  const handleResolve = () => {
    if (selectedDispute) {
      setDisputes(prev => prev.map(d => 
        d.id === selectedDispute.id 
          ? { 
              ...d, 
              status: resolution === 'buyer' ? 'resolved_buyer_favor' : 'resolved_seller_favor',
              resolution: resolutionNotes,
              resolutionMeta: {
                resolvedBy: 'Admin Duty',
                resolvedAt: new Date().toISOString(),
                notes: resolutionNotes,
              },
            } 
          : d
      ))
      setSelectedDispute(null)
      setResolutionNotes('')
    }
  }

  const activeDisputes = disputes
    .filter(d => ['open', 'investigating'].includes(d.status))
    .filter((d) => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'high_value') return d.listing.price >= 30000000
      const sla = getSla(d.createdAt)
      return sla.ackOverdue || sla.resolveOverdue
    })
  const resolvedDisputes = disputes.filter(d => !['open', 'investigating'].includes(d.status))
  const repeatSellerCounts = disputes.reduce<Record<string, number>>((acc, d) => {
    acc[d.seller.id] = (acc[d.seller.id] || 0) + 1
    return acc
  }, {})
  const repeatBuyerCounts = disputes.reduce<Record<string, number>>((acc, d) => {
    acc[d.buyer.id] = (acc[d.buyer.id] || 0) + 1
    return acc
  }, {})
  const decisionLogs = resolvedDisputes
    .filter((d) => d.resolutionMeta)
    .filter((d) => {
      const query = logSearch.trim().toLowerCase()
      if (!query) return true
      return (
        d.listing.title.toLowerCase().includes(query) ||
        d.buyer.name.toLowerCase().includes(query) ||
        d.seller.name.toLowerCase().includes(query) ||
        (d.resolutionMeta?.notes.toLowerCase().includes(query) ?? false)
      )
    })
    .filter((d) => (logStatusFilter === 'all' ? true : d.status === logStatusFilter))
    .filter((d) => (logResolverFilter === 'all' ? true : d.resolutionMeta?.resolvedBy === logResolverFilter))
    .filter((d) => {
      if (!logFromDate && !logToDate) return true
      const resolvedTime = d.resolutionMeta ? new Date(d.resolutionMeta.resolvedAt).getTime() : 0
      if (logFromDate) {
        const from = new Date(`${logFromDate}T00:00:00`).getTime()
        if (resolvedTime < from) return false
      }
      if (logToDate) {
        const to = new Date(`${logToDate}T23:59:59`).getTime()
        if (resolvedTime > to) return false
      }
      return true
    })
    .sort((a, b) => {
      const aTime = a.resolutionMeta ? new Date(a.resolutionMeta.resolvedAt).getTime() : 0
      const bTime = b.resolutionMeta ? new Date(b.resolutionMeta.resolvedAt).getTime() : 0
      if (logSort === 'resolved_at_asc') return aTime - bTime
      if (logSort === 'resolver_asc') {
        const aResolver = a.resolutionMeta?.resolvedBy || ''
        const bResolver = b.resolutionMeta?.resolvedBy || ''
        return aResolver.localeCompare(bResolver)
      }
      if (logSort === 'sla_breach_desc') {
        const weight = (type: string) => {
          if (type === 'ack_8h_and_resolve_48h') return 3
          if (type === 'resolve_48h') return 2
          if (type === 'ack_8h') return 1
          return 0
        }
        return weight(getSlaBreachType(b.createdAt)) - weight(getSlaBreachType(a.createdAt))
      }
      return bTime - aTime
    })

  const totalLogPages = Math.max(1, Math.ceil(decisionLogs.length / logPageSize))
  const paginatedDecisionLogs = decisionLogs.slice((logPage - 1) * logPageSize, logPage * logPageSize)

  const getSlaBreachType = (createdAt: string) => {
    const sla = getSla(createdAt)
    if (sla.ackOverdue && sla.resolveOverdue) return 'ack_8h_and_resolve_48h'
    if (sla.ackOverdue) return 'ack_8h'
    if (sla.resolveOverdue) return 'resolve_48h'
    return 'none'
  }

  const getResolutionLatencyHours = (createdAt: string, resolvedAt?: string) => {
    if (!resolvedAt) return 0
    const created = new Date(createdAt).getTime()
    const resolved = new Date(resolvedAt).getTime()
    return Math.max(0, Math.round(((resolved - created) / (1000 * 60 * 60)) * 10) / 10)
  }

  const resolverOptions = Array.from(
    new Set(resolvedDisputes.map((d) => d.resolutionMeta?.resolvedBy).filter(Boolean))
  ) as string[]

  const exportDecisionLogsCsv = () => {
    if (decisionLogs.length === 0) return
    const headers = ['dispute_id', 'listing_title', 'status', 'buyer', 'seller', 'resolved_by', 'resolved_at', 'sla_breach_type', 'resolution_latency_hours', 'resolution_notes']
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`
    const rows = decisionLogs.map((d) => [
      d.id,
      d.listing.title,
      statusLabels[d.status][language],
      d.buyer.name,
      d.seller.name,
      d.resolutionMeta?.resolvedBy ?? '',
      d.resolutionMeta?.resolvedAt ?? '',
      getSlaBreachType(d.createdAt),
      getResolutionLatencyHours(d.createdAt, d.resolutionMeta?.resolvedAt),
      d.resolutionMeta?.notes ?? '',
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((item) => escapeCsv(String(item))).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `decision-log-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {language === 'vi' ? 'Quản Lý Tranh Chấp' : 'Dispute Management'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'vi' 
            ? 'Xử lý tranh chấp giữa người mua và người bán' 
            : 'Handle disputes between buyers and sellers'}
        </p>
      </div>

      {/* Decision Matrix Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-5 w-5" />
            {language === 'vi' ? 'Ma Trận Quyết Định' : 'Decision Matrix'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-success">
                {language === 'vi' ? 'Ưu tiên Người Mua:' : 'Favor Buyer:'}
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {language === 'vi' ? 'Xe có vấn đề nghiêm trọng không được mô tả' : 'Serious issues not described'}</li>
                <li>• {language === 'vi' ? 'Serial không khớp với đăng ký' : 'Serial does not match registration'}</li>
                <li>• {language === 'vi' ? 'Groupset khác với quảng cáo' : 'Groupset differs from listing'}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-primary">
                {language === 'vi' ? 'Ưu tiên Người Bán:' : 'Favor Seller:'}
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {language === 'vi' ? 'Người mua đổi ý sau kiểm định đạt' : 'Buyer changes mind after passing inspection'}</li>
                <li>• {language === 'vi' ? 'Vấn đề đã được mô tả rõ trong tin đăng' : 'Issues were clearly described in listing'}</li>
                <li>• {language === 'vi' ? 'Không có bằng chứng hỗ trợ khiếu nại' : 'No evidence supporting the claim'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Disputes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-destructive" />
            {language === 'vi' ? 'Tranh Chấp Đang Xử Lý' : 'Active Disputes'}
          </CardTitle>
          <CardDescription>
            {activeDisputes.length} {language === 'vi' ? 'tranh chấp cần giải quyết' : 'disputes need resolution'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant={activeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('all')}>
              {language === 'vi' ? 'Tất cả' : 'All'}
            </Button>
            <Button variant={activeFilter === 'sla_overdue' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('sla_overdue')}>
              {language === 'vi' ? 'SLA quá hạn' : 'SLA overdue'}
            </Button>
            <Button variant={activeFilter === 'high_value' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('high_value')}>
              {language === 'vi' ? 'High value' : 'High value'}
            </Button>
          </div>
          {activeDisputes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
              <p>{language === 'vi' ? 'Không có tranh chấp đang xử lý' : 'No active disputes'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDisputes.map((dispute) => (
                (() => {
                  const sla = getSla(dispute.createdAt)
                  const evidenceScore = getEvidenceScore(dispute.description)
                  const isHighValue = dispute.listing.price >= 30000000
                  const hasRepeatSeller = (repeatSellerCounts[dispute.seller.id] || 0) > 1
                  const hasRepeatBuyer = (repeatBuyerCounts[dispute.buyer.id] || 0) > 1
                  return (
                <motion.div
                  key={dispute.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-destructive/20 bg-destructive/5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Dispute Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{dispute.listing.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatVND(dispute.listing.price)}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn('text-xs', statusColors[dispute.status])}>
                          {statusLabels[dispute.status][language]}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {DISPUTE_TYPE_LABELS[dispute.type][language]}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(dispute.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <Badge variant="outline" className={cn('text-xs', sla.ackOverdue ? 'text-destructive border-destructive/40' : 'text-emerald-600 border-emerald-400/40')}>
                          {sla.ackOverdue
                            ? (language === 'vi' ? 'Quá SLA 8h acknowledge' : '8h acknowledge overdue')
                            : (language === 'vi' ? 'Trong SLA 8h acknowledge' : 'Within 8h acknowledge SLA')}
                        </Badge>
                        <Badge variant="outline" className={cn('text-xs', sla.resolveOverdue ? 'text-destructive border-destructive/40' : 'text-emerald-600 border-emerald-400/40')}>
                          {sla.resolveOverdue
                            ? (language === 'vi' ? 'Quá SLA 48h resolve' : '48h resolution overdue')
                            : (language === 'vi' ? 'Trong SLA 48h resolve' : 'Within 48h resolution SLA')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {language === 'vi' ? 'Ack due:' : 'Ack due:'} {new Date(sla.ackDue).toLocaleString('vi-VN')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {language === 'vi' ? 'Resolve due:' : 'Resolve due:'} {new Date(sla.resolveDue).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {isHighValue && (
                          <Badge variant="outline" className="text-xs border-destructive/40 text-destructive">
                            {language === 'vi' ? 'High value case' : 'High value case'}
                          </Badge>
                        )}
                        {hasRepeatSeller && (
                          <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">
                            {language === 'vi' ? 'Repeat seller dispute' : 'Repeat seller dispute'}
                          </Badge>
                        )}
                        {hasRepeatBuyer && (
                          <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">
                            {language === 'vi' ? 'Repeat buyer dispute' : 'Repeat buyer dispute'}
                          </Badge>
                        )}
                      </div>

                      {/* Parties */}
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Người mua' : 'Buyer'}</p>
                            <p className="font-medium">{dispute.buyer.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Người bán' : 'Seller'}</p>
                            <p className="font-medium">{dispute.seller.name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{dispute.description}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{language === 'vi' ? 'Độ đầy đủ bằng chứng' : 'Evidence completeness'}</span>
                          <span className="font-medium text-foreground">{evidenceScore}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className={cn('h-full rounded-full', evidenceScore >= 70 ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${evidenceScore}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 lg:flex-none"
                        onClick={() => setSelectedDispute(dispute)}
                      >
                        {language === 'vi' ? 'Giải quyết' : 'Resolve'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 lg:flex-none"
                        onClick={() => {
                          setDisputes(prev => prev.map(d => 
                            d.id === dispute.id 
                              ? { ...d, status: 'investigating' as const } 
                              : d
                          ))
                        }}
                      >
                        {language === 'vi' ? 'Đang xử lý' : 'Investigating'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
                  )
                })()
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved Disputes */}
      {resolvedDisputes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Tranh Chấp Đã Giải Quyết' : 'Resolved Disputes'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedDisputes.map((dispute) => (
                <div 
                  key={dispute.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {dispute.status === 'resolved_buyer_favor' ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{dispute.listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {dispute.buyer.name} vs {dispute.seller.name}
                      </p>
                      {dispute.resolutionMeta && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {language === 'vi' ? 'Resolved bởi' : 'Resolved by'} {dispute.resolutionMeta.resolvedBy} - {new Date(dispute.resolutionMeta.resolvedAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={cn('text-xs', statusColors[dispute.status])}>
                    {statusLabels[dispute.status][language]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {resolvedDisputes.some((d) => d.resolutionMeta) && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Decision Log' : 'Decision Log'}</CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'Lịch sử quyết định để phục vụ audit và đối soát'
                : 'Resolution history for audit and reconciliation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              <input
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value)
                  setLogPage(1)
                }}
                placeholder={language === 'vi' ? 'Tìm theo tên xe/người...' : 'Search listing/user...'}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              />
              <select
                value={logStatusFilter}
                onChange={(e) => {
                  setLogStatusFilter(e.target.value as typeof logStatusFilter)
                  setLogPage(1)
                }}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="all">{language === 'vi' ? 'Tất cả trạng thái' : 'All statuses'}</option>
                <option value="resolved_buyer_favor">{statusLabels.resolved_buyer_favor[language]}</option>
                <option value="resolved_seller_favor">{statusLabels.resolved_seller_favor[language]}</option>
                <option value="closed">{statusLabels.closed[language]}</option>
              </select>
              <select
                value={logResolverFilter}
                onChange={(e) => {
                  setLogResolverFilter(e.target.value)
                  setLogPage(1)
                }}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="all">{language === 'vi' ? 'Tất cả người xử lý' : 'All resolvers'}</option>
                {resolverOptions.map((resolver) => (
                  <option key={resolver} value={resolver}>{resolver}</option>
                ))}
              </select>
              <input
                type="date"
                value={logFromDate}
                onChange={(e) => {
                  setLogFromDate(e.target.value)
                  setLogPage(1)
                }}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              />
              <input
                type="date"
                value={logToDate}
                onChange={(e) => {
                  setLogToDate(e.target.value)
                  setLogPage(1)
                }}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              />
            </div>
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              <select
                value={String(logPageSize)}
                onChange={(e) => {
                  setLogPageSize(Number(e.target.value) as 5 | 10 | 20)
                  setLogPage(1)
                }}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="5">5 rows / page</option>
                <option value="10">10 rows / page</option>
                <option value="20">20 rows / page</option>
              </select>
              <select
                value={logSort}
                onChange={(e) => {
                  setLogSort(e.target.value as typeof logSort)
                  setLogPage(1)
                }}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="resolved_at_desc">{language === 'vi' ? 'Mới nhất trước' : 'Newest first'}</option>
                <option value="resolved_at_asc">{language === 'vi' ? 'Cũ nhất trước' : 'Oldest first'}</option>
                <option value="sla_breach_desc">{language === 'vi' ? 'Ưu tiên SLA breach cao' : 'Highest SLA breach first'}</option>
                <option value="resolver_asc">{language === 'vi' ? 'Resolver A-Z' : 'Resolver A-Z'}</option>
              </select>
            </div>
            <div className="mb-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={exportDecisionLogsCsv} disabled={decisionLogs.length === 0}>
                {language === 'vi' ? 'Export CSV' : 'Export CSV'}
              </Button>
            </div>
            <div className="space-y-2">
              {paginatedDecisionLogs.map((dispute) => (
                  <div key={`${dispute.id}-log`} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{dispute.listing.title}</p>
                      <Badge variant="outline" className={cn('text-xs', statusColors[dispute.status])}>
                        {statusLabels[dispute.status][language]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {language === 'vi' ? 'Resolved bởi' : 'Resolved by'} {dispute.resolutionMeta?.resolvedBy} -{' '}
                      {dispute.resolutionMeta ? new Date(dispute.resolutionMeta.resolvedAt).toLocaleString('vi-VN') : ''}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      SLA breach: {getSlaBreachType(dispute.createdAt)}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {language === 'vi' ? 'Resolution latency:' : 'Resolution latency:'}{' '}
                      {getResolutionLatencyHours(dispute.createdAt, dispute.resolutionMeta?.resolvedAt)}h
                    </p>
                    <p className="mt-2 text-sm text-foreground">{dispute.resolutionMeta?.notes}</p>
                  </div>
                ))}
              {decisionLogs.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  {language === 'vi' ? 'Không có log phù hợp bộ lọc hiện tại.' : 'No decision logs match current filters.'}
                </div>
              )}
              {decisionLogs.length > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {language === 'vi' ? 'Trang' : 'Page'} {logPage}/{totalLogPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={logPage <= 1}
                      onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                    >
                      {language === 'vi' ? 'Trước' : 'Prev'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={logPage >= totalLogPages}
                      onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))}
                    >
                      {language === 'vi' ? 'Sau' : 'Next'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolution Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'vi' ? 'Giải Quyết Tranh Chấp' : 'Resolve Dispute'}
            </DialogTitle>
            <DialogDescription>
              {language === 'vi' 
                ? 'Chọn bên được ưu tiên và cung cấp lý do quyết định'
                : 'Choose the favored party and provide the decision rationale'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="font-medium">{selectedDispute?.listing.title}</p>
              <p className="text-sm text-muted-foreground">
                {DISPUTE_TYPE_LABELS[selectedDispute?.type || 'other'][language]}
              </p>
              {selectedDispute && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{language === 'vi' ? 'Độ đầy đủ bằng chứng' : 'Evidence completeness'}</span>
                    <span className="font-medium">{getEvidenceScore(selectedDispute.description)}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-background/80 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        getEvidenceScore(selectedDispute.description) >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                      )}
                      style={{ width: `${getEvidenceScore(selectedDispute.description)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Resolution Choice */}
            <div className="space-y-3">
              <Label>{language === 'vi' ? 'Quyết định' : 'Decision'}</Label>
              <RadioGroup
                value={resolution}
                onValueChange={(v) => setResolution(v as 'buyer' | 'seller')}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="favor-buyer"
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors',
                    resolution === 'buyer'
                      ? 'border-success bg-success/10'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <RadioGroupItem value="buyer" id="favor-buyer" className="sr-only" />
                  <User className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">
                    {language === 'vi' ? 'Ưu tiên Người Mua' : 'Favor Buyer'}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {language === 'vi' ? 'Hoàn tiền cho người mua' : 'Refund to buyer'}
                  </span>
                </Label>
                <Label
                  htmlFor="favor-seller"
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors',
                    resolution === 'seller'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <RadioGroupItem value="seller" id="favor-seller" className="sr-only" />
                  <User className="h-6 w-6 text-success" />
                  <span className="text-sm font-medium">
                    {language === 'vi' ? 'Ưu tiên Người Bán' : 'Favor Seller'}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {language === 'vi' ? 'Giữ tiền cho người bán' : 'Release funds to seller'}
                  </span>
                </Label>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Lý do quyết định' : 'Decision rationale'}</Label>
              <Textarea
                placeholder={language === 'vi' 
                  ? 'Giải thích lý do đưa ra quyết định này...'
                  : 'Explain the rationale for this decision...'}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDispute(null)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button onClick={handleResolve} disabled={!resolutionNotes.trim()}>
              {language === 'vi' ? 'Xác nhận quyết định' : 'Confirm Decision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
