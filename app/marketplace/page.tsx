'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Grid3X3, List, Sparkles, ShieldCheck, Search, Bike, MapPin, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FilterSidebar, MobileFilterSheet, type FilterState } from '@/components/filter-sidebar'
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
import { type Listing } from '@/lib/mock-data'
import { getMarketplaceListings } from '@/lib/services/listings-source'
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
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState<(typeof cityOptions)[number]['value']>('hcm')
  const [selectedBikeType, setSelectedBikeType] = useState<(typeof bikeTypeOptions)[number]['value']>('all')
  const [visibleCount, setVisibleCount] = useState(12)
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadListings() {
      setIsLoadingListings(true)
      const rows = await getMarketplaceListings()
      if (isMounted) {
        setListings(rows)
        setIsLoadingListings(false)
      }
    }

    loadListings()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const term = (searchParams.get('q') || '').trim()
    const city = searchParams.get('city')
    const bikeType = searchParams.get('type')
    const validCities = cityOptions.map((option) => option.value)
    const validBikeTypes = bikeTypeOptions.map((option) => option.value)
    const normalizedCity = validCities.includes(city as (typeof cityOptions)[number]['value'])
      ? (city as (typeof cityOptions)[number]['value'])
      : 'all'
    const normalizedBikeType = validBikeTypes.includes(bikeType as (typeof bikeTypeOptions)[number]['value'])
      ? (bikeType as (typeof bikeTypeOptions)[number]['value'])
      : 'all'

    setSearchInput(term)
    setAppliedSearch(term)
    setSelectedCity(normalizedCity)
    setSelectedBikeType(normalizedBikeType)
    setFilters(prev => ({
      ...prev,
      cities: normalizedCity === 'all' ? [] : [normalizedCity],
      categories: normalizedBikeType === 'all' ? [] : [normalizedBikeType],
    }))
  }, [searchParams])

  const applyHeroSearch = () => {
    const term = searchInput.trim()
    setAppliedSearch(term)
    setFilters(prev => ({
      ...prev,
      cities: selectedCity === 'all' ? [] : [selectedCity],
      categories: selectedBikeType === 'all' ? [] : [selectedBikeType],
    }))
    setVisibleCount(12)

    const params = new URLSearchParams()
    if (term) params.set('q', term)
    if (selectedCity !== 'all') params.set('city', selectedCity)
    if (selectedBikeType !== 'all') params.set('type', selectedBikeType)
    const query = params.toString()
    router.replace(query ? `/marketplace?${query}` : '/marketplace')
  }

  // Reset pagination when filters, sort or search change
  useEffect(() => {
    setVisibleCount(12)
  }, [filters, sortBy, appliedSearch])

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = listings.filter(listing => {
      // VeloSafe filter
      if (filters.veloSafeOnly && !listing.isVeloSafeVerified) return false

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(listing.category)) return false

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(listing.brand)) return false

      // Frame size filter
      if (filters.frameSizes.length > 0 && !filters.frameSizes.includes(listing.frameSize)) return false

      // Groupset filter
      if (filters.groupsets.length > 0 && !filters.groupsets.includes(listing.groupset)) return false

      // Condition filter
      if (filters.conditions.length > 0 && !filters.conditions.includes(listing.condition)) return false

      // City filter
      if (filters.cities.length > 0 && !filters.cities.includes(listing.city)) return false

      // Price range filter
      if (listing.price < filters.priceRange[0] || listing.price > filters.priceRange[1]) return false

      if (appliedSearch) {
        const term = appliedSearch.toLowerCase()
        const match =
          listing.title.toLowerCase().includes(term) ||
          listing.brand.toLowerCase().includes(term) ||
          listing.model.toLowerCase().includes(term) ||
          listing.description.toLowerCase().includes(term)
        if (!match) return false
      }

      return true
    })

    // Sort
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
        result.sort((a, b) => b.seller.rating - a.seller.rating)
        break
    }

    return result
  }, [listings, filters, sortBy, appliedSearch])

  const veloSafeCount = listings.filter(l => l.isVeloSafeVerified).length

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
        <div className="absolute inset-0 bg-gradient-to-r from-[#1d2a14]/70 via-[#1d2a14]/45 to-[#1d2a14]/65" />
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
              Marketplace xe đạp uy tín hàng đầu Việt Nam
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance" style={{ fontFamily: 'var(--font-archivo)' }}>
              Tìm xe đạp thể thao
              <br />
              <span className="text-lime-200">đã qua sử dụng</span> chất lượng
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
                    placeholder="Tìm theo tên xe, thương hiệu, model..."
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
                  <Link href="/seller/create">Đăng bán</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Headings */}
      <section className="border-b border-border/60 bg-gradient-to-b from-background to-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="mt-2 text-2xl font-bold text-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-archivo)' }}>
                Danh mục sản phẩm
              </p>
            </div>
            <Button variant="outline" size="sm" className="hidden md:inline-flex">
              Xem toàn bộ danh mục
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categorySections.map((section) => (
              <article
                key={section.title}
                className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-athletic"
              >
                <div className="relative aspect-[16/10] w-full bg-slate-100">
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

      <section id="results-overview" className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(250,252,246,0.95),rgba(244,248,239,0.95))]">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="premium-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="eyebrow-chip">Curated catalog</div>
                  <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-foreground">Browse with more signal, less clutter</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    This demo catalog is framed like a real managed marketplace: trust filters, consistent card quality,
                    and a cleaner handoff from search to decision.
                  </p>
                </div>
                <Badge className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">
                  {isLoadingListings ? 'Loading...' : `${filteredListings.length} results now`}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {[
                { icon: ShieldCheck, label: 'Verified', value: `${veloSafeCount} bikes`, sub: 'Inspection-ready supply' },
                { icon: Search, label: 'Search state', value: appliedSearch ? `Query: ${appliedSearch}` : 'Open browse mode', sub: 'Supports deliberate discovery' },
                { icon: Bike, label: 'Catalog mode', value: selectedBikeType === 'all' ? 'All bike types' : selectedBikeType, sub: selectedCity === 'all' ? 'Nationwide scope' : `Focused on ${selectedCity}` },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="premium-subpanel p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    {label}
                  </div>
                  <div className="mt-3 text-base font-bold tracking-[-0.02em] text-foreground">{value}</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">{sub}</div>
                </div>
              ))}
            </div>
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
                  Hiển thị <span className="font-semibold text-foreground">{filteredListings.length}</span> trong <span className="font-medium">{listings.filter(l => l.status === 'published').length}</span> xe
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* VeloSafe Toggle */}
                <button
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      veloSafeOnly: !prev.veloSafeOnly,
                    }))
                  }}
                  className={cn(
                    'hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                    filters.veloSafeOnly
                      ? 'border-[#407F3E] bg-[#407F3E]/10 text-[#407F3E]'
                      : 'border-border bg-card text-muted-foreground hover:border-[#407F3E]/50'
                  )}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  VeloSafe ({veloSafeCount})
                </button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-card">
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

            {/* Active Filter Chips */}
            {(() => {
              const chips: { key: string; label: string; filterKey: string; value: string }[] = []
              const labelMap: Record<string, string> = {
                categories: 'Loại', brands: 'Hãng', frameSizes: 'Size',
                groupsets: 'Groupset', conditions: 'Tình trạng', cities: 'TP',
              }
              const conditionLabels: Record<string, string> = {
                like_new: 'Like New', excellent: 'Excellent', good: 'Good', fair: 'Fair',
              }
              const cityLabels: Record<string, string> = {
                hanoi: 'Hà Nội', hcm: 'TP.HCM', danang: 'Đà Nẵng',
              }
              ;(['categories', 'brands', 'frameSizes', 'groupsets', 'conditions', 'cities'] as const).forEach((fk) => {
                (filters[fk] as string[]).forEach((v) => {
                  let display = v
                  if (fk === 'conditions') display = conditionLabels[v] ?? v
                  if (fk === 'cities') display = cityLabels[v] ?? v
                  chips.push({ key: `${fk}-${v}`, label: `${labelMap[fk]}: ${display}`, filterKey: fk, value: v })
                })
              })
              if (filters.veloSafeOnly) chips.push({ key: 'velo', label: 'VeloSafe Only', filterKey: 'veloSafeOnly', value: 'true' })
              if (chips.length === 0) return null
              return (
                <div className="flex flex-wrap gap-2 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip.key}
                      onClick={() => {
                        if (chip.filterKey === 'veloSafeOnly') {
                          setFilters(prev => ({ ...prev, veloSafeOnly: false }))
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            [chip.filterKey]: (prev[chip.filterKey as keyof FilterState] as string[]).filter(v => v !== chip.value),
                          }))
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
                    >
                      {chip.label}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                  <button
                    onClick={() => setFilters(initialFilters)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )
            })()}

            {/* Listings */}
            {filteredListings.length > 0 ? (
              <>
                <div className={cn(
                  "grid gap-4",
                  viewMode === 'grid' 
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
                    : "grid-cols-1"
                )}>
                  {filteredListings.slice(0, visibleCount).map((listing, index) => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      index={index}
                    />
                  ))}
                </div>
                
                {visibleCount < filteredListings.length && (
                  <div className="mt-8 flex justify-center">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="min-w-[200px]"
                      onClick={() => setVisibleCount(prev => prev + 12)}
                    >
                      Xem thêm xe
                    </Button>
                  </div>
                )}
              </>
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
                  Hãy điều chỉnh bộ lọc để tìm được chiếc xe phù hợp hơn với nhu cầu của bạn.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setFilters(initialFilters)}
                >
                  Xóa toàn bộ bộ lọc
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
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



