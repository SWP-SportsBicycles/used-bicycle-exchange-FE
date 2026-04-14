'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { BRANDS, FRAME_SIZES, GROUPSETS, CONDITIONS, CITIES, CATEGORIES } from '@/lib/mock-data'
import { formatVND } from '@/lib/mock-data'
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
  { key: 'categories', title: 'Loại Xe', options: CATEGORIES.map(c => ({ value: c.value, label: c.label })) },
  { key: 'cities', title: 'Thành Phố', options: CITIES },
  { key: 'brands', title: 'Thương Hiệu', options: BRANDS.map(b => ({ value: b, label: b })) },
  { key: 'frameSizes', title: 'Size Khung', options: FRAME_SIZES.map(s => ({ value: s, label: s })) },
  { key: 'groupsets', title: 'Groupset', options: GROUPSETS.map(g => ({ value: g, label: g })) },
  { key: 'conditions', title: 'Tình Trạng', options: CONDITIONS },
]

function FilterSection({ 
  title, 
  options, 
  selected, 
  onChange,
  defaultOpen = false 
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
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {selected.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {selected.length}
            </Badge>
          )}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
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
            <div className="flex flex-col gap-2 pt-2">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-secondary transition-colors"
                >
                  <Checkbox
                    checked={selected.includes(option.value)}
                    onCheckedChange={() => toggleValue(option.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-foreground">{option.label}</span>
                    {option.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
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

function FilterContent({ filters, onFilterChange }: FilterSidebarProps) {
  const activeFilterCount = [
    filters.categories,
    filters.brands,
    filters.frameSizes,
    filters.groupsets,
    filters.conditions,
    filters.cities,
  ].reduce((acc, arr) => acc + arr.length, 0) + (filters.veloSafeOnly ? 1 : 0)

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Bộ Lọc</h3>
          {activeFilterCount > 0 && (
            <Badge className="bg-primary text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 -mx-1 px-1">
        <div className="flex flex-col gap-2">
          {/* VeloSafe Verified Toggle */}
          <div className="border-b border-border pb-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-3 hover:bg-success/10 transition-colors">
              <Checkbox
                checked={filters.veloSafeOnly}
                onCheckedChange={(checked) => 
                  onFilterChange({ ...filters, veloSafeOnly: checked === true })
                }
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-success">VeloSafe Verified</span>
                  <svg className="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chỉ hiển thị xe đã qua kiểm định
                </p>
              </div>
            </label>
          </div>

          {/* Price Range */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-foreground">Khoảng Giá</span>
            </div>
            <div className="pt-2 pb-4 px-1">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => 
                  onFilterChange({ ...filters, priceRange: value as [number, number] })
                }
                min={0}
                max={100000000}
                step={1000000}
                className="w-full"
              />
              <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                <span>{formatVND(filters.priceRange[0])}</span>
                <span>{formatVND(filters.priceRange[1])}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Filter Sections */}
          {filterSections.map((section, index) => (
            <FilterSection
              key={section.key}
              title={section.title}
              options={section.options}
              selected={filters[section.key as keyof FilterState] as string[]}
              onChange={(values) => 
                onFilterChange({ ...filters, [section.key]: values })
              }
              defaultOpen={index < 2}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// Desktop Sidebar
export function FilterSidebar({ filters, onFilterChange, className }: FilterSidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "hidden lg:flex lg:flex-col w-72 shrink-0 sticky top-20 h-[calc(100vh-6rem)] bg-card/95 backdrop-blur-lg rounded-lg border border-border/60 p-4 shadow-athletic",
        className
      )}
    >
      <FilterContent filters={filters} onFilterChange={onFilterChange} />
    </motion.aside>
  )
}

// Mobile Filter Sheet
export function MobileFilterSheet({ filters, onFilterChange }: FilterSidebarProps) {
  const activeFilterCount = [
    filters.categories,
    filters.brands,
    filters.frameSizes,
    filters.groupsets,
    filters.conditions,
    filters.cities,
  ].reduce((acc, arr) => acc + arr.length, 0) + (filters.veloSafeOnly ? 1 : 0)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Bộ Lọc
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-4">
        <FilterContent filters={filters} onFilterChange={onFilterChange} />
      </SheetContent>
    </Sheet>
  )
}
