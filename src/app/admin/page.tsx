'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Cell, Pie, PieChart, CartesianGrid, Line, ComposedChart, Legend, XAxis, YAxis } from 'recharts'
import { Package, Users, Wallet, ClipboardList, ReceiptText, MapPin, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { useLanguage } from '@/lib/language-context'
import { formatVND } from '@/lib/mock-data'
import { adminApi } from '@/lib/api/admin-api'
import { cn } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { language } = useLanguage()
  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard-summary'],
    queryFn: adminApi.getDashboardSummary,
    refetchInterval: 30000,
  })
  const usersQuery = useQuery({
    queryKey: ['admin-users-dashboard'],
    queryFn: adminApi.getUsers,
    refetchInterval: 60000,
  })
  const revenueQuery = useQuery({
    queryKey: ['admin-revenue-analytics'],
    queryFn: () => adminApi.getRevenueAnalytics(6),
    refetchInterval: 30000,
  })
  const listingAnalyticsQuery = useQuery({
    queryKey: ['admin-listing-analytics'],
    queryFn: adminApi.getListingAnalytics,
    refetchInterval: 30000,
  })
  const sellerCountQuery = useQuery({
    queryKey: ['admin-seller-count-dashboard'],
    queryFn: adminApi.getSellerUsersTotalCount,
    refetchInterval: 60000,
  })
  const buyerCountQuery = useQuery({
    queryKey: ['admin-buyer-count-dashboard'],
    queryFn: adminApi.getBuyerUsersTotalCount,
    refetchInterval: 60000,
  })
  const usersTotalCountQuery = useQuery({
    queryKey: ['admin-users-total-dashboard'],
    queryFn: adminApi.getUsersTotalCount,
    refetchInterval: 60000,
  })

  const users = usersQuery.data ?? []
  const dashboard = dashboardQuery.data

  const sellerCount = sellerCountQuery.data ?? dashboard?.totalSellers ?? users.filter((u) => u.role === 'SELLER').length
  const buyerCount = buyerCountQuery.data ?? dashboard?.totalBuyers ?? users.filter((u) => u.role === 'BUYER').length
  const totalUsers = usersTotalCountQuery.data ?? sellerCount + buyerCount

  const listingAnalytics = listingAnalyticsQuery.data
  const pendingListingsCount = listingAnalytics?.pending ?? dashboard?.pendingListings ?? 0
  const totalListings = listingAnalytics?.total ?? dashboard?.totalListings ?? 0

  const totalOrders = dashboard?.totalOrders ?? 0
  const completedOrders = dashboard?.completedOrders ?? 0

  const listingOverviewData = [
    { name: language === 'vi' ? 'Chờ duyệt' : 'Pending', value: pendingListingsCount, fill: '#f59e0b' },
    { name: language === 'vi' ? 'Đã duyệt' : 'Approved', value: listingAnalytics?.approved ?? Math.max(totalListings - pendingListingsCount, 0), fill: '#22c55e' },
    { name: language === 'vi' ? 'Từ chối' : 'Rejected', value: listingAnalytics?.rejected ?? 0, fill: '#ef4444' },
  ]

  const listingChartConfig = {
    pending: { label: language === 'vi' ? 'Chờ duyệt' : 'Pending', color: '#f59e0b' },
    approved: { label: language === 'vi' ? 'Đã duyệt' : 'Approved', color: '#22c55e' },
    rejected: { label: language === 'vi' ? 'Từ chối' : 'Rejected', color: '#ef4444' },
  } satisfies ChartConfig

  const revenueDataRaw = revenueQuery.data ?? []
  const formatMonth = (monthStr: string) => {
    if (!monthStr) return ''
    const parts = monthStr.split('-')
    if (parts.length < 2) return monthStr
    const m = parseInt(parts[1], 10)
    return language === 'vi' ? `T${m}` : new Date(2026, m - 1, 1).toLocaleString('en-US', { month: 'short' })
  }

  const gmvData = revenueDataRaw.map((item) => ({
    month: formatMonth(item.month),
    gmv: item.gmv,
    revenue: item.revenue,
  }))

  const totalRevenueFromLine = revenueDataRaw.reduce((sum, item) => sum + item.revenue, 0)
  const cityStats = dashboard?.cities ?? []

  const formatRevenueTick = (value: number) => {
    const abs = Math.abs(value)
    if (abs >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
    if (abs >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (abs >= 1000) return `${(value / 1000).toFixed(1)}K`
    return `${Math.round(value)}`
  }

  const isLoading =
    dashboardQuery.isLoading ||
    usersQuery.isLoading ||
    sellerCountQuery.isLoading ||
    buyerCountQuery.isLoading ||
    usersTotalCountQuery.isLoading ||
    revenueQuery.isLoading ||
    listingAnalyticsQuery.isLoading

  const statCards = [
    {
      label: { vi: 'Tổng Tin Đăng', en: 'Total Listings' },
      value: totalListings.toLocaleString(),
      sub: `${pendingListingsCount} ${language === 'vi' ? 'chờ duyệt' : 'pending'}`,
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bgIcon: 'bg-blue-100 dark:bg-blue-900/40',
      borderAccent: 'border-l-blue-500',
    },
    {
      label: { vi: 'Tổng Người Dùng', en: 'Total Users' },
      value: totalUsers.toLocaleString(),
      sub: `${sellerCount} ${language === 'vi' ? 'người bán' : 'sellers'} • ${buyerCount} ${language === 'vi' ? 'người mua' : 'buyers'}`,
      icon: Users,
      color: 'text-violet-600 dark:text-violet-400',
      bgIcon: 'bg-violet-100 dark:bg-violet-900/40',
      borderAccent: 'border-l-violet-500',
    },
    {
      label: { vi: 'Doanh Thu Giao Dịch', en: 'Revenue' },
      value: formatVND(totalRevenueFromLine),
      sub: language === 'vi' ? '6 tháng gần nhất' : 'Last 6 months',
      icon: Wallet,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgIcon: 'bg-emerald-100 dark:bg-emerald-900/40',
      borderAccent: 'border-l-emerald-500',
    },
    {
      label: { vi: 'Tổng Đơn Hàng', en: 'Total Orders' },
      value: totalOrders.toLocaleString(),
      sub: `${completedOrders} ${language === 'vi' ? 'hoàn thành' : 'completed'}`,
      icon: ReceiptText,
      color: 'text-amber-600 dark:text-amber-400',
      bgIcon: 'bg-amber-100 dark:bg-amber-900/40',
      borderAccent: 'border-l-amber-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            {language === 'vi' ? 'Bảng Điều Khiển' : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'vi' ? 'Tổng quan hoạt động hệ thống xe đạp' : 'Platform activity overview'}
          </p>
        </div>
        <Badge variant="outline" className={cn(
          "text-xs px-3 py-1.5 font-semibold tracking-wide",
          isLoading
            ? "border-muted-foreground/30 text-muted-foreground"
            : "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
        )}>
          <span className={cn(
            "inline-block h-2 w-2 rounded-full mr-2",
            isLoading ? "bg-muted-foreground animate-pulse" : "bg-emerald-500 animate-pulse"
          )} />
          {isLoading ? (language === 'vi' ? 'Đang tải...' : 'Loading...') : 'LIVE'}
        </Badge>
      </div>

      {/* Stat Cards — redesigned with left border accent */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label.en}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * (index + 1) }}
          >
            <Card className={cn(
              'border-l-4 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
              stat.borderAccent
            )}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label[language]}
                </CardTitle>
                <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', stat.bgIcon)}>
                  <stat.icon className={cn('h-4.5 w-4.5', stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* City Stats — redesigned with better cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.43 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{language === 'vi' ? 'Thống Kê Theo Thành Phố' : 'City Statistics'}</CardTitle>
                <CardDescription>
                  {language === 'vi'
                    ? 'Phân bổ tin đăng và giao dịch theo khu vực'
                    : 'Listings and transactions by region'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {cityStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <MapPin className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">{language === 'vi' ? 'Chưa có dữ liệu thành phố.' : 'No city data available.'}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cityStats.map((city, i) => (
                  <motion.div
                    key={city.city}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    className="group rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/20 p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-archivo)' }}>
                        {city.city}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-blue-50/60 dark:bg-blue-950/20 p-3">
                        <p className="text-xs text-muted-foreground mb-1">{language === 'vi' ? 'Tin đăng' : 'Listings'}</p>
                        <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400" style={{ fontFamily: 'var(--font-archivo)' }}>
                          {city.listings.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 p-3">
                        <p className="text-xs text-muted-foreground mb-1">{language === 'vi' ? 'Giao dịch' : 'Orders'}</p>
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400" style={{ fontFamily: 'var(--font-archivo)' }}>
                          {city.orders.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* GMV & Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <div>
                <CardTitle>{language === 'vi' ? 'Tổng Giao Dịch (GMV) & Lợi Nhuận' : 'GMV & Revenue'}</CardTitle>
                <CardDescription>
                  {language === 'vi'
                    ? 'So sánh tổng giá trị giao dịch và hoa hồng thu được (5%)'
                    : 'Comparing total transaction value and 5% commission revenue'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                gmv: { label: 'GMV', color: '#cbd5e1' },
                revenue: { label: language === 'vi' ? 'Lợi nhuận' : 'Revenue', color: '#16a34a' },
              }}
              className="h-[300px] w-full"
            >
              <ComposedChart data={gmvData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={formatRevenueTick} />
                <Line type="monotone" dataKey="gmv" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4, fill: '#94a3b8' }} name="GMV" />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                  name={language === 'vi' ? 'Lợi nhuận (5%)' : 'Revenue (5%)'}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <span className="font-medium">
                          {name === 'gmv' ? 'GMV: ' : language === 'vi' ? 'Lợi nhuận: ' : 'Revenue: '}
                          {formatVND(Number(value) || 0)}
                        </span>
                      )}
                    />
                  }
                />
                <Legend verticalAlign="top" height={36}/>
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Listing Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{language === 'vi' ? 'Tình Trạng Tin Đăng' : 'Listing Status Overview'}</CardTitle>
                <CardDescription>
                  {language === 'vi'
                    ? 'Phân bổ trạng thái tất cả tin đăng trên hệ thống'
                    : 'Status distribution of all platform listings'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <ChartContainer config={listingChartConfig} className="h-[300px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={listingOverviewData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={130}
                    paddingAngle={5}
                    cornerRadius={8}
                    stroke="none"
                  >
                    {listingOverviewData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    <tspan x="50%" dy="-0.5em" fontSize="36" fontWeight="900" fill="currentColor" style={{ fontFamily: 'var(--font-archivo)' }}>
                      {totalListings.toLocaleString()}
                    </tspan>
                    <tspan x="50%" dy="1.5em" fontSize="14" fill="var(--muted-foreground)">
                      {language === 'vi' ? 'Tổng tin đăng' : 'Total Listings'}
                    </tspan>
                  </text>
                </PieChart>
              </ChartContainer>

              <div className="space-y-3">
                {listingOverviewData.map((item) => {
                  const percentage = totalListings > 0 ? ((item.value / totalListings) * 100).toFixed(1) : '0';
                  return (
                    <div key={`listing-stat-${item.name}`} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/80 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-3.5 h-3.5 rounded-full ring-4 ring-offset-2 ring-offset-background"
                          style={{ backgroundColor: item.fill, ['--tw-ring-color' as string]: `${item.fill}30` }}
                        />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{percentage}% {language === 'vi' ? 'tỉ trọng' : 'share'}</p>
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>
                        {item.value.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  )
}
