'use client'

import { Suspense, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Grid3X3, List, Sparkles, Phone, Mail, MapPin, ShieldCheck, Truck, Search, Bike } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { FilterSidebar, MobileFilterSheet, type FilterState } from '@/modules/buyer/components/ListingFilters'
import { ListingCard } from '@/modules/buyer/components/ListingCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMarketplaceListings } from '@/modules/marketplace/hooks/useMarketplaceListings'
import { cn } from '@/lib/utils'

const initialFilters: FilterState = {
  categories: [],
  brands: [],
  frameSizes: [],
  groupsets: [],
  conditions: [],
  cities: [],
  priceRange: [0, 100000000],
  veloSafeOnly: false,
}

const categorySections = [
  {
    title: 'Xe đạp thể thao',
    image: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=1200&q=80',
  },
  {
    title: 'Xe đạp địa hình',
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=1200&q=80',
  },
  {
    title: 'Xe đạp đua',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200&q=80',
  },
  {
    title: 'Xe đạp touring',
    image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=1200&q=80',
  },
]

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

function MarketplacePageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCity, setSelectedCity] = useState<(typeof cityOptions)[number]['value']>('all')
  const [selectedBikeType, setSelectedBikeType] = useState<(typeof bikeTypeOptions)[number]['value']>('all')
  const sellerCtaHref =
    user.role === 'seller' ? '/seller/create' : '/auth/register?role=2&redirect=/seller/create'

  const { data: listingPage } = useMarketplaceListings({
    keyword: appliedSearch || undefined,
    city: selectedCity !== 'all' ? selectedCity : undefined,
    category: selectedBikeType !== 'all' ? selectedBikeType : undefined,
    brand: filters.brands[0] || undefined,
    condition: filters.conditions[0] || undefined,
    frameSize: filters.frameSizes[0] || undefined,
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 100000000 ? filters.priceRange[1] : undefined,
    pageNumber: currentPage,
    pageSize: 12,
  })
  const applyHeroSearch = () => {
    const term = searchInput.trim()
    setAppliedSearch(term)
    setCurrentPage(1)
    setFilters(prev => ({
      ...prev,
      cities: selectedCity === 'all' ? [] : [selectedCity],
      categories: selectedBikeType === 'all' ? [] : [selectedBikeType],
    }))

    const params = new URLSearchParams()
    if (term) params.set('q', term)
    if (selectedCity !== 'all') params.set('city', selectedCity)
    if (selectedBikeType !== 'all') params.set('type', selectedBikeType)
    const query = params.toString()
    router.replace(query ? `/marketplace?${query}` : '/marketplace')
  }

  // Client-side sort (server đã filter — chỉ sort local batch hiện tại)
  const filteredListings = useMemo(() => {
    let result = listingPage?.items ?? []
    if (filters.veloSafeOnly) {
      result = result.filter(l => l.isVeloSafeVerified)
    }
    result = [...result]
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'rating':
        result.sort((a, b) => (b.seller?.rating ?? 0) - (a.seller?.rating ?? 0))
        break
    }
    return result
  }, [listingPage?.items, filters.veloSafeOnly, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-bike-art.png')",
          }}
        />
        <div className="absolute left-0 top-0 h-full w-[22%] bg-[#aee86c]/95 [clip-path:polygon(0_0,100%_0,56%_100%,0_100%)]" />
        <div className="absolute inset-0 bg-linear-to-r from-[#1d2a14]/70 via-[#1d2a14]/45 to-[#1d2a14]/65" />
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_42%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.25),transparent_38%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-5 gap-1.5 px-4 py-1.5 text-sm font-medium bg-white/20 text-white border-white/30">
              <Sparkles className="h-3.5 w-3.5 text-lime-100" />
              Marketplace Xe Đạp Uy Tín #1 Việt Nam
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance" style={{ fontFamily: 'var(--font-archivo)' }}>
              Tìm Xe Đạp Thể Thao
              <br />
              <span className="text-lime-200">Đã Qua Sử Dụng</span> Chất Lượng
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-100/95 text-pretty">
              Mua bán xe đạp thể thao đã qua sử dụng tại Hà Nội, TP.HCM và Đà Nẵng. 
              Mỗi xe đều có thể được kiểm định bởi đội ngũ VeloSafe chuyên nghiệp.
            </p>

            {/* Hero Search Bar */}
            <div className="mx-auto mt-10 w-full max-w-6xl rounded-3xl border border-white/75 bg-white p-3 shadow-2xl">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <input
                    type="text"
                    placeholder="Tìm xe đạp theo tên, thương hiệu..."
                    className="h-14 w-full rounded-xl border border-transparent bg-slate-50 pl-11 pr-4 text-base text-foreground outline-none transition-colors focus:border-primary/40 focus:bg-white"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') applyHeroSearch()
                    }}
                  />
                </div>

                <Select value={selectedCity} onValueChange={(value) => setSelectedCity(value as typeof selectedCity)}>
                  <SelectTrigger className="h-14 rounded-xl border-primary/25 bg-slate-50 text-[#253218] font-semibold">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedBikeType} onValueChange={(value) => setSelectedBikeType(value as typeof selectedBikeType)}>
                  <SelectTrigger className="h-14 rounded-xl border-primary/25 bg-slate-50 text-[#253218] font-semibold">
                    <div className="flex items-center gap-2">
                      <Bike className="h-4 w-4 text-primary" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {bikeTypeOptions.map((bikeType) => (
                      <SelectItem key={bikeType.value} value={bikeType.value}>
                        {bikeType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={applyHeroSearch}
                  className="h-14 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-[#90cb4f]"
                >
                  Tìm xe
                </Button>

                <Button asChild className="h-14 rounded-xl bg-[#407F3E] px-8 text-base font-semibold text-white hover:bg-[#346734]">
                  <Link href={sellerCtaHref}>Bán ngay</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Headings */}
      <section className="border-b border-border/60 bg-linear-to-b from-background to-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="mt-2 text-2xl font-bold text-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-archivo)' }}>
                Danh mục sản phẩm
              </p>
            </div>
            <Button variant="outline" size="sm" className="hidden md:inline-flex">
              Xem tất cả danh mục
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categorySections.map((section) => (
              <article
                key={section.title}
                className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-athletic"
              >
                <div className="relative aspect-16/10 w-full bg-slate-100">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <h3 className="px-3 py-2 text-center text-base font-bold text-foreground">{section.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <FilterSidebar 
            filters={filters} 
            onFilterChange={setFilters}
          />

          {/* Listings Grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <MobileFilterSheet 
                  filters={filters} 
                  onFilterChange={setFilters}
                />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{listingPage?.totalCount ?? filteredListings.length}</span> xe được tìm thấy
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-45 bg-card">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
                    <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
                    <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden sm:flex items-center border border-border/60 rounded-lg p-1 bg-card shadow-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Listings */}
            {filteredListings.length > 0 ? (
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' 
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {filteredListings.map((listing, index) => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Không tìm thấy xe phù hợp
                </h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Thử điều chỉnh bộ lọc để tìm được xe đạp phù hợp với nhu cầu của bạn.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setFilters(initialFilters)}
                >
                  Xóa tất cả bộ lọc
                </Button>
              </motion.div>
            )}

            {/* Pagination */}
            {listingPage && listingPage.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                >
                  ← Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: listingPage.totalPages }, (_, i) => i + 1)
                    .filter(p => Math.abs(p - currentPage) <= 2)
                    .map(p => (
                      <Button
                        key={p}
                        variant={p === currentPage ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      >
                        {p}
                      </Button>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= listingPage.totalPages}
                  onClick={() => { setCurrentPage(p => Math.min(listingPage.totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                >
                  Tiếp →
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-6 border-t border-border/70 bg-[#253218] text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-3 lg:px-6">
          <div>
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-archivo)' }}>
              VeloTrust
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Nền tảng mua bán xe đạp thể thao đã qua sử dụng, minh bạch thông tin và hỗ trợ kiểm định VeloSafe.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-lime-200">
              <ShieldCheck className="h-4 w-4" />
              Cam kết xe rõ nguồn gốc - giao dịch an toàn
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Thông tin chính sách</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-lime-200" /> Chính sách giao hàng toàn quốc</li>
              <li>Chính sách kiểm định VeloSafe</li>
              <li>Chính sách đổi trả và hoàn tiền</li>
              <li>Chính sách bảo mật dữ liệu</li>
              <li>Điều khoản sử dụng nền tảng</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Liên hệ</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-lime-200" />
                Hotline: 028.9996.5775
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-lime-200" />
                Email: support@velotrust.vn
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-lime-200" />
                330 Hùng Vương, Châu Đức, BR-VT
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700/70 py-4 text-center text-xs text-slate-400">
          Copyright {new Date().getFullYear()} VeloTrust. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background" aria-hidden>
          <div className="mx-auto h-16 max-w-7xl animate-pulse border-b bg-muted/30" />
          <div className="mx-auto mt-8 max-w-7xl px-4">
            <div className="h-48 rounded-xl bg-muted/40" />
          </div>
        </div>
      }
    >
      <MarketplacePageContent />
    </Suspense>
  )
}
