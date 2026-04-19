'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Filter, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { BRANDS, CATEGORIES, CITIES, CONDITIONS, FRAME_SIZES, GROUPSETS, formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export interface FilterState {
  categories: string[]
  brands: string[]
  frameSizes: string[]
  groupsets: string[]
  conditions: string[]
  cities: string[]
  priceRange: [number, number]
  veloSafeOnly: boolean
}

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  className?: string
}

const filterSections = [
  { key: 'categories', title: 'Category', options: CATEGORIES.map((item) => ({ value: item.value, label: item.label })) },
  { key: 'cities', title: 'City', options: CITIES },
  { key: 'brands', title: 'Brand', options: BRANDS.map((item) => ({ value: item, label: item })) },
  { key: 'frameSizes', title: 'Frame size', options: FRAME_SIZES.map((item) => ({ value: item, label: item })) },
  { key: 'groupsets', title: 'Groupset', options: GROUPSETS.map((item) => ({ value: item, label: item })) },
  { key: 'conditions', title: 'Condition', options: CONDITIONS },
]

function FilterSection({
  title,
  options,
  selected,
  onChange,
  defaultOpen = false,
}: {
  title: string
  options: { value: string; label: string; description?: string }[]
  selected: string[]
  onChange: (values: string[]) => void
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
      return
    }

    onChange([...selected, value])
  }

  return (
    <div className="border-b border-border/60 pb-4">
      <button
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between py-2 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {selected.length > 0 && (
            <Badge variant="outline" className="rounded-full border px-2 py-0 text-[10px] font-semibold">
              {selected.length}
            </Badge>
          )}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-transparent bg-white/55 px-3 py-2.5 transition-colors hover:border-border/70 hover:bg-white/85"
                >
                  <Checkbox
                    checked={selected.includes(option.value)}
                    onCheckedChange={() => toggleValue(option.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{option.label}</div>
                    {option.description && (
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{option.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getActiveFilterCount(filters: FilterState) {
  return [
    filters.categories,
    filters.brands,
    filters.frameSizes,
    filters.groupsets,
    filters.conditions,
    filters.cities,
  ].reduce((total, current) => total + current.length, 0) + (filters.veloSafeOnly ? 1 : 0)
}

function FilterContent({ filters, onFilterChange }: FilterSidebarProps) {
  const activeFilterCount = getActiveFilterCount(filters)

  const clearAllFilters = () => {
    onFilterChange({
      categories: [],
      brands: [],
      frameSizes: [],
      groupsets: [],
      conditions: [],
      cities: [],
      priceRange: [0, 100000000],
      veloSafeOnly: false,
    })
  }

  return (
    <div className="flex w-full flex-col">
      <div className="premium-subpanel mb-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow-chip">Curated search</div>
            <h3 className="mt-3 text-lg font-bold tracking-[-0.02em] text-foreground">Find the right ride faster</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Narrow by category, city, build kit, and trust level without losing the premium catalog feel.
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Filter className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
            {activeFilterCount} active
          </Badge>
          {filters.veloSafeOnly && (
            <Badge variant="outline" className="rounded-full border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
              VeloSafe only
            </Badge>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="outline" className="rounded-full border px-2 py-0 text-[10px] font-semibold">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="rounded-full px-3 text-xs text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.35rem] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(234,252,238,0.9),rgba(243,248,240,0.9))] p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={filters.veloSafeOnly}
              onCheckedChange={(checked) => onFilterChange({ ...filters, veloSafeOnly: checked === true })}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">Verified bikes only</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-emerald-700/80">
                Focus the catalog on listings that already carry inspection-ready trust signals.
              </p>
            </div>
          </label>
        </div>

        <div className="rounded-[1.35rem] border border-border/60 bg-white/82 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Budget range</span>
            <Badge variant="outline" className="rounded-full border px-2 py-0 text-[10px] font-semibold">
              {formatVND(filters.priceRange[0])} - {formatVND(filters.priceRange[1])}
            </Badge>
          </div>

          <div className="px-1 pb-1 pt-5">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => onFilterChange({ ...filters, priceRange: value as [number, number] })}
              min={0}
              max={100000000}
              step={1000000}
              className="w-full"
            />
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{formatVND(filters.priceRange[0])}</span>
              <span>{formatVND(filters.priceRange[1])}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[1.45rem] border border-border/60 bg-white/82 p-4">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Browse controls
          </div>

          <div className="space-y-2">
            {filterSections.map((section, index) => (
              <FilterSection
                key={section.key}
                title={section.title}
                options={section.options}
                selected={filters[section.key as keyof FilterState] as string[]}
                onChange={(values) => onFilterChange({ ...filters, [section.key]: values })}
                defaultOpen={index < 2}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FilterSidebar({ filters, onFilterChange, className }: FilterSidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28 }}
      className={cn(
        'hidden max-h-[calc(min(100svh,100dvh,100vh)-5.25rem)] w-80 shrink-0 self-start overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-border/60 bg-white/76 p-4 shadow-premium backdrop-blur-xl lg:sticky lg:top-20 lg:block',
        className
      )}
    >
      <FilterContent filters={filters} onFilterChange={onFilterChange} />
    </motion.aside>
  )
}

export function MobileFilterSheet({ filters, onFilterChange }: FilterSidebarProps) {
  const activeFilterCount = getActiveFilterCount(filters)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 rounded-full bg-primary px-2 py-0 text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[22rem] overflow-y-auto border-border/70 bg-[linear-gradient(180deg,rgba(251,252,247,0.98),rgba(244,247,238,0.98))] p-4 pt-10">
        <FilterContent filters={filters} onFilterChange={onFilterChange} />
      </SheetContent>
    </Sheet>
  )
}
