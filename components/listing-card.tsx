'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, MapPin, ShieldCheck, Star, TrendingDown, Flame, Sparkles, BadgeCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type Listing, formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ListingCardProps {
  listing: Listing
  index?: number
  /** Optional promo tag shown on top-right ribbon */
  promoTag?: 'best_deal' | 'popular' | 'new'
}

/* ─── helpers ────────────────────────────────── */

const CITY_LABELS: Record<string, string> = {
  hanoi: 'Hà Nội',
  hcm: 'TP.HCM',
  danang: 'Đà Nẵng',
}

/** Derive an estimated reference price at +15-30% above listing price for demo */
function getMarketPrice(price: number, id: string): number {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pct = 0.15 + (seed % 16) * 0.01   // 15–30%
  return Math.round((price * (1 + pct)) / 500_000) * 500_000
}

function getAutoPromoTag(listing: Listing, savingPct: number): ListingCardProps['promoTag'] {
  if (savingPct >= 20) return 'best_deal'
  if (listing.seller.totalSales >= 10 || listing.seller.rating >= 4.8) return 'popular'
  if (listing.condition === 'like_new') return 'new'
  return undefined
}

const CONDITION_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  like_new: { label: 'Like New', bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  excellent: { label: 'Excellent', bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500' },
  good: { label: 'Good', bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  fair: { label: 'Fair', bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-400' },
}

const PROMO_TAG_CONFIG = {
  best_deal: { label: 'Best Deal', icon: TrendingDown, className: 'bg-[#407F3E] text-white' },
  popular: { label: 'Popular', icon: Flame, className: 'bg-orange-500 text-white' },
  new: { label: 'New', icon: Sparkles, className: 'bg-sky-500 text-white' },
}

/* ─── component ──────────────────────────────── */

export function ListingCard({ listing, index = 0, promoTag }: ListingCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const condition = CONDITION_STYLES[listing.condition] ?? CONDITION_STYLES.good
  const marketPrice = getMarketPrice(listing.price, listing.id)
  const saving = marketPrice - listing.price
  const savingPct = Math.round((saving / marketPrice) * 100)
  const pricingSignal =
    savingPct >= 20 ? 'Deal tốt' :
    savingPct >= 16 ? 'Giá cạnh tranh' :
    'Giá hợp lý'

  // Auto-assign promoTag from listing data if caller didn't supply one
  const resolvedTag = promoTag ?? getAutoPromoTag(listing, savingPct)

  const PromoIcon = resolvedTag ? PROMO_TAG_CONFIG[resolvedTag].icon : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/listing/${listing.id}`} className="block group">
        <div
          className={cn(
            'relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/60',
            'shadow-sm transition-all duration-300',
            'hover:shadow-[0_8px_30px_-8px_rgba(174,232,108,0.25)] hover:-translate-y-1 hover:border-primary/40',
          )}
        >

          {/* ── IMAGE ──────────────────────────────── */}
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className={cn(
                'object-cover transition-all duration-500 group-hover:scale-[1.04]',
                !imageLoaded && 'blur-sm scale-105',
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Gradient overlay — richer on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

            {/* ── VeloSafe badge (top-left) */}
            {listing.isVeloSafeVerified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#aee86c] px-2.5 py-1 shadow-lg">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#1f2c12]" />
                      <span className="text-[11px] font-bold text-[#1f2c12]">VeloSafe</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px]">
                    <p className="font-semibold">Xe Đã Kiểm Định VeloSafe</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Kiểm tra 50+ điểm bởi inspector chuyên nghiệp của VeloTrust.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* ── Promo ribbon (top-right) */}
            {resolvedTag && PromoIcon && (
              <div
                className={cn(
                  'absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 shadow-lg text-[11px] font-bold',
                  PROMO_TAG_CONFIG[resolvedTag].className,
                )}
              >
                <PromoIcon className="h-3 w-3" />
                {PROMO_TAG_CONFIG[resolvedTag].label}
              </div>
            )}

            {/* ── Wishlist button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute bottom-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm',
                'shadow-md hover:bg-background hover:scale-110 transition-all duration-200',
                isWishlisted && 'text-rose-500',
              )}
              onClick={(e) => {
                e.preventDefault()
                setIsWishlisted(!isWishlisted)
              }}
            >
              <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
              <span className="sr-only">Thêm vào wishlist</span>
            </Button>

            {/* ── Condition badge (overlay on image bottom-left) */}
            <div className="absolute bottom-3 left-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', condition.dot)} />
                {condition.label}
              </span>
            </div>
          </div>

          {/* ── BODY ──────────────────────────────── */}
          <div className="flex flex-col gap-0 p-4">

            {/* Price row */}
            <div className="flex items-baseline justify-between">
              <span
                className="text-2xl font-extrabold text-[#2d6b2b] dark:text-[#aee86c]"
                style={{ fontFamily: 'var(--font-archivo)' }}
              >
                {formatVND(listing.price)}
              </span>
              {/* Seller rating — compact */}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="font-semibold text-foreground">{listing.seller.rating}</span>
                <span>({listing.seller.totalSales} bán)</span>
              </span>
            </div>

            {/* Price intelligence */}
            <div className="mt-2 rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-3 py-2 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingDown className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="text-muted-foreground">Giá tham chiếu:</span>
                  <span className="text-muted-foreground line-through">{formatVND(marketPrice)}</span>
                </div>
                <Badge className="border-0 bg-emerald-600/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600/10 dark:text-emerald-300">
                  {pricingSignal}
                </Badge>
              </div>
              <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Tiết kiệm khoảng {formatVND(saving)} ({savingPct}%)
              </p>
            </div>

            {/* Bike name */}
            <h3
              className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-[#407F3E]"
            >
              {listing.title}
            </h3>

            {/* Spec tags */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[listing.brand, `Size ${listing.frameSize}`, listing.groupset].map((spec) => (
                <span
                  key={spec}
                  className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div className="my-3 h-px bg-border/60" />

            {/* Footer row: location + verified seller */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{CITY_LABELS[listing.city] ?? listing.city}</span>
              </div>
              {listing.isVeloSafeVerified && (
                <div className="flex items-center gap-1 text-[#407F3E] dark:text-[#aee86c]">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">Đã kiểm định</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
