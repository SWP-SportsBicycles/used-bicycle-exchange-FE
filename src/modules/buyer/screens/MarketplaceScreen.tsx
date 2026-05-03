'use client'

import { Suspense, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid3X3, List, Search, Zap, ArrowRight, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Breadcrumb } from '@/modules/buyer/components/Breadcrumb'
import { FilterSidebar, MobileFilterSheet, type FilterState } from '@/modules/buyer/components/ListingFilters'
import { ListingCard } from '@/modules/buyer/components/ListingCard'
import { ListingCardSkeleton } from '@/modules/buyer/components/skeletons/ListingCardSkeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMarketplaceListings } from '@/modules/marketplace/hooks/useMarketplaceListings'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BRANDS, FRAME_SIZES, CONDITIONS, CITIES, CATEGORIES } from '@/lib/mock-data'
import { formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const initialFilters: FilterState = {
  categories: [],
  brands: [],
  frameSizes: [],
  conditions: [],
  cities: [],
  priceRange: [0, 100000000],
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
void categorySections

// Quick-filter pill definitions with SVG icons
const QUICK_FILTERS = [
  {
    key: 'road',
    label: 'Road',
    sublabel: 'Xe đua',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 8v4l3 3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'mtb',
    label: 'MTB',
    sublabel: 'Địa hình',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M3 17l4-8 5 5 3-5 4 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17h20" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'gravel',
    label: 'Gravel',
    sublabel: 'Đa địa hình',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <circle cx="5" cy="17" r="3" />
        <circle cx="19" cy="17" r="3" />
        <path d="M5 17h14M12 6l4 11M12 6L8 17" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'urban',
    label: 'Urban',
    sublabel: 'Đô thị',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <rect x="3" y="11" width="18" height="8" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
        <circle cx="8.5" cy="17" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="17" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

// Lookup tables to derive human-readable chip labels from FilterState values
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c.label])
)
const CONDITION_LABELS: Record<string, string> = Object.fromEntries(
  CONDITIONS.map(c => [c.value, c.label])
)
const CITY_LABELS: Record<string, string> = Object.fromEntries(
  CITIES.map(c => [c.value, c.label])
)

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

interface MarketplacePageContentProps {
  initialQuery: string
  initialCity: (typeof cityOptions)[number]['value']
  initialBikeType: (typeof bikeTypeOptions)[number]['value']
}

function MarketplacePageContent({
  initialQuery,
  initialCity,
  initialBikeType,
}: MarketplacePageContentProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...initialFilters,
    cities: initialCity === 'all' ? [] : [initialCity],
    categories: initialBikeType === 'all' ? [] : [initialBikeType],
  }))
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [appliedSearch, setAppliedSearch] = useState(initialQuery)
  const [currentPage, setCurrentPage] = useState(1)

  const activeCity = filters.cities[0] || (initialCity !== 'all' ? initialCity : undefined)
  const activeCategory =
    filters.categories[0] || (initialBikeType !== 'all' ? initialBikeType : undefined)

  const { data: listingPage, isLoading } = useMarketplaceListings({
    keyword: appliedSearch || undefined,
    city: activeCity,
    category: activeCategory,
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
      cities: initialCity === 'all' ? [] : [initialCity],
      categories: initialBikeType === 'all' ? [] : [initialBikeType],
    }))

    const params = new URLSearchParams()
    if (term) params.set('q', term)
    if (initialCity !== 'all') params.set('city', initialCity)
    if (initialBikeType !== 'all') params.set('type', initialBikeType)
    const query = params.toString()
    router.replace(query ? `/marketplace?${query}` : '/marketplace')
  }

  // Client-side sort (server đã filter — chỉ sort local batch hiện tại)
  const filteredListings = useMemo(() => {
    const result = [...(listingPage?.items ?? [])]
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
    }
    return result
  }, [listingPage?.items, sortBy])

  // Real-time stats for trust panel
  const uniqueBrandCount = useMemo(() => {
    const brands = new Set((listingPage?.items ?? []).map(l => l.brand).filter(Boolean))
    // Merge with known BRANDS catalog for a floor value
    return Math.max(brands.size, BRANDS.length)
  }, [listingPage?.items])

  // Derive active filter chips from current filter state
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = []
    filters.categories.forEach(v =>
      chips.push({ id: `cat-${v}`, label: CATEGORY_LABELS[v] ?? v, onRemove: () => setFilters(p => ({ ...p, categories: [] })) })
    )
    filters.brands.forEach(v =>
      chips.push({ id: `brand-${v}`, label: v, onRemove: () => setFilters(p => ({ ...p, brands: [] })) })
    )
    filters.conditions.forEach(v =>
      chips.push({ id: `cond-${v}`, label: CONDITION_LABELS[v] ?? v, onRemove: () => setFilters(p => ({ ...p, conditions: [] })) })
    )
    filters.cities.forEach(v =>
      chips.push({ id: `city-${v}`, label: CITY_LABELS[v] ?? v, onRemove: () => setFilters(p => ({ ...p, cities: [] })) })
    )
    filters.frameSizes.forEach(v =>
      chips.push({ id: `frame-${v}`, label: `Size ${v}`, onRemove: () => setFilters(p => ({ ...p, frameSizes: [] })) })
    )
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100_000_000) {
      chips.push({
        id: 'price',
        label: `${formatVND(filters.priceRange[0])} – ${formatVND(filters.priceRange[1])}`,
        onRemove: () => setFilters(p => ({ ...p, priceRange: [0, 100_000_000] })),
      })
    }
    return chips
  }, [filters])

  const clearAllFilters = () => {
    setFilters(initialFilters)
    setCurrentPage(1)
  }




  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
      <section className="relative overflow-hidden border-b border-border/30 pt-6 pb-5">
        {/* Layered gradient background */}
        <div className="pointer-events-none absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/[0.07] via-background to-background" />
          {/* Radial glow top-left */}
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
          <Breadcrumb items={[{ label: 'Marketplace' }]} />

          {/* Title + Right panel — 2-col layout */}
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-stretch md:justify-between md:gap-0">

            {/* ── Left: Title + Category pills ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-between md:pr-10 lg:pr-14"
            >
              {/* Top: badge + h1 + subtitle */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Zap className="h-3 w-3" />
                    Bảo vệ bởi SBESafe™
                  </span>
                </div>
                <h1
                  className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: 'var(--font-archivo)' }}
                >
                  SBE{' '}
                  <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    Marketplace
                  </span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground max-w-lg">
                  Xe đạp thể thao đã qua sử dụng — kiểm định chặt chẽ, thanh toán an toàn.
                </p>
              </div>

              {/* Bottom: category pills */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mt-5 flex flex-wrap gap-2.5"
              >
                {QUICK_FILTERS.map((pill, i) => {
                  const isActive = filters.categories.includes(pill.key)
                  return (
                    <motion.button
                      key={pill.key}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.18 + i * 0.05 }}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const next = isActive ? [] : [pill.key]
                        setFilters(p => ({ ...p, categories: next }))
                        setCurrentPage(1)
                        const params = new URLSearchParams()
                        if (appliedSearch) params.set('q', appliedSearch)
                        if (!isActive) params.set('type', pill.key)
                        const query = params.toString()
                        router.replace(query ? `/marketplace?${query}` : '/marketplace')
                      }}
                      className={cn(
                        'flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm',
                        isActive
                          ? 'border-primary/60 bg-primary text-primary-foreground shadow-primary/20 shadow-md'
                          : 'border-border/50 bg-background/80 text-foreground hover:border-primary/30 hover:bg-primary/5 hover:shadow-md'
                      )}
                    >
                      <span className={cn('transition-colors', isActive ? 'text-primary-foreground' : 'text-primary')}>
                        {pill.icon}
                      </span>
                      <span className="flex flex-col items-start leading-none">
                        <span className="text-sm font-bold">{pill.label}</span>
                        <span className={cn('text-[10px] font-normal mt-0.5', isActive ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                          {pill.sublabel}
                        </span>
                      </span>
                    </motion.button>
                  )
                })}

                <AnimatePresence>
                  {filters.categories.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.18 }}
                      onClick={() => {
                        setFilters(p => ({ ...p, categories: [] }))
                        setCurrentPage(1)
                        const params = new URLSearchParams()
                        if (appliedSearch) params.set('q', appliedSearch)
                        router.replace(params.toString() ? `/marketplace?${params}` : '/marketplace')
                      }}
                      className="flex items-center gap-1.5 rounded-2xl border border-dashed border-border/60 bg-background/60 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-all"
                    >
                      <span className="text-base leading-none">×</span>
                      Bỏ lọc
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* ── Vertical separator ── */}
            <div className="hidden md:block w-px bg-border/40 shrink-0 self-stretch" />

            {/* ── Right panel: Search + Trust stats ── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="w-full md:w-[480px] shrink-0 flex flex-col gap-3 md:pl-10 lg:pl-14"
            >
              {/* Search bar */}
              <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  id="marketplace-search"
                  placeholder="Trek Madone, Giant TCR, Specialized..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyHeroSearch() }}
                />
                <button
                  onClick={applyHeroSearch}
                  className="flex items-center gap-1 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                >
                  Tìm <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Platform stats card */}
              <div className="rounded-2xl border border-border/50 bg-background/70 backdrop-blur-sm px-5 py-4 shadow-sm">
                <div className="grid grid-cols-3 divide-x divide-border/50">
                  {[
                    { value: listingPage ? `${listingPage.totalCount}` : '...', label: 'Xe đang bán', icon: '🚲' },
                    { value: listingPage ? `${uniqueBrandCount}` : '...', label: 'Thương hiệu', icon: '🏷️' },
                    { value: '100%', label: 'Giao dịch an toàn', icon: '🔒' },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center px-3 first:pl-0 last:pr-0 text-center">
                      <span className="text-base mb-0.5">{stat.icon}</span>
                      <span className="text-lg font-black text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
                        {stat.value}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="flex gap-6 mt-4">
          {/* Desktop Sidebar */}
          <FilterSidebar 
            filters={filters} 
            onFilterChange={setFilters}
          />

          {/* Listings Grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="sticky top-20 z-30 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/85 px-4 py-3 backdrop-blur-xl shadow-sm supports-backdrop-filter:bg-background/60">
              <div className="flex items-center gap-3">
                <MobileFilterSheet 
                  filters={filters} 
                  onFilterChange={setFilters}
                />
                <p className="text-sm font-medium text-muted-foreground">
                  Hiển thị <span className="text-foreground font-bold">{listingPage?.totalCount ?? filteredListings.length}</span> xe
                </p>
              </div>

              <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-0.5">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[200px] rounded-lg bg-background/50 text-sm font-medium border-border/60">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price_asc">Giá thấp → cao*</SelectItem>
                    <SelectItem value="price_desc">Giá cao → thấp*</SelectItem>
                  </SelectContent>
                </Select>
                {(sortBy === 'price_asc' || sortBy === 'price_desc') && (
                  <p className="text-[10px] text-muted-foreground/60">* Sắp xếp trong trang hiện tại</p>
                )}
              </div>

                <div className="hidden sm:flex items-center rounded-lg border border-border/60 bg-background/50 p-0.5 shadow-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Active filter chips bar ── */}
            <AnimatePresence>
              {activeChips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-medium text-muted-foreground shrink-0">Đang lọc:</span>
                    {activeChips.map(chip => (
                      <motion.span
                        key={chip.id}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {chip.label}
                        <button
                          onClick={chip.onRemove}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                          aria-label={`Xóa lọc ${chip.label}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                    {activeChips.length > 1 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline transition-colors"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Listings */}
            {isLoading ? (
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' 
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
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

      <Footer />
    </div>
  )
}

function MarketplacePageRoute() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? searchParams.get('keyword') ?? ''
  const cityParam = searchParams.get('city')
  const typeParam = searchParams.get('type') ?? searchParams.get('category')

  const initialCity = cityOptions.some((option) => option.value === cityParam)
    ? (cityParam as (typeof cityOptions)[number]['value'])
    : 'all'
  const initialBikeType = bikeTypeOptions.some((option) => option.value === typeParam)
    ? (typeParam as (typeof bikeTypeOptions)[number]['value'])
    : 'all'

  return (
    <MarketplacePageContent
      key={searchParams.toString()}
      initialQuery={initialQuery}
      initialCity={initialCity}
      initialBikeType={initialBikeType}
    />
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
      <MarketplacePageRoute />
    </Suspense>
  )
}
