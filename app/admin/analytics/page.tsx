'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, ArrowUpRight, BarChart3, ChartNoAxesCombined, CircleAlert, ClipboardCheck, MapPinned, ShieldCheck, Wallet } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useLanguage } from '@/lib/language-context'
import { MOCK_ADMIN_APPROVALS, MOCK_ANALYTICS, MOCK_DISPUTES, formatVND } from '@/lib/mock-data'

const timeframes = {
  '30d': {
    gmv: [
      { label: 'Tuần 1', volume: 98000000, transactions: 16, inspections: 8 },
      { label: 'Tuần 2', volume: 124000000, transactions: 19, inspections: 11 },
      { label: 'Tuần 3', volume: 107000000, transactions: 17, inspections: 10 },
      { label: 'Tuần 4', volume: 121000000, transactions: 22, inspections: 13 },
    ],
    operations: [
      { label: 'Road', listings: 42, approvals: 12, disputes: 1 },
      { label: 'MTB', listings: 21, approvals: 6, disputes: 0 },
      { label: 'Gravel', listings: 17, approvals: 4, disputes: 1 },
      { label: 'Urban', listings: 9, approvals: 2, disputes: 0 },
    ],
    userMix: [
      { name: 'Buyer', value: 890, fill: '#60a5fa' },
      { name: 'Seller', value: 355, fill: '#aee86c' },
      { name: 'Inspector', value: 18, fill: '#f59e0b' },
      { name: 'Admin', value: 6, fill: '#8b5cf6' },
    ],
    approvalSlaHours: 11,
    inspectionCoverage: 88,
  },
  '90d': {
    gmv: [
      { label: 'Tháng 1', volume: 302000000, transactions: 41, inspections: 29 },
      { label: 'Tháng 2', volume: 365000000, transactions: 53, inspections: 34 },
      { label: 'Tháng 3', volume: 401000000, transactions: 58, inspections: 37 },
      { label: 'Tháng 4', volume: 450000000, transactions: 64, inspections: 42 },
    ],
    operations: [
      { label: 'Road', listings: 67, approvals: 18, disputes: 2 },
      { label: 'MTB', listings: 35, approvals: 10, disputes: 1 },
      { label: 'Gravel', listings: 26, approvals: 8, disputes: 1 },
      { label: 'Urban', listings: 18, approvals: 6, disputes: 0 },
    ],
    userMix: [
      { name: 'Buyer', value: 890, fill: '#60a5fa' },
      { name: 'Seller', value: 355, fill: '#aee86c' },
      { name: 'Inspector', value: 18, fill: '#f59e0b' },
      { name: 'Admin', value: 6, fill: '#8b5cf6' },
    ],
    approvalSlaHours: 14,
    inspectionCoverage: 84,
  },
  ytd: {
    gmv: [
      { label: 'Q1', volume: 1067000000, transactions: 152, inspections: 100 },
      { label: 'Q2', volume: 1210000000, transactions: 171, inspections: 118 },
      { label: 'Q3', volume: 1350000000, transactions: 189, inspections: 131 },
      { label: 'Q4', volume: 1520000000, transactions: 207, inspections: 146 },
    ],
    operations: [
      { label: 'Road', listings: 143, approvals: 41, disputes: 5 },
      { label: 'MTB', listings: 78, approvals: 25, disputes: 3 },
      { label: 'Gravel', listings: 56, approvals: 17, disputes: 2 },
      { label: 'Urban', listings: 34, approvals: 12, disputes: 1 },
    ],
    userMix: [
      { name: 'Buyer', value: 890, fill: '#60a5fa' },
      { name: 'Seller', value: 355, fill: '#aee86c' },
      { name: 'Inspector', value: 18, fill: '#f59e0b' },
      { name: 'Admin', value: 6, fill: '#8b5cf6' },
    ],
    approvalSlaHours: 16,
    inspectionCoverage: 82,
  },
}

const cityPerformance = [
  { city: 'Hà Nội', listings: 67, transactions: 98, share: 39 },
  { city: 'TP.HCM', listings: 54, transactions: 112, share: 45 },
  { city: 'Đà Nẵng', listings: 35, transactions: 24, share: 16 },
]

const chartConfig = {
  volume: { label: 'GMV', color: '#253218' },
  transactions: { label: 'Transactions', color: '#aee86c' },
  inspections: { label: 'Inspections', color: '#f59e0b' },
  listings: { label: 'Listings', color: '#253218' },
  approvals: { label: 'Approvals', color: '#aee86c' },
  disputes: { label: 'Disputes', color: '#ef4444' },
} as const

export default function AdminAnalyticsPage() {
  const { language } = useLanguage()
  const [timeframe, setTimeframe] = useState<keyof typeof timeframes>('90d')

  const activeSet = timeframes[timeframe]
  const liveAlerts = useMemo(() => {
    return [
      {
        title: language === 'vi' ? 'Hàng chờ duyệt đang tăng' : 'Approval queue rising',
        description: language === 'vi'
          ? `${MOCK_ADMIN_APPROVALS.filter((item) => item.status === 'pending').length} listing đang chờ duyệt, nên tăng slot moderation trong giờ cao điểm.`
          : 'Pending listings are rising during peak hours.',
      },
      {
        title: language === 'vi' ? 'Tỷ lệ tranh chấp đang trong ngưỡng tốt' : 'Dispute rate remains healthy',
        description: language === 'vi'
          ? `${MOCK_DISPUTES.length} dispute trên volume hiện tại vẫn dưới ngưỡng cảnh báo chiến lược.`
          : 'Current dispute level remains below strategic risk threshold.',
      },
      {
        title: language === 'vi' ? 'TP.HCM đang dẫn tăng trưởng' : 'HCMC leads growth',
        description: language === 'vi'
          ? 'Đây là nơi nên ưu tiên supply premium và chiến dịch demand generation.'
          : 'This is where premium supply and demand generation should focus.',
      },
    ]
  }, [language])

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/60 bg-[linear-gradient(135deg,#f6fbef_0%,#f6fbef_52%,#18250f_52.1%,#223215_100%)] shadow-athletic-lg">
        <CardContent className="grid gap-6 p-0 lg:grid-cols-[1.15fr_0.95fr]">
          <div className="space-y-5 px-6 py-6 lg:px-8 lg:py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5d8a3b]">
              <ChartNoAxesCombined className="h-3.5 w-3.5" />
              {language === 'vi' ? 'Growth command board' : 'Growth command board'}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl" style={{ fontFamily: 'var(--font-archivo)' }}>
                {language === 'vi' ? 'Analytics & Reporting' : 'Analytics & Reporting'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {language === 'vi'
                  ? 'Đọc GMV, chất lượng vận hành, phân bổ thành phố và các tín hiệu rủi ro của marketplace trong một màn hình.'
                  : 'Read GMV, operational quality, city allocation, and risk signals in one screen.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={timeframe} onValueChange={(value) => setTimeframe(value as keyof typeof timeframes)}>
                <SelectTrigger className="w-[160px] bg-white/90">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">{language === 'vi' ? '30 ngày' : '30 days'}</SelectItem>
                  <SelectItem value="90d">{language === 'vi' ? '90 ngày' : '90 days'}</SelectItem>
                  <SelectItem value="ytd">YTD</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="border-primary/25 bg-primary/5 px-3 py-1.5 text-[#4c7b39]">
                {language === 'vi' ? 'Simulated VeloTrust operating data' : 'Simulated VeloTrust business data'}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 px-6 py-6 lg:px-8 lg:py-8">
            {[
              { title: 'GMV', value: formatVND(MOCK_ANALYTICS.thisMonthVolume), note: language === 'vi' ? '+18% so với kỳ trước' : '+18% vs previous period', icon: Wallet },
              { title: 'Inspection coverage', value: `${activeSet.inspectionCoverage}%`, note: language === 'vi' ? 'Listing có tín hiệu kiểm tra đầy đủ' : 'Listings with full inspection signal', icon: ShieldCheck },
              { title: 'Approval SLA', value: `${activeSet.approvalSlaHours}h`, note: language === 'vi' ? 'Thời gian duyệt trung bình' : 'Average moderation turnaround', icon: ClipboardCheck },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/8 p-4 text-white backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.title}</p>
                    <p className="mt-2 text-2xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{item.value}</p>
                    <p className="mt-1 text-xs text-slate-300">{item.note}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <item.icon className="h-5 w-5 text-lime-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: language === 'vi' ? 'Tổng giá trị giao dịch' : 'Total volume', value: formatVND(MOCK_ANALYTICS.totalVolume), note: language === 'vi' ? 'Lũy kế toàn nền tảng' : 'Platform cumulative', icon: Wallet },
          { title: language === 'vi' ? 'Active listings' : 'Active listings', value: MOCK_ANALYTICS.activeListings, note: language === 'vi' ? 'Nguồn cung đang mở bán' : 'Live supply', icon: BarChart3 },
          { title: language === 'vi' ? 'Dispute rate' : 'Dispute rate', value: `${MOCK_ANALYTICS.disputeRate}%`, note: language === 'vi' ? 'Đo độ lành mạnh giao dịch' : 'Marketplace health', icon: CircleAlert },
          { title: language === 'vi' ? 'VeloSafe inspections' : 'VeloSafe inspections', value: MOCK_ANALYTICS.veloSafeInspections, note: language === 'vi' ? 'Lợi thế trust cốt lõi' : 'Core trust advantage', icon: ShieldCheck },
        ].map((item, index) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index }}>
            <Card className="h-full border-border/60 shadow-athletic transition-all duration-300 hover:-translate-y-0.5 hover:shadow-athletic-lg">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="mt-2 text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{item.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-[#4d7d39]">
                  <item.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'GMV & Throughput' : 'GMV & Throughput'}</CardTitle>
            <CardDescription>
              {language === 'vi' ? 'Đọc cùng lúc volume giao dịch, số lượt chốt đơn và số phiên kiểm định.' : 'Read volume, conversion throughput, and inspection load together.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <AreaChart data={activeSet.gmv}>
                <defs>
                  <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-volume)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--color-volume)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillTransactions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-transactions)" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="var(--color-transactions)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(value / 1000000)}M`} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area yAxisId="left" type="monotone" dataKey="volume" stroke="var(--color-volume)" fill="url(#fillVolume)" strokeWidth={2.5} />
                <Area yAxisId="right" type="monotone" dataKey="transactions" stroke="var(--color-transactions)" fill="url(#fillTransactions)" strokeWidth={2.5} />
                <Area yAxisId="right" type="monotone" dataKey="inspections" stroke="var(--color-inspections)" fillOpacity={0} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Điểm nhấn điều hành' : 'Executive Highlights'}</CardTitle>
            <CardDescription>
              {language === 'vi' ? 'Những tín hiệu nên dẫn dắt ưu tiên moderation, supply và vận hành.' : 'Signals to guide moderation, supply, and ops priorities.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveAlerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-border/60 bg-muted/25 p-4">
                <p className="font-semibold text-foreground">{alert.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{alert.description}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{language === 'vi' ? 'Hành động gợi ý' : 'Suggested action'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {language === 'vi' ? 'Tăng slot duyệt listing tại TP.HCM và chuẩn hóa checklist mô tả cho seller có dispute.' : 'Increase HCMC moderation capacity and standardize seller description checklists.'}
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Supply & Moderation Mix' : 'Supply & Moderation Mix'}</CardTitle>
            <CardDescription>
              {language === 'vi' ? 'So sánh listing, lượng duyệt và dispute theo nhóm xe để tìm điểm nóng vận hành.' : 'Compare listings, approvals, and disputes across bike segments.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={activeSet.operations}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="listings" fill="var(--color-listings)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="approvals" fill="var(--color-approvals)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="disputes" fill="var(--color-disputes)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Cơ cấu người dùng' : 'User Composition'}</CardTitle>
            <CardDescription>
              {language === 'vi' ? 'Tỷ trọng buyer, seller, inspector và admin để đọc cân bằng supply-demand.' : 'Distribution of buyers, sellers, inspectors, and admins.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <ChartContainer config={chartConfig} className="mx-auto h-[240px] w-full max-w-[240px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                <Pie data={activeSet.userMix} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4}>
                  {activeSet.userMix.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="space-y-3">
              {activeSet.userMix.map((segment) => (
                <div key={segment.name} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{segment.name}</p>
                    <span className="text-sm text-muted-foreground">{segment.value}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-secondary">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((segment.value / 1269) * 100)}%`, backgroundColor: segment.fill }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Hiệu suất theo thành phố' : 'City Performance'}</CardTitle>
            <CardDescription>
              {language === 'vi' ? 'Kết hợp listing, giao dịch và thị phần để quyết định nơi cần bơm supply.' : 'Read listings, transactions, and share to guide supply focus.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cityPerformance.map((city) => (
              <div key={city.city} className="rounded-2xl border border-border/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPinned className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-foreground">{city.city}</p>
                  </div>
                  <Badge variant="outline">{city.share}% share</Badge>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Listings</p>
                    <p className="mt-1 text-xl font-bold">{city.listings}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{language === 'vi' ? 'Giao dịch' : 'Transactions'}</p>
                    <p className="mt-1 text-xl font-bold">{city.transactions}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{language === 'vi' ? 'Hiệu suất' : 'Efficiency'}</p>
                    <p className="mt-1 text-xl font-bold">{Math.round((city.transactions / city.listings) * 10) / 10}x</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Operational Health' : 'Operational Health'}</CardTitle>
            <CardDescription>
              {language === 'vi' ? 'Các chỉ số cần theo dõi hằng ngày cho moderation, inspection và dispute.' : 'Daily control metrics for moderation, inspection, and disputes.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: language === 'vi' ? 'Pending approvals' : 'Pending approvals', value: MOCK_ADMIN_APPROVALS.filter((item) => item.status === 'pending').length, target: 6, icon: ClipboardCheck },
              { label: language === 'vi' ? 'Open disputes' : 'Open disputes', value: MOCK_DISPUTES.filter((item) => ['open', 'investigating'].includes(item.status)).length, target: 3, icon: CircleAlert },
              { label: language === 'vi' ? 'Inspection capacity' : 'Inspection capacity', value: activeSet.gmv[activeSet.gmv.length - 1]?.inspections ?? 0, target: 50, icon: Activity },
            ].map((item) => {
              const percent = Math.min(100, Math.round((item.value / item.target) * 100))
              return (
                <div key={item.label} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3 text-[#4c7b39]">
                        <item.icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Mức hiện tại / ngưỡng' : 'Current level / threshold'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{item.value}</p>
                      <p className="text-xs text-muted-foreground">/{item.target}</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#253218] via-[#7fa04d] to-[#aee86c]" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


