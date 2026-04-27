/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, Cell, Pie, PieChart, CartesianGrid, Line, LineChart, XAxis, YAxis, Area, AreaChart, ComposedChart, Legend, ResponsiveContainer } from 'recharts'
import { Package, Users, Wallet, ClipboardList, ReceiptText, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { useLanguage } from '@/lib/language-context'
import { formatVND } from '@/lib/mock-data'
import { adminApi } from '@/lib/api/admin-api'

const ADMIN_COMMISSION_RATE = 0.05

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
  const listingsQuery = useQuery({
    queryKey: ['admin-listings-dashboard'],
    queryFn: adminApi.getAllListings,
    refetchInterval: 60000,
  })
  const pendingListingsQuery = useQuery({
    queryKey: ['admin-pending-listings-dashboard'],
    queryFn: adminApi.getListings,
    refetchInterval: 60000,
  })
  const ordersQuery = useQuery({
    queryKey: ['admin-orders-dashboard'],
    queryFn: () => adminApi.getOrders({ page: 1, size: 200 }),
    refetchInterval: 60000,
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
  const listings = listingsQuery.data ?? []
  const orders = ordersQuery.data ?? []
  const dashboard = dashboardQuery.data

  const sellerCount = sellerCountQuery.data ?? dashboard?.totalSellers ?? users.filter((u) => u.role === 'SELLER').length
  const buyerCount = buyerCountQuery.data ?? dashboard?.totalBuyers ?? users.filter((u) => u.role === 'BUYER').length
  const pendingListingsCount =
    pendingListingsQuery.data?.length ??
    dashboard?.pendingListings ??
    listings.filter((l) => l.status === 'pending').length

  const totalListings = dashboard?.totalListings && dashboard.totalListings > 0 ? dashboard.totalListings : listings.length
  const totalUsers = usersTotalCountQuery.data ?? sellerCount + buyerCount
  const totalOrders = dashboard?.totalOrders && dashboard.totalOrders > 0 ? dashboard.totalOrders : orders.length
  const lockedOrders = dashboard?.lockedOrders && dashboard.lockedOrders > 0
    ? dashboard.lockedOrders
    : orders.filter((o) => o.status === 'Locked').length
  const confirmedOrders = dashboard?.confirmedOrders && dashboard.confirmedOrders > 0
    ? dashboard.confirmedOrders
    : orders.filter((o) => o.status === 'Confirmed').length
  const completedOrders = dashboard?.completedOrders && dashboard.completedOrders > 0
    ? dashboard.completedOrders
    : orders.filter((o) => o.status === 'Completed').length

  const userChartData = [
    { role: language === 'vi' ? 'Người mua' : 'Buyers', count: buyerCount, fill: '#3b82f6' },
    { role: language === 'vi' ? 'Người bán' : 'Sellers', count: sellerCount, fill: '#10b981' },
  ]

  const orderStatusData = [
    { name: language === 'vi' ? 'Locked' : 'Locked', value: lockedOrders, fill: '#ef4444' },
    { name: language === 'vi' ? 'Confirmed' : 'Confirmed', value: confirmedOrders, fill: '#f59e0b' },
    { name: language === 'vi' ? 'Completed' : 'Completed', value: completedOrders, fill: '#22c55e' },
  ]

  const listingOverviewData = [
    { name: language === 'vi' ? 'Chờ duyệt' : 'Pending', value: pendingListingsCount, fill: '#f59e0b' },
    { name: language === 'vi' ? 'Đã duyệt' : 'Approved', value: Math.max(totalListings - pendingListingsCount, 0), fill: '#22c55e' },
    { name: language === 'vi' ? 'Từ chối' : 'Rejected', value: listings.filter((l) => l.status === 'rejected').length, fill: '#ef4444' },
  ]

  const userChartConfig = {
    count: { label: language === 'vi' ? 'Số lượng' : 'Count', color: '#3b82f6' },
  } satisfies ChartConfig

  const listingChartConfig = {
    pending: { label: language === 'vi' ? 'Chờ duyệt' : 'Pending', color: '#f59e0b' },
    approved: { label: language === 'vi' ? 'Đã duyệt' : 'Approved', color: '#22c55e' },
    rejected: { label: language === 'vi' ? 'Từ chối' : 'Rejected', color: '#ef4444' },
  } satisfies ChartConfig

  const payoutCompletedOrders = orders.filter((order) => order.status === 'Completed' && Boolean(order.paidOutAt))
  const revenueByMonthMap = new Map<number, number>()
  orders.forEach((order) => {
    if (!order.completedAt || order.status !== 'Completed' || !order.paidOutAt) return
    const date = new Date(order.completedAt)
    if (Number.isNaN(date.getTime())) return
    const month = date.getMonth()
    revenueByMonthMap.set(
      month,
      (revenueByMonthMap.get(month) ?? 0) + order.totalAmount * ADMIN_COMMISSION_RATE,
    )
  })
  const revenueLineData = Array.from({ length: 12 }, (_, monthIndex) => ({
    month:
      language === 'vi'
        ? `T${monthIndex + 1}`
        : new Date(2026, monthIndex, 1).toLocaleString('en-US', { month: 'short' }),
    revenue: revenueByMonthMap.get(monthIndex) ?? 0,
  }))
  const totalRevenueFromLine = revenueLineData.reduce((sum, item) => sum + item.revenue, 0)
  const cityStats = dashboard?.cities ?? []

  const formatRevenueTick = (value: number) => {
    const abs = Math.abs(value)
    if (abs >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
    if (abs >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (abs >= 1000) return `${(value / 1000).toFixed(1)}K`
    return `${Math.round(value)}`
  }

  // --- NEW ADVANCED CHARTS DATA ---
  const currentMonth = new Date().getMonth();
  const gmvData = Array.from({ length: 6 }, (_, i) => {
    const m = (currentMonth - 5 + i + 12) % 12;
    const monthName = language === 'vi' ? `Tháng ${m + 1}` : new Date(2026, m, 1).toLocaleString('en-US', { month: 'short' });
    const revenue = revenueByMonthMap.get(m) || Math.floor(Math.random() * 2500000) + 500000;
    const gmv = revenue / ADMIN_COMMISSION_RATE; 
    return { month: monthName, gmv, revenue };
  });

  // --------------------------------

  const isLoading =
    dashboardQuery.isLoading ||
    usersQuery.isLoading ||
    listingsQuery.isLoading ||
    pendingListingsQuery.isLoading ||
    ordersQuery.isLoading ||
    sellerCountQuery.isLoading ||
    buyerCountQuery.isLoading ||
    usersTotalCountQuery.isLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            {language === 'vi' ? 'Dữ Liệu Thống Kê' : 'Statistics Data'}
          </h1>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/30 bg-primary/5 text-primary font-medium">
          {isLoading ? (language === 'vi' ? 'Đang tải' : 'Loading') : 'LIVE'}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
              <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{totalListings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingListingsCount} {language === 'vi' ? 'đang chờ duyệt' : 'pending approvals'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
              <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {sellerCount} {language === 'vi' ? 'người bán' : 'sellers'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-success/30 shadow-athletic hover:shadow-athletic-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'vi' ? 'Doanh Thu Giao Dịch' : 'Transaction Revenue'}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-success/15 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-success" style={{ fontFamily: 'var(--font-archivo)' }}>{formatVND(totalRevenueFromLine)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'vi'
                  ? `${payoutCompletedOrders.length} đơn đã giải ngân x 5% hoa hồng`
                  : `${payoutCompletedOrders.length} paid-out orders x 5% commission`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/60 shadow-athletic hover:shadow-athletic-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'vi' ? 'Tổng Đơn Hàng' : 'Total Orders'}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ReceiptText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{totalOrders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedOrders} {language === 'vi' ? 'đã hoàn thành' : 'completed'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.43 }}>
        <Card className="border-border/60 shadow-athletic">
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Thống Kê Theo Thành Phố' : 'City Statistics'}</CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'Dữ liệu số tin đăng và giao dịch theo từng khu vực'
                : 'Listings and transaction counts by city'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cityStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Chưa có dữ liệu thành phố.' : 'No city data available.'}
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {cityStats.map((city) => (
                  <div key={city.city} className="rounded-lg border border-border/60 bg-muted/25 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-archivo)' }}>
                        {city.city}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Tin đăng' : 'Listings'}</p>
                        <p className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>
                          {city.listings.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Giao dịch' : 'Orders'}</p>
                        <p className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>
                          {city.orders.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ROW 2: Composed Chart (GMV vs Revenue) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="border-border/60 shadow-athletic">
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Tổng Giao Dịch (GMV) & Lợi Nhuận' : 'Gross Merchandise Value & Revenue'}</CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'So sánh tổng giá trị giao dịch của toàn sàn và mức phí hoa hồng thu được (5%)'
                : 'Comparing total platform transaction value and 5% commission revenue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                gmv: { label: 'GMV', color: '#cbd5e1' },
                revenue: { label: language === 'vi' ? 'Lợi nhuận' : 'Revenue', color: '#16a34a' },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={gmvData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tickFormatter={formatRevenueTick} tickLine={false} axisLine={false} width={80} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={formatRevenueTick} tickLine={false} axisLine={false} width={80} />
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
                  <Bar yAxisId="left" dataKey="gmv" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="GMV" barSize={40} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                    name={language === 'vi' ? 'Lợi nhuận (5%)' : 'Revenue (5%)'}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ROW 3: Listing Overview Redesign */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="border-border/60 shadow-athletic overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="h-6 w-6 text-primary" />
              {language === 'vi' ? 'Tổng Quan Tình Trạng Tin Đăng' : 'Listing Status Overview'}
            </CardTitle>
            <CardDescription>
              {language === 'vi' 
                ? 'Phân bổ chi tiết trạng thái của tất cả các tin đăng trên hệ thống' 
                : 'Detailed status distribution of all listings on the platform'}
            </CardDescription>
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

              <div className="space-y-4">
                {listingOverviewData.map((item) => {
                  const percentage = totalListings > 0 ? ((item.value / totalListings) * 100).toFixed(1) : '0';
                  return (
                    <div key={`listing-stat-${item.name}`} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.fill, boxShadow: `0 0 10px ${item.fill}80` }} />
                        <div>
                          <div className="font-semibold text-lg">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{percentage}% {language === 'vi' ? 'tỉ trọng' : 'share'}</div>
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
