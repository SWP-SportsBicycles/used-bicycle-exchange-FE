'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Phone, Mail, MapPin, ShieldCheck, Truck, Search, Bike, ArrowRight,
  Lock, Scale, CheckCircle2, Star, Quote, Mountain, Zap, Users, Baby,
  CircleDollarSign, Package, ChevronRight, Facebook, Instagram, Youtube
} from 'lucide-react'
import { Header } from '@/components/header'
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
import { useAuth } from '@/lib/auth-context'
import { useFeaturedListings } from '@/modules/buyer/hooks/useListings'

/* ────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────── */

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
    title: 'Kiểm Định Chuyên Gia',
    subtitle: 'VeloSafe™',
    description: 'Mỗi xe được kiểm tra bởi đội ngũ chuyên gia với quy trình 50+ điểm kiểm tra, đảm bảo chất lượng và tình trạng thực tế.',
    delay: 0,
  },
  {
    icon: Lock,
    title: 'Thanh Toán Escrow',
    subtitle: 'An toàn tuyệt đối',
    description: 'Tiền của bạn được giữ an toàn trong tài khoản escrow cho đến khi bạn xác nhận hài lòng với xe đã nhận.',
    delay: 0.1,
  },
  {
    icon: Package,
    title: 'Vận Chuyển Theo Dõi',
    subtitle: 'Realtime tracking',
    description: 'Theo dõi đơn hàng realtime từ lúc đóng gói đến khi giao đến tận tay bạn, toàn quốc.',
    delay: 0.2,
  },
  {
    icon: Scale,
    title: 'Bảo Vệ Tranh Chấp',
    subtitle: 'Dispute protection',
    description: 'Đội ngũ hỗ trợ xử lý mọi tranh chấp công bằng, bảo vệ quyền lợi cả Người mua và Người bán.',
    delay: 0.3,
  },
]

const howItWorksSteps = [
  {
    step: 1,
    icon: Search,
    title: 'Tìm Xe Phù Hợp',
    description: 'Duyệt hàng trăm xe đã kiểm định. Lọc theo loại, thương hiệu, kích cỡ và ngân sách.',
  },
  {
    step: 2,
    icon: CircleDollarSign,
    title: 'Thanh Toán An Toàn',
    description: 'Đặt cọc hoặc thanh toán toàn bộ qua escrow. Tiền chỉ giải ngân khi bạn xác nhận nhận xe.',
  },
  {
    step: 3,
    icon: CheckCircle2,
    title: 'Nhận Xe Đã Kiểm Định',
    description: 'Xe được kiểm tra VeloSafe, đóng gói cẩn thận và vận chuyển đến tận tay bạn.',
  },
]

const testimonials = [
  {
    quote: 'Mua xe trên VeloTrust rất yên tâm. Xe đúng như mô tả, được kiểm định kỹ và giao hàng nhanh. Tiết kiệm được 15 triệu so với mua mới.',
    name: 'Trần Minh Tuấn',
    role: 'Người Mua',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh-tuan',
    rating: 5,
  },
  {
    quote: 'Đã bán 3 xe trên VeloTrust. Quy trình đơn giản, có hỗ trợ giá bán hợp lý và thanh toán rất nhanh sau khi hoàn tất.',
    name: 'Nguyễn Hương Ly',
    role: 'Người Bán',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=huong-ly',
    rating: 5,
  },
  {
    quote: 'Đội ngũ kiểm định rất chuyên nghiệp. Phát hiện 2 vấn đề mà mình không nhận ra, giúp thương lượng giá tốt hơn.',
    name: 'Lê Đức Anh',
    role: 'Người Mua',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc-anh',
    rating: 5,
  },
]

/* ────────────────────────────────────────────
   Animation variants
   ──────────────────────────────────────────── */
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

/* ────────────────────────────────────────────
   Page Component
   ──────────────────────────────────────────── */
export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [selectedCity, setSelectedCity] = useState<(typeof cityOptions)[number]['value']>('all')
  const [selectedBikeType, setSelectedBikeType] = useState<(typeof bikeTypeOptions)[number]['value']>('all')
  const sellerCtaHref =
    user.role === 'seller' ? '/seller/create' : '/auth/register?role=2&redirect=/seller/create'

  const { data: featuredPage } = useFeaturedListings()
  const featuredListings = featuredPage?.items ?? []

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

      {/* ═══════════════════════════════════════
          SECTION 1 — HERO (Premium Redesign)
          ═══════════════════════════════════════ */}
      <section id="hero" className="relative min-h-[92vh] overflow-hidden flex items-center">
        {/* ── Background ── */}
        <div className="absolute inset-0">
          <Image
            src="/hero-v2.png"
            alt="VeloTrust – Premium used bicycle marketplace"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-linear-to-r from-[#0d1a08]/95 via-[#0d1a08]/70 to-[#0d1a08]/30" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0d1a08]/80 via-transparent to-transparent" />
        {/* Subtle green radial glow */}
        <div className="absolute left-0 top-1/3 h-[500px] w-[500px] -translate-x-1/4 rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 lg:px-8 lg:py-0">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            {/* ── Eyebrow badge ── */}
            <motion.div variants={staggerItem} className="mb-8 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-lime-200">
                  Marketplace Xe Đạp Uy Tín #1 Việt Nam
                </span>
              </div>
            </motion.div>

            {/* ── Headline ── */}
            <motion.h1
              variants={staggerItem}
              className="max-w-4xl text-[2.8rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
              style={{ fontFamily: 'var(--font-archivo)' }}
            >
              Xe chuẩn kiểm,
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-linear-to-r from-[#aee86c] via-[#d9f59d] to-[#bff06e] bg-clip-text text-transparent">
                  chốt chuẩn tin
                </span>
                <span className="absolute -bottom-2 left-0 h-1.5 w-full rounded-full bg-linear-to-r from-primary/70 via-primary/35 to-transparent" />
              </span>
            </motion.h1>

            {/* ── Subheadline ── */}
            <motion.p
              variants={staggerItem}
              className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300/90 sm:text-xl"
            >
              Mỗi chiếc xe trải qua{' '}
              <strong className="font-semibold text-white">50+ điểm kiểm tra VeloSafe™</strong>.
              Tiền thanh toán được giữ trong{' '}
              <strong className="font-semibold text-white">escrow an toàn</strong>{' '}
              đến khi bạn nhận xe đúng ý và xác nhận hài lòng.
            </motion.p>

            {/* ── Search bar ── */}
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
                <span className="text-xs text-slate-400">Phổ biến:</span>
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

            {/* ── Dual CTA ── */}
            <motion.div variants={staggerItem} className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                id="hero-buy-cta"
                onClick={applyHeroSearch}
                size="lg"
                className="rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg hover:bg-[#90cb4f] hover:shadow-[0_0_24px_rgba(174,232,108,0.4)] transition-all duration-300"
              >
                Tìm xe ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                id="hero-sell-cta"
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-white/30 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transition-all duration-300"
              >
                <Link href={sellerCtaHref}>
                  Bán xe của bạn
                </Link>
              </Button>
            </motion.div>

            {/* ── Trust strip ── */}
            <motion.div
              variants={staggerItem}
              className="mt-12 grid max-w-3xl grid-cols-1 gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur-md sm:grid-cols-3"
            >
              {[
                { icon: ShieldCheck, label: 'Kiểm định 50+ điểm', sub: 'VeloSafe™' },
                { icon: Lock, label: 'Escrow an toàn', sub: 'Tiền giữ đến khi nhận xe' },
                { icon: Truck, label: 'Giao hàng toàn quốc', sub: 'Theo dõi realtime' },
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

        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent via-[#1a2810]/35 to-[#eff6e5]" />
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — CATEGORIES
          ═══════════════════════════════════════ */}
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
            Bắt Đúng Dòng Xe, Chốt Nhanh Nhu Cầu
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

      {/* ═══════════════════════════════════════
          SECTION 3 — WHY VELOTRUST (Trust)
          ═══════════════════════════════════════ */}
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
              Giao Dịch An Toàn, Minh Bạch
            </motion.h2>
            <motion.p variants={staggerItem} className="section-subtext">
              VeloTrust xây dựng quy trình giao dịch 4 lớp bảo vệ, đảm bảo quyền lợi cho cả Người mua và Người bán.
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

      {/* ═══════════════════════════════════════
          SECTION 4 — FEATURED LISTINGS
          ═══════════════════════════════════════ */}
      <section id="featured-listings" className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <motion.p variants={staggerItem} className="section-label">Gợi ý chốt nhanh</motion.p>
            <motion.h2 variants={staggerItem} className="section-heading mt-2">
              Những Chiếc Đáng Xuống Tiền Nhất Tuần Này
            </motion.h2>
            <motion.p variants={staggerItem} className="mt-2 max-w-lg text-muted-foreground">
              Chọn lọc từ các xe đã kiểm định VeloSafe với tín hiệu mạnh về độ mới, uy tín người bán và mức giá tham chiếu hấp dẫn.
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
                Xem tất cả xe đã kiểm định
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
            <p className="mt-1 text-sm text-muted-foreground">Thử quay lại sau hoặc vào Marketplace để xem tất cả tin đăng.</p>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 — SELLER CTA
          ═══════════════════════════════════════ */}
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
                Dành cho Người bán
              </motion.p>
              <motion.h2
                variants={staggerItem}
                className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
                style={{ fontFamily: 'var(--font-archivo)' }}
              >
                Bạn Có Xe Đạp <br className="hidden sm:block" />
                <span className="text-lime-200">Muốn Bán?</span>
              </motion.h2>
              <motion.p variants={staggerItem} className="mt-5 max-w-lg text-lg text-slate-300">
                Bán nhanh hơn với gợi ý giá thông minh, hỗ trợ kiểm định VeloSafe và giao dịch an toàn qua escrow.
              </motion.p>

              <motion.ul variants={staggerContainer} className="mt-8 space-y-3">
                {[
                  'Gợi ý giá bán dựa trên thị trường',
                  'Hỗ trợ kiểm định VeloSafe miễn phí',
                  'Bảo vệ Người bán với hệ thống tranh chấp',
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
                  <Link href={sellerCtaHref}>
                    Đăng Bán Ngay
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
                <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-primary/20 to-transparent blur-2xl" />
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
                      <p className="mt-1 text-xs text-lime-300">▲ Cao hơn 12% so với thị trường</p>
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

      {/* ═══════════════════════════════════════
          SECTION 6 — HOW IT WORKS
          ═══════════════════════════════════════ */}
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
            Mua Xe Chỉ Với 3 Bước
          </motion.h2>
          <motion.p variants={staggerItem} className="section-subtext">
            Quy trình mua xe trên VeloTrust được thiết kế đơn giản, minh bạch và an toàn nhất có thể.
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

      {/* ═══════════════════════════════════════
          SECTION 7 — SOCIAL PROOF
          ═══════════════════════════════════════ */}
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
              Được Tin Dùng Bởi Hàng Ngàn Cyclist
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
                <p className="mt-0.5 text-sm text-muted-foreground">từ 1,200+ đánh giá</p>
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

      {/* ═══════════════════════════════════════
          SECTION 8 — FOOTER
          ═══════════════════════════════════════ */}
      <footer id="footer" className="border-t border-border/70 bg-[#253218] text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-athletic">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary-foreground" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-white" style={{ fontFamily: 'var(--font-archivo)' }}>
                VeloTrust
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Nền tảng mua bán xe đạp thể thao đã qua sử dụng, minh bạch thông tin và hỗ trợ kiểm định VeloSafe.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-lime-200">
              <ShieldCheck className="h-4 w-4" />
              Cam kết xe rõ nguồn gốc - giao dịch an toàn
            </div>
            {/* Social icons */}
            <div className="mt-5 flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition-colors hover:bg-primary/30 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Truy cập nhanh</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              {[
                { href: '/marketplace', label: 'Marketplace' },
                { href: '#how-it-works', label: 'Cách hoạt động' },
                { href: '#why-velotrust', label: 'Tại sao VeloTrust' },
                { href: sellerCtaHref, label: 'Đăng bán xe' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-lime-200">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Chính sách</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-lime-200" /> Giao hàng toàn quốc</li>
              <li>Chính sách kiểm định VeloSafe</li>
              <li>Đổi trả và hoàn tiền</li>
              <li>Bảo mật dữ liệu</li>
              <li>Điều khoản sử dụng</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Liên hệ</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-lime-200 shrink-0" />
                Hotline: 028.9996.5775
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-lime-200 shrink-0" />
                support@velotrust.vn
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 text-lime-200 shrink-0" />
                <span className="leading-snug">7 Đ. D1, Long Thạnh Mỹ, Tăng Nhơn Phú, Hồ Chí Minh 700000, Việt Nam</span>
              </li>
            </ul>
            <div className="mt-5 h-[150px] w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <iframe
                src="https://www.google.com/maps?q=7+%C4%90.+D1,+Long+Th%E1%BA%A1nh+M%E1%BB%B9,+T%C3%A2ng+Nh%C6%A1n+Ph%C3%BA,+H%E1%BB%93+Ch%C3%AD+Minh+700000,+Vi%E1%BB%87t+Nam&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full opacity-80 grayscale mix-blend-luminosity brightness-110 contrast-125 transition-all duration-500 hover:opacity-100 hover:grayscale-0 hover:mix-blend-normal"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/70 py-5 text-center text-xs text-slate-400">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            Copyright {new Date().getFullYear()} VeloTrust. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
