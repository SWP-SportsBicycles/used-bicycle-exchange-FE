'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, Cell, Pie, PieChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Package, Users, Wallet, ClipboardList, ReceiptText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { useLanguage } from '@/lib/language-context'
import { formatVND } from '@/lib/mock-data'
import { adminApi } from '@/lib/api/admin-api'

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

  const revenueByMonthMap = new Map<number, number>()
  orders.forEach((order) => {
    if (!order.completedAt || order.status !== 'Completed') return
    const date = new Date(order.completedAt)
    if (Number.isNaN(date.getTime())) return
    const month = date.getMonth()
    revenueByMonthMap.set(month, (revenueByMonthMap.get(month) ?? 0) + order.totalAmount)
  })
  const revenueLineData = Array.from({ length: 12 }, (_, monthIndex) => ({
    month:
      language === 'vi'
        ? `T${monthIndex + 1}`
        : new Date(2026, monthIndex, 1).toLocaleString('en-US', { month: 'short' }),
    revenue: revenueByMonthMap.get(monthIndex) ?? 0,
  }))
  const totalRevenueFromLine = revenueLineData.reduce((sum, item) => sum + item.revenue, 0)

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
                {language === 'vi' ? 'Từ đơn Completed (AdminOrder)' : 'From completed orders (AdminOrder)'}
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Doanh Thu Theo Tháng' : 'Monthly Revenue Trend'}</CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'Biểu đồ line tăng/giảm doanh thu theo đơn '
                : 'Line chart of monthly revenue growth/decline from completed AdminOrder'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ revenue: { label: language === 'vi' ? 'Doanh thu' : 'Revenue', color: '#16a34a' } }}
              className="h-[220px] w-full"
            >
              <LineChart data={revenueLineData} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={formatRevenueTick} width={64} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => <span className="font-medium">{formatVND(Number(value) || 0)}</span>}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: 'var(--color-revenue)' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Phân Bổ Người Dùng' : 'User Distribution'}</CardTitle>
            <CardDescription>{language === 'vi' ? 'Chỉ gồm người mua và người bán' : 'Buyer and seller only'}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={userChartConfig} className="h-[140px] w-full">
              <BarChart data={userChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="role" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={8}>
                  {userChartData.map((entry) => (
                    <Cell key={entry.role} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  {language === 'vi' ? 'Tổng Quan Tin Đăng' : 'Listing Overview'}
                </CardTitle>
                <CardDescription>
                  {language === 'vi' ? 'Dữ liệu từ AdminListing' : 'Data from AdminListing'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <ChartContainer config={listingChartConfig} className="h-[220px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={listingOverviewData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                      {listingOverviewData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="grid w-full grid-cols-3 gap-2 text-xs">
                  {listingOverviewData.map((item) => (
                    <div key={`listing-legend-${item.name}`} className="rounded-md border border-border/50 p-2 text-center">
                      <div className="font-semibold" style={{ color: item.fill }}>{item.name}</div>
                      <div className="text-muted-foreground">{item.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-primary" />
                  {language === 'vi' ? 'Trạng Thái Đơn Hàng' : 'Order Status Distribution'}
                </CardTitle>
                
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <ChartContainer
                  config={{
                    locked: { label: 'Locked', color: '#ef4444' },
                    confirmed: { label: 'Confirmed', color: '#f59e0b' },
                    completed: { label: 'Completed', color: '#22c55e' },
                  }}
                  className="h-[220px] w-full"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={orderStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                      {orderStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="grid w-full grid-cols-3 gap-2 text-xs">
                  {orderStatusData.map((item) => (
                    <div key={`legend-${item.name}`} className="rounded-md border border-border/50 p-2 text-center">
                      <div className="font-semibold" style={{ color: item.fill }}>{item.name}</div>
                      <div className="text-muted-foreground">{item.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </div>
  )
}
