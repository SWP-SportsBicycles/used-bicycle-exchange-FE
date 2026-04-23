'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Package, 
  Users,
  Wallet,
  TrendingUp,
  AlertOctagon,
  ClipboardList,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/language-context'
import { 
  MOCK_ANALYTICS,
  MOCK_ADMIN_APPROVALS,
  MOCK_DISPUTES,
  formatVND,
  DISPUTE_TYPE_LABELS
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const disputeStatusColors: Record<string, string> = {
  open: 'bg-destructive/20 text-destructive',
  investigating: 'bg-amber-500/20 text-amber-600',
  resolved_buyer_favor: 'bg-success/20 text-success',
  resolved_seller_favor: 'bg-success/20 text-success',
  closed: 'bg-muted text-muted-foreground',
}

export default function AdminDashboardPage() {
  const { language } = useLanguage()
  const analytics = MOCK_ANALYTICS
  const pendingApprovals = MOCK_ADMIN_APPROVALS.filter(a => a.status === 'pending')
  const activeDisputes = MOCK_DISPUTES.filter(d => ['open', 'investigating'].includes(d.status))

  return (
    <div className="space-y-6">
      {/* Header - Command Center Feel */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            {language === 'vi' ? 'Trung Tâm Điều Khiển' : 'Command Center'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'vi' 
              ? 'Quản lý và giám sát hoạt động VeloTrust' 
              : 'Manage and monitor VeloTrust operations'}
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/30 bg-primary/5 text-primary font-medium">
          LIVE
        </Badge>
      </div>

      {/* Stats Grid - Command Center Style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/60 shadow-athletic hover:shadow-athletic-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'vi' ? 'Tổng Tin Đăng' : 'Total Listings'}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{analytics.totalListings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.activeListings} {language === 'vi' ? 'đang hoạt động' : 'active'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/60 shadow-athletic hover:shadow-athletic-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'vi' ? 'Tổng Người Dùng' : 'Total Users'}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{analytics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.activeSellers} {language === 'vi' ? 'người bán' : 'sellers'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-success/30 shadow-athletic hover:shadow-athletic-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'vi' ? 'Doanh Thu Tháng' : 'Monthly Volume'}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-success/15 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-success" style={{ fontFamily: 'var(--font-archivo)' }}>{formatVND(analytics.thisMonthVolume)}</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +18% {language === 'vi' ? 'so với tháng trước' : 'vs last month'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/60 shadow-athletic hover:shadow-athletic-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                VeloSafe Inspections
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{analytics.veloSafeInspections}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.disputeRate}% {language === 'vi' ? 'tỉ lệ tranh chấp' : 'dispute rate'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats by City */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Thống Kê Theo Thành Phố' : 'Stats by City'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {Object.entries(analytics.citiesBreakdown).map(([city, data]) => (
                <div key={city} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-semibold capitalize">
                      {city === 'hanoi' ? 'Hà Nội' : city === 'hcm' ? 'TP.HCM' : 'Đà Nẵng'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{language === 'vi' ? 'Tin đăng' : 'Listings'}</p>
                      <p className="text-lg font-bold">{data.listings}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{language === 'vi' ? 'Giao dịch' : 'Transactions'}</p>
                      <p className="text-lg font-bold">{data.transactions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  {language === 'vi' ? 'Chờ Duyệt' : 'Pending Approval'}
                </CardTitle>
                <CardDescription>
                  {pendingApprovals.length} {language === 'vi' ? 'tin đăng chờ xét duyệt' : 'listings awaiting review'}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/approvals" className="gap-1">
                    {language === 'vi' ? 'Xem tất cả' : 'View all'}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/order" className="gap-1">
                    {language === 'vi' ? 'Kiểm duyệt đơn hàng' : 'Order review'}
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingApprovals.slice(0, 3).map((approval) => (
                  <div 
                    key={approval.id} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image 
                        src={approval.listing.images[0]} 
                        alt={approval.listing.title}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{approval.listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {approval.listing.brand} - {formatVND(approval.listing.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(approval.submittedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Disputes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5 text-destructive" />
                  {language === 'vi' ? 'Tranh Chấp' : 'Active Disputes'}
                </CardTitle>
                <CardDescription>
                  {activeDisputes.length} {language === 'vi' ? 'tranh chấp đang xử lý' : 'disputes being handled'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/disputes" className="gap-1">
                  {language === 'vi' ? 'Xem tất cả' : 'View all'}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeDisputes.map((dispute) => (
                  <div 
                    key={dispute.id} 
                    className="p-4 rounded-lg border border-destructive/20 bg-destructive/5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-sm font-medium">{dispute.listing.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {dispute.buyer.name} vs {dispute.seller.name}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn('text-xs', disputeStatusColors[dispute.status])}>
                        {dispute.status === 'open' 
                          ? (language === 'vi' ? 'Mở' : 'Open')
                          : (language === 'vi' ? 'Đang xử lý' : 'Investigating')
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-muted">
                        {DISPUTE_TYPE_LABELS[dispute.type][language]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(dispute.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
