'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Grid3X3, List, TrendingUp, Sparkles } from 'lucide-react'
import { Header } from '@/components/header'
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
import { MOCK_LISTINGS, type Listing } from '@/lib/mock-data'
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

export default function MarketplacePage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = MOCK_LISTINGS.filter(listing => {
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
  }, [filters, sortBy])

  const veloSafeCount = MOCK_LISTINGS.filter(l => l.isVeloSafeVerified).length

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 lg:py-20 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-5 gap-1.5 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Marketplace Xe Đạp Uy Tín #1 Việt Nam
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance" style={{ fontFamily: 'var(--font-archivo)' }}>
              Tìm Xe Đạp Thể Thao
              <br />
              <span className="text-primary">Đã Qua Sử Dụng</span> Chất Lượng
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
              Mua bán xe đạp thể thao đã qua sử dụng tại Hà Nội, TP.HCM và Đà Nẵng. 
              Mỗi xe đều có thể được kiểm định bởi đội ngũ VeloSafe chuyên nghiệp.
            </p>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
              <div className="flex items-center gap-4 px-6 py-4 rounded-lg bg-card border border-border/60 shadow-athletic transition-all duration-300 hover:shadow-athletic-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-3xl font-extrabold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>{MOCK_LISTINGS.length}</p>
                  <p className="text-sm text-muted-foreground font-medium">Xe đang bán</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 py-4 rounded-lg bg-card border border-success/30 shadow-athletic transition-all duration-300 hover:shadow-athletic-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/15">
                  <svg className="h-6 w-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-3xl font-extrabold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>{veloSafeCount}</p>
                  <p className="text-sm text-muted-foreground font-medium">VeloSafe Verified</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 py-4 rounded-lg bg-card border border-border/60 shadow-athletic transition-all duration-300 hover:shadow-athletic-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-3xl font-extrabold text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>3</p>
                  <p className="text-sm text-muted-foreground font-medium">Thành phố</p>
                </div>
              </div>
            </div>
          </motion.div>
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
                  <span className="font-medium text-foreground">{filteredListings.length}</span> xe được tìm thấy
                </p>
              </div>

              <div className="flex items-center gap-3">
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
          </div>
        </div>
      </main>
    </div>
  )
}
