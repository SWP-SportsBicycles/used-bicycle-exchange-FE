'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles, ShieldCheck, Search, Bike, ArrowRight, Truck, MapPin,
  Lock, Scale, CheckCircle2, Star, Quote, Mountain, Zap, Users, Baby,
  CircleDollarSign, Package, ChevronRight
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_LISTINGS } from '@/lib/mock-data'

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Constants
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const cityOptions = [
  { value: 'all', label: 'Toàn quốc' },
  { value: 'hanoi', label: 'Hà Nội' },
  { value: 'hcm', label: 'TP Hồ Chí Minh' },
  { value: 'danang', label: 'Đà Nẵng' },
] as const

const bikeTypeOptions = [
  { value: 'all', label: 'Tất cả xe đạp' },
  { value: 'road', label: 'Xe đạp đua' },
  { value: 'mtb', label: 'Xe đạp địa hình' },
  { value: 'gravel', label: 'Xe đạp gravel' },
  { value: 'urban', label: 'Xe đạp touring' },
] as const

const categories = [
  { value: 'road', label: 'Road Bike', icon: Bike, count: 67 },
  { value: 'mtb', label: 'Mountain Bike', icon: Mountain, count: 45 },
  { value: 'gravel', label: 'Gravel', icon: Truck, count: 32 },
  { value: 'ebike', label: 'E-Bike', icon: Zap, count: 18 },
  { value: 'urban', label: 'City / Touring', icon: Users, count: 28 },
  { value: 'kids', label: 'Kids', icon: Baby, count: 15 },
]

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: 'Kiểm định chuyên gia',
    subtitle: 'VeloSafeâ„¢',
    description: 'Mỗi xe được kiểm tra bởi đội ngũ chuyên gia với quy trình 50+ điểm, giúp người mua nhìn rõ chất lượng và tình trạng thực tế.',
    delay: 0,
  },
  {
    icon: Lock,
    title: 'Thanh toán escrow',
    subtitle: 'An toàn tuyệt đối',
    description: 'Khoản thanh toán được giữ an toàn trong escrow cho đến khi bạn nhận xe đúng mô tả và xác nhận hài lòng.',
    delay: 0.1,
  },
  {
    icon: Package,
    title: 'Vận chuyển theo dõi',
    subtitle: 'Realtime tracking',
    description: 'Theo dõi đơn hàng từ lúc đóng gói đến khi giao tận tay, với tiến trình rõ ràng trên toàn quốc.',
    delay: 0.2,
  },
  {
    icon: Scale,
    title: 'Bảo vệ tranh chấp',
    subtitle: 'Dispute protection',
    description: 'Đội ngũ hỗ trợ xử lý tranh chấp công bằng, bảo vệ quyền lợi của cả người mua lẫn người bán.',
    delay: 0.3,
  },
]

const howItWorksSteps = [
  {
    step: 1,
    icon: Search,
    title: 'Tìm xe phù hợp',
    description: 'Duyệt các xe đã kiểm định, lọc theo dòng xe, thương hiệu, kích cỡ và ngân sách.',
  },
  {
    step: 2,
    icon: CircleDollarSign,
    title: 'Thanh toán an toàn',
    description: 'Đặt cọc hoặc thanh toán qua escrow. Tiền chỉ được giải ngân khi bạn xác nhận đã nhận xe đúng cam kết.',
  },
  {
    step: 3,
    icon: CheckCircle2,
    title: 'Nhận xe đã kiểm định',
    description: 'Xe được kiểm tra theo chuẩn VeloSafe, đóng gói cẩn thận và giao đến tận tay bạn.',
  },
]

const testimonials = [
  {
    quote: 'Mua xe trên VeloTrust rất yên tâm. Xe đúng mô tả, kiểm định kỹ và giao nhanh. Mình tiết kiệm được gần 15 triệu so với mua mới.',
    name: 'Trần Minh Tuấn',
    role: 'Người mua',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh-tuan',
    rating: 5,
  },
  {
    quote: 'Mình đã bán 3 xe trên VeloTrust. Quy trình gọn, được hỗ trợ định giá hợp lý và thanh toán rất nhanh sau khi hoàn tất.',
    name: 'Nguyễn Hương Ly',
    role: 'Người bán',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=huong-ly',
    rating: 5,
  },
  {
    quote: 'Đội kiểm định rất chuyên nghiệp. Họ phát hiện 2 vấn đề mình không nhận ra, giúp mình thương lượng giá tốt hơn.',
    name: 'Lê Đức Anh',
    role: 'Người mua',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc-anh',
    rating: 5,
  },
]

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Animation variants
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: 'easeOut' as const },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Page Component
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function HomePage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [selectedCity, setSelectedCity] = useState<(typeof cityOptions)[number]['value']>('all')
  const [selectedBikeType, setSelectedBikeType] = useState<(typeof bikeTypeOptions)[number]['value']>('all')

  const featuredListings = useMemo(() => {
    const conditionScore = {
      like_new: 4,
      excellent: 3,
      good: 2,
      fair: 1,
    } as const

    return [...MOCK_LISTINGS]
      .filter((listing) => listing.isVeloSafeVerified)
      .sort((a, b) => {
        const aScore = conditionScore[a.condition] * 100 + a.seller.rating * 10 + a.seller.totalSales
        const bScore = conditionScore[b.condition] * 100 + b.seller.rating * 10 + b.seller.totalSales
        return bScore - aScore
      })
      .slice(0, 8)
  }, [])

  const applyHeroSearch = () => {
    const params = new URLSearchParams()
    const term = searchInput.trim()
    if (term) params.set('q', term)
    if (selectedCity !== 'all') params.set('city', selectedCity)
    if (selectedBikeType !== 'all') params.set('type', selectedBikeType)
    const query = params.toString()
    router.push(query ? `/marketplace?${query}` : '/marketplace')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 1 â€” HERO (Premium Redesign)
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="hero" className="relative flex min-h-[92vh] items-center overflow-hidden pt-16 sm:pt-20">
        {/* â”€â”€ Background â”€â”€ */}
        <div className="absolute inset-0">
          <Image
            src="/hero-v2.png"
            alt="VeloTrust â€“ Premium used bicycle marketplace"
            fill
            className="object-cover object-[56%_20%]"
            priority
          />
        </div>
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1a08]/95 via-[#0d1a08]/70 to-[#0d1a08]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a08]/80 via-transparent to-transparent" />
        {/* Subtle green radial glow */}
        <div className="absolute left-0 top-1/3 h-[500px] w-[500px] -translate-x-1/4 rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 lg:px-8 lg:py-0">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            {/* â”€â”€ Eyebrow badge â”€â”€ */}
            <motion.div variants={staggerItem} className="mb-8 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-lime-200">
                  Marketplace xe đạp uy tín hàng đầu Việt Nam
                </span>
              </div>
            </motion.div>

            {/* â”€â”€ Headline â”€â”€ */}
            <motion.h1
              variants={staggerItem}
              className="max-w-4xl text-[2.8rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
              style={{ fontFamily: 'var(--font-archivo)' }}
            >
              Xe chuẩn kiểm,
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#aee86c] via-[#d9f59d] to-[#bff06e] bg-clip-text text-transparent">
                  chốt chuẩn tin
                </span>
                <span className="absolute -bottom-2 left-0 h-1.5 w-full rounded-full bg-gradient-to-r from-primary/70 via-primary/35 to-transparent" />
              </span>
            </motion.h1>

            {/* â”€â”€ Subheadline â”€â”€ */}
            <motion.p
              variants={staggerItem}
              className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300/90 sm:text-xl"
            >
              Mỗi chiếc xe trải qua{' '}
              <strong className="font-semibold text-white">50+ điểm kiểm tra VeloSafe™</strong>.
              Tiền thanh toán được giữ trong{' '}
              <strong className="font-semibold text-white">escrow an toàn</strong>{' '}
              cho đến khi bạn nhận xe đúng kỳ vọng và xác nhận hài lòng.
            </motion.p>

            {/* â”€â”€ Live activity signal â”€â”€ */}
            <motion.div variants={staggerItem} className="mt-5 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="live-dot" />
                <span className="text-sm font-medium text-emerald-200">12 xe vừa chốt hôm nay</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-slate-400">
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                156 xe đang hiển thị
              </span>
            </motion.div>

            {/* â”€â”€ Search bar â”€â”€ */}
            <motion.div
              variants={staggerItem}
              className="mt-10 w-full max-w-2xl"
            >
              {/* Main search input row */}
              <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white p-2 shadow-2xl">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#407F3E]" />
                  <input
                    id="hero-search-input"
                    type="text"
                    placeholder="Tên xe, thương hiệu, model..."
                    className="h-12 w-full rounded-xl bg-transparent pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-slate-400"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') applyHeroSearch() }}
                  />
                </div>
                <div className="h-6 w-px bg-border/60" />
                <Select value={selectedCity} onValueChange={(v) => setSelectedCity(v as typeof selectedCity)}>
                  <SelectTrigger className="h-12 w-[130px] border-0 bg-transparent font-medium text-foreground shadow-none">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#407F3E] shrink-0" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="h-6 w-px bg-border/60" />
                <Select value={selectedBikeType} onValueChange={(v) => setSelectedBikeType(v as typeof selectedBikeType)}>
                  <SelectTrigger className="h-12 w-[140px] border-0 bg-transparent font-medium text-foreground shadow-none">
                    <div className="flex items-center gap-1.5">
                      <Bike className="h-3.5 w-3.5 text-[#407F3E] shrink-0" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {bikeTypeOptions.map((bt) => (
                      <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  id="hero-search-btn"
                  onClick={applyHeroSearch}
                  className="h-12 shrink-0 rounded-xl bg-[#407F3E] px-6 text-sm font-bold text-white hover:bg-[#345f30]"
                >
                  <Search className="mr-1.5 h-4 w-4" />
                  Tìm xe
                </Button>
              </div>

              {/* Popular searches */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">Tìm nhanh:</span>
                {['Giant TCR', 'Trek Domane', 'Specialized', 'Gravel', 'E-Bike'].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setSearchInput(q); applyHeroSearch() }}
                    className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-lime-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* â”€â”€ Dual CTA â”€â”€ */}
            <motion.div variants={staggerItem} className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                id="hero-buy-cta"
                onClick={applyHeroSearch}
                size="lg"
                className="rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg hover:bg-[#90cb4f] hover:shadow-[0_0_24px_rgba(174,232,108,0.4)] transition-all duration-300"
              >
                Khám phá ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                id="hero-sell-cta"
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-white/30 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transition-all duration-300"
              >
                <Link href="/seller/create">
                  Đăng bán xe
                </Link>
              </Button>
            </motion.div>

            {/* â”€â”€ Trust strip â”€â”€ */}
            <motion.div
              variants={staggerItem}
              className="mt-12 grid max-w-3xl grid-cols-1 gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur-md sm:grid-cols-3"
            >
              {[
                { icon: ShieldCheck, label: 'Kiểm định 50+ điểm', sub: 'VeloSafe™' },
                { icon: Lock, label: 'Escrow an toàn', sub: 'Giữ tiền đến khi nhận xe' },
                { icon: Truck, label: 'Giao hàng toàn quốc', sub: 'Theo dõi minh bạch' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-white/6 p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 backdrop-blur-sm">
                      <Icon className="h-4.5 w-4.5 text-[#aee86c]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs text-slate-300">{sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent via-transparent to-[#eff6e5]/80" />
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 2 â€” CATEGORIES
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="market-pulse" className="relative z-10 -mt-10 pb-4">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
          {[
            { icon: ShieldCheck, label: 'Verified inventory', value: '78% of listings inspection-ready', sub: 'Curated supply for higher buyer trust' },
            { icon: Lock, label: 'Managed checkout', value: 'Reserve -> inspect -> settle', sub: 'One guided flow instead of fragmented DM deals' },
            { icon: Package, label: 'Live marketplace pulse', value: '156 active bikes this week', sub: 'Strong enough catalog to feel alive in demo' },
            { icon: Star, label: 'Top-rated sellers', value: '4.8 average seller score', sub: 'Social proof shown before money moves' },
          ].map(({ icon: Icon, label, value, sub }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35 }}
              className="premium-panel p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="metric-label">{label}</div>
                  <div className="mt-2 text-lg font-bold tracking-[-0.02em] text-foreground">{value}</div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">{sub}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <section id="categories" className="relative overflow-hidden bg-[linear-gradient(180deg,#eff6e5_0%,#f8fbf3_38%,#ffffff_100%)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(174,232,108,0.22),transparent_68%)]" />
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-18">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.p variants={staggerItem} className="section-label">Chọn đúng gu, đi đúng nhu</motion.p>
          <motion.h2 variants={staggerItem} className="section-heading mt-3">
            Bắt đúng dòng xe, chốt nhanh nhu cầu
          </motion.h2>
          <motion.p variants={staggerItem} className="section-subtext">
            Từ road bứt tốc đến touring đường dài, mọi lựa chọn đều được sắp rõ để bạn tìm nhanh chiếc xe hợp gu và hợp hành trình.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer}
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {categories.map((cat) => (
            <motion.div key={cat.value} variants={staggerItem}>
              <Link href={`/marketplace?type=${cat.value}`}>
                <div className="category-card" id={`category-${cat.value}`}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-[#407F3E] transition-colors group-hover:bg-primary/20">
                    <cat.icon className="h-7.5 w-7.5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{cat.label}</h3>
                  <p className="text-center text-xs text-muted-foreground">
                    {cat.value === 'road' && 'Tối ưu tốc độ và hiệu suất'}
                    {cat.value === 'mtb' && 'Leo dốc, xuống trail tự tin'}
                    {cat.value === 'gravel' && 'Linh hoạt từ phố đến đường dài'}
                    {cat.value === 'ebike' && 'Nhẹ sức hơn, đi xa hơn'}
                    {cat.value === 'urban' && 'Đi phố êm, đi tour gọn'}
                    {cat.value === 'kids' && 'An toàn và vừa tầm trẻ nhỏ'}
                  </p>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {cat.count} xe
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 3 â€” WHY VELOTRUST (Trust)
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="why-velotrust" className="border-y border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p variants={staggerItem} className="section-label">Tại sao chọn VeloTrust</motion.p>
            <motion.h2 variants={staggerItem} className="section-heading mt-3">
              Giao dịch an toàn, minh bạch
            </motion.h2>
            <motion.p variants={staggerItem} className="section-subtext">
              VeloTrust xây dựng quy trình giao dịch 4 lớp bảo vệ, đảm bảo quyền lợi cho cả người mua và người bán.
            </motion.p>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={feature.delay}
                variants={fadeUp}
                className="trust-card group"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-[#407F3E] transition-transform duration-500 group-hover:animate-float">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{feature.subtitle}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 4.5 â€” CARBON STATS BAND
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="carbon-section py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { number: '156+', label: 'Xe đang hiển thị', accent: true },
              { number: '12', label: 'Thương hiệu nổi bật', accent: false },
              { number: '8.5tr - 120tr', label: 'Khoảng giá (₫)', accent: false },
              { number: '3', label: 'Thành phố phủ sóng', accent: true },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className={`text-2xl font-extrabold sm:text-3xl ${stat.accent ? 'text-primary' : 'text-white'}`}
                  style={{ fontFamily: 'var(--font-archivo)' }}
                >
                  {stat.number}
                </p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 5 â€” FEATURED LISTINGS
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="featured-listings" className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <motion.p variants={staggerItem} className="section-label">Gợi ý đáng xem</motion.p>
            <motion.h2 variants={staggerItem} className="section-heading mt-2">
              Những chiếc đáng xuống tiền nhất tuần này
            </motion.h2>
            <motion.p variants={staggerItem} className="mt-2 max-w-lg text-muted-foreground">
              Chọn lọc từ các xe đã qua kiểm định VeloSafe, có tín hiệu tốt về độ mới, độ uy tín của seller và mức giá tham chiếu hấp dẫn.
            </motion.p>
            <motion.div variants={staggerItem} className="mt-4 flex flex-wrap gap-2">
              {[
                'Đã kiểm định VeloSafe',
                'Ưu tiên seller uy tín',
                'So sánh với giá tham chiếu',
              ].map((signal) => (
                <Badge
                  key={signal}
                  variant="secondary"
                  className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-[#407F3E]"
                >
                  {signal}
                </Badge>
              ))}
            </motion.div>
          </div>
          <motion.div variants={staggerItem}>
            <Button variant="outline" asChild className="gap-1.5 rounded-xl">
              <Link href="/marketplace">
                Xem toàn bộ xe đã kiểm định
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featuredListings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h3 className="text-lg font-semibold text-foreground">Chưa có xe đã kiểm định</h3>
            <p className="mt-1 text-sm text-muted-foreground">Hãy quay lại sau hoặc vào Marketplace để xem toàn bộ tin đăng.</p>
          </div>
        )}
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 5 â€” SELLER CTA
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="seller-cta" className="seller-cta-gradient relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 [background:radial-gradient(circle_at_100%_50%,rgba(174,232,108,0.5),transparent_70%)]" />
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerContainer}
            >
              <motion.p variants={staggerItem} className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
                Dành cho người bán
              </motion.p>
              <motion.h2
                variants={staggerItem}
                className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
                style={{ fontFamily: 'var(--font-archivo)' }}
              >
                Bạn có xe đạp <br className="hidden sm:block" />
                <span className="text-lime-200">muốn bán?</span>
              </motion.h2>
              <motion.p variants={staggerItem} className="mt-5 max-w-lg text-lg text-slate-300">
                Bán nhanh hơn với gợi ý giá thông minh, kiểm định VeloSafe và giao dịch an toàn qua escrow.
              </motion.p>

              <motion.ul variants={staggerContainer} className="mt-8 space-y-3">
                {[
                  'Gợi ý giá bán bám sát thị trường',
                  'Hỗ trợ kiểm định VeloSafe miễn phí',
                  'Bảo vệ người bán với quy trình tranh chấp rõ ràng',
                ].map((benefit) => (
                  <motion.li key={benefit} variants={staggerItem} className="flex items-center gap-3 text-slate-200">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-400/20">
                      <CheckCircle2 className="h-4 w-4 text-lime-300" />
                    </div>
                    {benefit}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={staggerItem} className="mt-10">
                <Button
                  id="seller-cta-btn"
                  asChild
                  size="lg"
                  className="rounded-xl bg-primary px-10 text-base font-bold text-primary-foreground hover:bg-[#90cb4f] animate-pulse-glow"
                >
                  <Link href="/seller/create">
                    Đăng bán ngay
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right side visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-lime-400" />
                      <span className="text-sm font-medium text-lime-200">Listing đang hoạt động</span>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-xs text-slate-400">Giá bán gợi ý</p>
                      <p className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-archivo)' }}>
                        45.000.000 ₫
                      </p>
                      <p className="mt-1 text-xs text-lime-300">Tốt hơn 12% so với mặt bằng thị trường</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 rounded-lg bg-white/10 p-3 text-center">
                        <p className="text-xl font-bold text-white">24h</p>
                        <p className="text-xs text-slate-400">Thời gian trung bình</p>
                      </div>
                      <div className="flex-1 rounded-lg bg-white/10 p-3 text-center">
                        <p className="text-xl font-bold text-white">98%</p>
                        <p className="text-xs text-slate-400">Tỷ lệ bán thành công</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 6 â€” HOW IT WORKS
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="text-center"
        >
            <motion.p variants={staggerItem} className="section-label">Quy trình đơn giản</motion.p>
            <motion.h2 variants={staggerItem} className="section-heading mt-3">
              Mua xe chỉ với 3 bước
            </motion.h2>
            <motion.p variants={staggerItem} className="section-subtext">
              Quy trình mua xe trên VeloTrust được thiết kế đơn giản, minh bạch và đủ cảm giác an tâm khi demo.
            </motion.p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-0">
          {howItWorksSteps.map((step, idx) => (
            <motion.div
              key={step.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              custom={idx * 0.15}
              variants={fadeUp}
              className="relative text-center"
            >
              {/* Connector line */}
              {idx < howItWorksSteps.length - 1 && <div className="step-connector" />}

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-[#407F3E]">
                <step.icon className="h-8 w-8" />
              </div>
              <div className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {step.step}
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 7 â€” SOCIAL PROOF
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="social-proof" className="border-y border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p variants={staggerItem} className="section-label">Khách hàng tin tưởng</motion.p>
            <motion.h2 variants={staggerItem} className="section-heading mt-3">
              Được tin dùng bởi hàng ngàn cyclist
            </motion.h2>

            {/* Overall rating */}
            <motion.div variants={staggerItem} className="mx-auto mt-6 flex items-center justify-center gap-3">
              <span className="text-5xl font-extrabold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>4.8</span>
              <div className="text-left">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < 5 ? 'fill-primary text-primary' : 'text-border'}`} />
                  ))}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">từ 1.200+ đánh giá</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={staggerItem} className="testimonial-card">
                <Quote className="mb-3 h-8 w-8 text-primary/30" />
                <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border/50 pt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full bg-secondary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4"
          >
            {[
              { number: '1,200+', label: 'Người dùng tin tưởng' },
              { number: '500+', label: 'Giao dịch thành công' },
              { number: '98%', label: 'Hài lòng' },
              { number: '2.5 tỷ+', label: 'Giá trị giao dịch (VNĐ)' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={staggerItem} className="text-center">
                <p className="stat-number">{stat.number}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 8 â€” FOOTER
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Footer />
    </div>
  )
}



