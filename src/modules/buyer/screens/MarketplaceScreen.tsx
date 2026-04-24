'use client'

import { Suspense, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Grid3X3, List, ShieldCheck, Search } from 'lucide-react'
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
void categorySections

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
  const [selectedCity] = useState<(typeof cityOptions)[number]['value']>(initialCity)
  const [selectedBikeType] = useState<(typeof bikeTypeOptions)[number]['value']>(initialBikeType)

  const activeCity = filters.cities[0] || (selectedCity !== 'all' ? selectedCity : undefined)
  const activeCategory =
    filters.categories[0] || (selectedBikeType !== 'all' ? selectedBikeType : undefined)

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

      {/* Premium Page Header */}
      <section className="border-b border-border/40 bg-card/50 pt-8 pb-6">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <Breadcrumb items={[{ label: 'Marketplace' }]} />
          
          <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ fontFamily: 'var(--font-archivo)' }}>
                SBE Marketplace
              </h1>
              <p className="mt-2 text-muted-foreground max-w-2xl text-sm sm:text-base">
                Khám phá bộ sưu tập xe đạp thể thao cao cấp đã qua sử dụng. Mọi giao dịch đều được bảo vệ bởi <span className="font-semibold text-primary">VeloSafe™</span> và công nghệ thanh toán an toàn.
              </p>
            </div>
            
            {/* Quick Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm xe đạp (vd: Trek Madone)..."
                className="h-11 w-full rounded-full border border-border/60 bg-background/50 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:bg-background focus:ring-1 focus:ring-primary/50"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyHeroSearch()
                }}
              />
            </div>
          </div>
          
          {/* Quick Filter Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilters(p => ({ ...p, veloSafeOnly: !p.veloSafeOnly }))}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.veloSafeOnly 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border/60 bg-background hover:border-primary/50"
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              VeloSafe Certified
            </button>
            {['Road', 'MTB', 'Gravel', 'Urban'].map(type => (
              <button
                key={type}
                onClick={() => {
                  const val = type.toLowerCase()
                  setFilters(p => ({
                    ...p,
                    categories: p.categories.includes(val) ? [] : [val]
                  }))
                }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                  filters.categories.includes(type.toLowerCase())
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/60 bg-background hover:border-foreground/30 text-muted-foreground"
                )}
              >
                {type}
              </button>
            ))}
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
            <div className="sticky top-20 z-30 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/85 px-4 py-3 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-background/60">
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
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[180px] rounded-lg bg-background/50 text-sm font-medium border-border/60">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
                    <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
                    <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                  </SelectContent>
                </Select>

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
