'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ShieldCheck, Star, TrendingDown, Flame, Sparkles, ArrowRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type BuyerListing } from '@/lib/api/buyer-api'
import { formatVND } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { WishlistButton } from '@/modules/buyer/components/WishlistButton'

interface ListingCardProps {
  listing: BuyerListing
  index?: number
  promoTag?: 'best_deal' | 'popular' | 'new'
}

/* ─── helpers ────────────────────────────────── */

const CITY_LABELS: Record<string, string> = {
  hanoi: 'Hà Nội',
  hcm: 'TP.HCM',
  danang: 'Đà Nẵng',
}

function getMarketPrice(price: number, id: string): number {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pct = 0.15 + (seed % 16) * 0.01
  return Math.round((price * (1 + pct)) / 500_000) * 500_000
}

function getAutoPromoTag(listing: BuyerListing, savingPct: number): ListingCardProps['promoTag'] {
  if (savingPct >= 20) return 'best_deal'
  if (listing.seller.totalSales >= 10 || listing.seller.rating >= 4.8) return 'popular'
  if (listing.condition === 'like_new') return 'new'
  return undefined
}

const CONDITION_STYLES: Record<string, { label: string; dot: string }> = {
  like_new:  { label: 'Like New',  dot: 'bg-emerald-500' },
  excellent: { label: 'Excellent', dot: 'bg-sky-500'     },
  good:      { label: 'Good',      dot: 'bg-amber-500'   },
  fair:      { label: 'Fair',      dot: 'bg-rose-400'    },
}

const PROMO_TAG_CONFIG = {
  best_deal: { label: 'Best Deal', icon: TrendingDown, className: 'bg-[#407F3E] text-white' },
  popular:   { label: 'Popular',   icon: Flame,        className: 'bg-orange-500 text-white' },
  new:       { label: 'New',       icon: Sparkles,     className: 'bg-sky-500 text-white'    },
}

/* ─── component ──────────────────────────────── */

export function ListingCard({ listing, index = 0, promoTag }: ListingCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const condition  = CONDITION_STYLES[listing.condition] ?? CONDITION_STYLES.good
  const marketPrice = getMarketPrice(listing.price, listing.id)
  const saving      = marketPrice - listing.price
  const savingPct   = Math.round((saving / marketPrice) * 100)

  const resolvedTag = promoTag ?? getAutoPromoTag(listing, savingPct)
  const PromoIcon   = resolvedTag ? PROMO_TAG_CONFIG[resolvedTag].icon : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/marketplace/${listing.id}`} className="block group">
        <div
          className={cn(
            'relative flex flex-col overflow-hidden rounded-3xl bg-card',
            'border border-transparent transition-all duration-300',
            'shadow-[0_2px_12px_-4px_rgba(0,0,0,0.07)]',
            'hover:-translate-y-1.5 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.14)] hover:border-primary/20',
          )}
        >

          {/* ── IMAGE ──────────────────────────────── */}
          <div className="relative aspect-4/3 overflow-hidden bg-secondary/50">
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className={cn(
                'object-cover transition-all duration-700 ease-out group-hover:scale-105',
                !imageLoaded && 'blur-sm scale-110',
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

            {/* "Xem chi tiết" CTA — slides up from bottom on hover */}
            <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-linear-to-t from-primary/95 to-primary/70 py-3 text-sm font-bold text-primary-foreground backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
              Xem chi tiết <ArrowRight className="h-4 w-4" />
            </div>

            {/* SBESafe badge — all listings are certified */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-xl bg-[#aee86c] px-3 py-1.5 shadow-lg">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#1f2c12]" />
                    <span className="text-[11px] font-bold text-[#1f2c12]">SBESafe</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-55">
                  <p className="font-semibold">Xe Đã Kiểm Định SBESafe</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Kiểm tra kỹ thuật bởi chuyên gia SBESafe.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Promo ribbon */}
            {resolvedTag && PromoIcon && (
              <div
                className={cn(
                  'absolute right-3 top-3 flex items-center gap-1 rounded-xl px-3 py-1.5 shadow-lg text-[11px] font-bold',
                  PROMO_TAG_CONFIG[resolvedTag].className,
                )}
              >
                <PromoIcon className="h-3 w-3" />
                {PROMO_TAG_CONFIG[resolvedTag].label}
              </div>
            )}

            {/* Wishlist — moves up when CTA appears */}
            <div className="absolute bottom-3 right-3 z-10 transition-transform duration-300 group-hover:-translate-y-10">
              <WishlistButton
                key={`${listing.bikeId || listing.id}-${listing.isWishlisted ? '1' : '0'}`}
                listingId={listing.bikeId || listing.id}
                initialIsWishlisted={Boolean(listing.isWishlisted)}
                variant="ghost"
                className="h-9 w-9 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white shadow-md hover:bg-black/40 hover:scale-110"
              />
            </div>

            {/* Condition badge */}
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                <span className={cn('h-1.5 w-1.5 rounded-full', condition.dot)} />
                {condition.label}
              </span>
            </div>
          </div>

          {/* ── BODY ──────────────────────────────── */}
          <div className="flex flex-col p-5">

            {/* Brand */}
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {listing.brand}
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
              {listing.title}
            </h3>

            {/* Spec tags */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
              <span>Size {listing.frameSize}</span>
              <span>•</span>
              <span className="truncate">{listing.groupset}</span>
              <span className="flex items-center gap-1 font-medium text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                SBESafe
              </span>
            </div>

            {/* Divider */}
            <div className="my-4 h-px w-full bg-linear-to-r from-transparent via-border/50 to-transparent" />

            {/* Price row */}
            <div className="flex items-end justify-between">
              <div>
                <span
                  className="text-2xl sm:text-[28px] font-extrabold text-foreground tracking-tighter"
                  style={{ fontFamily: 'var(--font-archivo)' }}
                >
                  {formatVND(listing.price)}
                </span>

                {savingPct >= 15 && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground line-through">{formatVND(marketPrice)}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Giảm {savingPct}%</span>
                  </div>
                )}

                {/* Seller trust line */}
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Bán bởi <span className="font-medium text-foreground">{listing.seller.name}</span>
                </p>
              </div>

              {/* Location + Rating */}
              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{CITY_LABELS[listing.city] ?? listing.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{listing.seller.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
