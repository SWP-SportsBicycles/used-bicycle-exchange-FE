'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, BadgeCheck, Bike, ChevronRight, ClipboardCheck, Crown, MapPin, Search, ShieldAlert, ShieldCheck, UserCog, Users, Wallet } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/lib/language-context'
import { formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type ManagedRole = 'buyer' | 'seller' | 'inspector' | 'admin'
type VerificationState = 'verified' | 'partial'
type HealthState = 'healthy' | 'watchlist' | 'restricted'

type ManagedUser = {
  id: string
  name: string
  email: string
  role: ManagedRole
  city: 'hanoi' | 'hcm' | 'danang'
  avatar: string
  verification: VerificationState
  health: HealthState
  trustScore: number
  joinedAt: string
  lastActive: string
  metrics: { listings: number; orders: number; inspections: number; disputes: number; revenue: number }
  flags: string[]
  note: string
}

const CITY_LABELS = { hanoi: 'Hà Nội', hcm: 'TP.HCM', danang: 'Đà Nẵng' } as const

const ROLE_META = {
  buyer: { vi: 'Người mua', en: 'Buyer', icon: Users, className: 'bg-sky-500/10 text-sky-700 border-sky-500/20' },
  seller: { vi: 'Người bán', en: 'Seller', icon: Bike, className: 'bg-primary/15 text-[#3e6f2f] border-primary/30' },
  inspector: { vi: 'Kiểm định viên', en: 'Inspector', icon: ClipboardCheck, className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  admin: { vi: 'Quản trị', en: 'Admin', icon: Crown, className: 'bg-violet-500/10 text-violet-700 border-violet-500/20' },
} as const

const HEALTH_META = {
  healthy: { vi: 'Ổn định', en: 'Healthy', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  watchlist: { vi: 'Cần theo dõi', en: 'Watchlist', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  restricted: { vi: 'Rủi ro cao', en: 'Restricted', className: 'bg-destructive/10 text-destructive border-destructive/20' },
} as const

const VERIFY_META = {
  verified: { vi: 'Đã xác minh', en: 'Verified', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  partial: { vi: 'Thiếu hồ sơ', en: 'Partial', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
} as const

const MANAGED_USERS: ManagedUser[] = [
  {
    id: 'seller-s1',
    name: 'Minh Đức',
    email: 'minh.duc@velotrust-demo.vn',
    role: 'seller',
    city: 'hanoi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh-duc',
    verification: 'verified',
    health: 'healthy',
    trustScore: 94,
    joinedAt: '2024-01-05',
    lastActive: '2026-04-17T09:20:00',
    metrics: { listings: 4, orders: 12, inspections: 4, disputes: 1, revenue: 430000000 },
    flags: ['Seller rating 4.8', 'Có 1 dispute đã đóng'],
    note: 'Seller chủ lực nhóm road bike, hiệu suất đều và tín hiệu giao dịch tốt.',
  },
  {
    id: 'seller-s2',
    name: 'Hồng Anh',
    email: 'hong.anh@velotrust-demo.vn',
    role: 'seller',
    city: 'hcm',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hong-anh',
    verification: 'verified',
    health: 'watchlist',
    trustScore: 72,
    joinedAt: '2024-01-03',
    lastActive: '2026-04-16T18:05:00',
    metrics: { listings: 2, orders: 5, inspections: 2, disputes: 1, revenue: 114000000 },
    flags: ['Case condition mismatch', 'Cần siết chất lượng mô tả'],
    note: 'Có năng lực bán nhưng cần kiểm soát mô tả listing và hậu mãi.',
  },
  {
    id: 'seller-s5',
    name: 'Thu Hương',
    email: 'thu.huong@velotrust-demo.vn',
    role: 'seller',
    city: 'hcm',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thu-huong',
    verification: 'verified',
    health: 'healthy',
    trustScore: 95,
    joinedAt: '2023-12-21',
    lastActive: '2026-04-17T11:40:00',
    metrics: { listings: 3, orders: 15, inspections: 3, disputes: 0, revenue: 580000000 },
    flags: ['Top gravel seller', 'Tỷ lệ hoàn tất cao'],
    note: 'Seller chủ lực khu vực TP.HCM, phù hợp ưu tiên tăng supply premium.',
  },
  {
    id: 'buyer-b1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@email.com',
    role: 'buyer',
    city: 'hcm',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer-an',
    verification: 'verified',
    health: 'healthy',
    trustScore: 89,
    joinedAt: '2024-01-12',
    lastActive: '2026-04-17T10:25:00',
    metrics: { listings: 0, orders: 2, inspections: 1, disputes: 0, revenue: 45000000 },
    flags: ['Repeat buyer', 'Escrow tốt'],
    note: 'Buyer hành vi tốt, phù hợp nhóm chăm sóc lại.',
  },
  {
    id: 'buyer-b6',
    name: 'Hoàng Văn Bình',
    email: 'binh.hoang@email.com',
    role: 'buyer',
    city: 'hcm',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer-binh',
    verification: 'verified',
    health: 'watchlist',
    trustScore: 63,
    joinedAt: '2024-01-10',
    lastActive: '2026-04-14T14:40:00',
    metrics: { listings: 0, orders: 2, inspections: 1, disputes: 1, revenue: 38000000 },
    flags: ['Dispute mở', 'Case condition mismatch'],
    note: 'Tài khoản cần theo dõi chặt các claim tiếp theo.',
  },
  {
    id: 'buyer-b7',
    name: 'Đỗ Minh Khoa',
    email: 'khoa.do@email.com',
    role: 'buyer',
    city: 'danang',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer-khoa',
    verification: 'partial',
    health: 'restricted',
    trustScore: 48,
    joinedAt: '2024-01-11',
    lastActive: '2026-04-13T12:10:00',
    metrics: { listings: 0, orders: 1, inspections: 0, disputes: 1, revenue: 45000000 },
    flags: ['Dispute not-as-described', 'KYC chưa đủ'],
    note: 'Nên siết KYC trước khi cho phép giao dịch giá trị cao.',
  },
  {
    id: 'inspector-i1',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@velotrust.vn',
    role: 'inspector',
    city: 'hanoi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inspector-nam',
    verification: 'verified',
    health: 'healthy',
    trustScore: 93,
    joinedAt: '2023-10-02',
    lastActive: '2026-04-17T07:55:00',
    metrics: { listings: 0, orders: 0, inspections: 47, disputes: 0, revenue: 0 },
    flags: ['Lead inspector', 'SLA hoàn tất tốt'],
    note: 'Inspector lead, giữ chuẩn checklist và hỗ trợ case khó.',
  },
  {
    id: 'admin-a1',
    name: 'Admin VeloTrust',
    email: 'admin@velotrust.vn',
    role: 'admin',
    city: 'hcm',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin-main',
    verification: 'verified',
    health: 'healthy',
    trustScore: 99,
    joinedAt: '2023-09-01',
    lastActive: '2026-04-17T11:58:00',
    metrics: { listings: 0, orders: 0, inspections: 0, disputes: 14, revenue: 0 },
    flags: ['Full access', 'Risk & moderation lead'],
    note: 'Admin chính cho moderation, dispute resolution và policy escalation.',
  },
]

function formatCompactDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

function formatLastActive(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export default function AdminUsersPage() {
  const { language } = useLanguage()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | ManagedRole>('all')
  const [healthFilter, setHealthFilter] = useState<'all' | HealthState>('all')
  const [activeTab, setActiveTab] = useState<'all' | 'watchlist' | 'priority'>('all')
  const [selectedUserId, setSelectedUserId] = useState<string>(MANAGED_USERS[0].id)

  const filteredUsers = useMemo(() => {
    return MANAGED_USERS.filter((user) => {
      const query = search.trim().toLowerCase()
      const matchesQuery = !query || `${user.name} ${user.email} ${CITY_LABELS[user.city]}`.toLowerCase().includes(query)
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesHealth = healthFilter === 'all' || user.health === healthFilter
      const matchesTab = activeTab === 'all' || (activeTab === 'watchlist' && user.health !== 'healthy') || (activeTab === 'priority' && user.trustScore >= 90)
      return matchesQuery && matchesRole && matchesHealth && matchesTab
    }).sort((a, b) => b.trustScore - a.trustScore)
  }, [activeTab, healthFilter, roleFilter, search])

  const selectedUser = filteredUsers.find((user) => user.id === selectedUserId) ?? MANAGED_USERS.find((user) => user.id === selectedUserId) ?? MANAGED_USERS[0]
  const totalUsers = MANAGED_USERS.length
  const verifiedUsers = MANAGED_USERS.filter((user) => user.verification === 'verified').length
  const watchlistUsers = MANAGED_USERS.filter((user) => user.health !== 'healthy').length
  const roleSummary = (Object.keys(ROLE_META) as ManagedRole[]).map((role) => {
    const count = MANAGED_USERS.filter((user) => user.role === role).length
    const percentage = Math.round((count / totalUsers) * 100)
    return { role, count, percentage }
  })

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/60 bg-[linear-gradient(135deg,#18250f_0%,#223215_48%,#f6fbef_48.1%,#ffffff_100%)] shadow-athletic-lg">
        <CardContent className="grid gap-6 p-0 lg:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-5 px-6 py-6 text-white lg:px-8 lg:py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-lime-200">
              <UserCog className="h-3.5 w-3.5" />
              {language === 'vi' ? 'Quản trị tài khoản' : 'User operations'}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-archivo)' }}>
                {language === 'vi' ? 'Quản Lý Người Dùng' : 'User Management'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                {language === 'vi'
                  ? 'Theo dõi sức khỏe tài khoản, KYC, nhóm rủi ro và các nhân tố đang tạo doanh thu cho marketplace.'
                  : 'Track account health, KYC quality, risky users, and revenue-driving operators.'}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{language === 'vi' ? 'Tài khoản' : 'Accounts'}</p>
                <p className="mt-2 text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{totalUsers}</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">KYC</p>
                <p className="mt-2 text-3xl font-extrabold text-lime-200" style={{ fontFamily: 'var(--font-archivo)' }}>{verifiedUsers}</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{language === 'vi' ? 'Theo dõi' : 'Watchlist'}</p>
                <p className="mt-2 text-3xl font-extrabold text-amber-300" style={{ fontFamily: 'var(--font-archivo)' }}>{watchlistUsers}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 px-6 py-6 lg:px-8 lg:py-8">
            <div className="rounded-3xl border border-[#dfe8d2] bg-white/90 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7fa04d]">
                    {language === 'vi' ? 'Vai trò vận hành' : 'Ops composition'}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-foreground">
                    {language === 'vi' ? 'Bản đồ người dùng' : 'User map'}
                  </h2>
                </div>
                <div className="rounded-2xl bg-primary/15 p-3 text-[#3e6f2f]">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {roleSummary.map(({ role, count, percentage }) => {
                  const meta = ROLE_META[role]
                  return (
                    <div key={role}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{meta[language]}</span>
                        <span className="text-muted-foreground">{count} / {percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2.5 bg-secondary" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: language === 'vi' ? 'Tổng tài khoản' : 'Total accounts', value: totalUsers, note: 'Buyer, seller, inspector, admin', icon: Users },
          { title: language === 'vi' ? 'KYC hoàn chỉnh' : 'Verified KYC', value: `${Math.round((verifiedUsers / totalUsers) * 100)}%`, note: language === 'vi' ? 'Tăng độ an toàn giao dịch' : 'Improves safety', icon: ShieldCheck },
          { title: language === 'vi' ? 'Tài khoản watchlist' : 'Watchlist users', value: watchlistUsers, note: language === 'vi' ? 'Case tranh chấp hoặc hồ sơ thiếu' : 'Disputes or incomplete profiles', icon: ShieldAlert },
          { title: language === 'vi' ? 'Top seller GMV' : 'Top seller GMV', value: formatVND(Math.max(...MANAGED_USERS.map((user) => user.metrics.revenue))), note: language === 'vi' ? 'Nguồn cung chủ lực' : 'Supply driver', icon: Wallet },
        ].map((item, index) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}>
            <Card className="h-full border-border/60 shadow-athletic transition-all duration-300 hover:-translate-y-0.5 hover:shadow-athletic-lg">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>{item.value}</p>
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

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <Card className="border-border/60">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <CardTitle className="text-xl">{language === 'vi' ? 'Danh Sách Người Dùng' : 'User Directory'}</CardTitle>
                <CardDescription>
                  {language === 'vi' ? 'Lọc tài khoản chủ lực, tài khoản cần theo dõi và nhóm còn thiếu hồ sơ.' : 'Filter priority, risky, and incomplete accounts.'}
                </CardDescription>
              </div>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                <TabsList>
                  <TabsTrigger value="all">{language === 'vi' ? 'Tất cả' : 'All'}</TabsTrigger>
                  <TabsTrigger value="watchlist">{language === 'vi' ? 'Watchlist' : 'Watchlist'}</TabsTrigger>
                  <TabsTrigger value="priority">{language === 'vi' ? 'Ưu tiên' : 'Priority'}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={language === 'vi' ? 'Tìm theo tên, email, thành phố...' : 'Search name, email, city...'} className="pl-9" />
              </div>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}>
                <SelectTrigger><SelectValue placeholder={language === 'vi' ? 'Vai trò' : 'Role'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'vi' ? 'Tất cả vai trò' : 'All roles'}</SelectItem>
                  {(Object.keys(ROLE_META) as ManagedRole[]).map((role) => (
                    <SelectItem key={role} value={role}>{ROLE_META[role][language]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={healthFilter} onValueChange={(value) => setHealthFilter(value as typeof healthFilter)}>
                <SelectTrigger><SelectValue placeholder={language === 'vi' ? 'Sức khỏe' : 'Health'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'vi' ? 'Tất cả trạng thái' : 'All states'}</SelectItem>
                  {(Object.keys(HEALTH_META) as HealthState[]).map((state) => (
                    <SelectItem key={state} value={state}>{HEALTH_META[state][language]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'vi' ? 'Tài khoản' : 'Account'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Vai trò' : 'Role'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Khu vực' : 'City'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Tín hiệu vận hành' : 'Signals'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Tuân thủ' : 'Compliance'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Trust' : 'Trust'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleMeta = ROLE_META[user.role]
                  const verifyMeta = VERIFY_META[user.verification]
                  const healthMeta = HEALTH_META[user.health]
                  return (
                    <TableRow key={user.id} className={cn('cursor-pointer', selectedUser.id === user.id && 'bg-primary/5')} onClick={() => setSelectedUserId(user.id)}>
                      <TableCell className="min-w-[230px]">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-11 w-11 border border-border/60">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('gap-1 border', roleMeta.className)}>
                          <roleMeta.icon className="h-3.5 w-3.5" />
                          {roleMeta[language]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {CITY_LABELS[user.city]}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[210px]">
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>
                            {user.role === 'seller' && `${user.metrics.listings} listing / ${user.metrics.orders} đơn`}
                            {user.role === 'buyer' && `${user.metrics.orders} đơn / ${user.metrics.disputes} dispute`}
                            {user.role === 'inspector' && `${user.metrics.inspections} phiên kiểm định`}
                            {user.role === 'admin' && `${user.metrics.disputes} dispute handled`}
                          </p>
                          {user.metrics.revenue > 0 && <p className="font-medium text-foreground">{formatVND(user.metrics.revenue)}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge variant="outline" className={cn('border', verifyMeta.className)}>{verifyMeta[language]}</Badge>
                          <Badge variant="outline" className={cn('border', healthMeta.className)}>{healthMeta[language]}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[140px]">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{user.trustScore}/100</span>
                            {user.trustScore >= 90 && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
                          </div>
                          <Progress value={user.trustScore} className="h-2" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit border-border/60 xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle className="text-xl">{language === 'vi' ? 'Hồ Sơ Vận Hành' : 'Operational Profile'}</CardTitle>
            <CardDescription>{language === 'vi' ? 'Compliance, hiệu suất và cờ tín hiệu của tài khoản đang chọn.' : 'Compliance, performance, and signal flags.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border border-border/60">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{selectedUser.name}</h3>
                    <Badge variant="outline" className={cn('border', ROLE_META[selectedUser.role].className)}>
                      {ROLE_META[selectedUser.role][language]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedUser.email}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {CITY_LABELS[selectedUser.city]} • {language === 'vi' ? 'Tham gia' : 'Joined'} {formatCompactDate(selectedUser.joinedAt)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{selectedUser.note}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{language === 'vi' ? 'Trust score' : 'Trust score'}</p>
                <p className="mt-2 text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{selectedUser.trustScore}</p>
                <Progress value={selectedUser.trustScore} className="mt-3 h-2.5" />
              </div>
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{language === 'vi' ? 'Hoạt động gần nhất' : 'Last active'}</p>
                <p className="mt-2 text-lg font-bold">{formatLastActive(selectedUser.lastActive)}</p>
                <p className="mt-2 text-xs text-muted-foreground">{selectedUser.metrics.disputes} dispute • {selectedUser.metrics.inspections} inspection</p>
              </div>
            </div>

            {selectedUser.metrics.revenue > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-muted-foreground">{language === 'vi' ? 'Giá trị tạo ra' : 'Revenue contribution'}</p>
                <p className="mt-2 text-3xl font-extrabold text-[#3e6f2f]" style={{ fontFamily: 'var(--font-archivo)' }}>
                  {formatVND(selectedUser.metrics.revenue)}
                </p>
              </div>
            )}

            <div className="space-y-3 rounded-2xl border border-border/60 p-4">
              <p className="text-sm font-semibold text-foreground">{language === 'vi' ? 'Cờ tín hiệu' : 'Signal flags'}</p>
              <div className="space-y-2">
                {selectedUser.flags.map((flag) => (
                  <div key={flag} className="flex items-start gap-2 rounded-xl bg-muted/35 px-3 py-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{flag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1">{language === 'vi' ? 'Mở hồ sơ' : 'Open profile'}</Button>
              <Button variant="outline" className="flex-1">{language === 'vi' ? 'Đưa vào theo dõi' : 'Add watch'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
