'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ShieldCheck, Star, TrendingDown, Flame, Sparkles, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type BuyerListing } from '@/lib/api/buyer-api'
import { formatVND } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { WishlistButton } from '@/modules/buyer/components/WishlistButton'

interface ListingCardProps {
  listing: BuyerListing
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

function getAutoPromoTag(listing: BuyerListing, savingPct: number): ListingCardProps['promoTag'] {
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
  const [imageLoaded, setImageLoaded] = useState(false)

  const condition = CONDITION_STYLES[listing.condition] ?? CONDITION_STYLES.good
  const marketPrice = getMarketPrice(listing.price, listing.id)
  const saving = marketPrice - listing.price
  const savingPct = Math.round((saving / marketPrice) * 100)
  const pricingSignal =
    savingPct >= 20 ? 'Deal tốt' :
    savingPct >= 16 ? 'Giá cạnh tranh' :
    'Giá hợp lý'

  void pricingSignal

  // Auto-assign promoTag from listing data if caller didn't supply one
  const resolvedTag = promoTag ?? getAutoPromoTag(listing, savingPct)

  const PromoIcon = resolvedTag ? PROMO_TAG_CONFIG[resolvedTag].icon : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {/* ✅ Đã sửa: Route từ /listing/[id] -> /marketplace/[id] */}
      <Link href={`/marketplace/${listing.id}`} className="block group">
        <div
          className={cn(
            'relative flex flex-col overflow-hidden rounded-3xl bg-card',
            'shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] transition-all duration-300',
            'hover:shadow-athletic hover:-translate-y-1',
            listing.isLocked && 'opacity-70',
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

            {/* Gradient overlay — richer on hover */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

            {/* ── Locked overlay */}
            {listing.isLocked && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
                <Badge className="bg-slate-700 text-white text-sm px-4 py-1.5 flex items-center gap-1.5 rounded-xl">
                  <Lock className="h-3.5 w-3.5" />
                  Đang giao dịch (Locked)
                </Badge>
              </div>
            )}

            {/* ── VeloSafe badge (top-left) */}
            {listing.isVeloSafeVerified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-xl bg-[#aee86c] px-3 py-1.5 shadow-lg">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#1f2c12]" />
                      <span className="text-[11px] font-bold text-[#1f2c12]">VeloSafe</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-55">
                    <p className="font-semibold">Xe Đã Kiểm Định VeloSafe</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Kiểm tra 50+ điểm bởi inspector chuyên nghiệp của VeloTrust.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* ── Promo ribbon (top-right) */}
            {resolvedTag && PromoIcon && !listing.isLocked && (
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

            {/* ── Wishlist button */}
            <div className="absolute bottom-3 right-3 z-10">
              <WishlistButton
                key={`${listing.bikeId ?? listing.id}-${listing.isWishlisted ? '1' : '0'}`}
                listingId={listing.bikeId ?? listing.id}
                initialIsWishlisted={Boolean(listing.isWishlisted)}
                variant="ghost"
                className="h-9 w-9 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white shadow-md hover:bg-black/40 hover:scale-110"
              />
            </div>

            {/* ── Condition badge (overlay on image bottom-left) */}
            <div className="absolute bottom-3 left-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', condition.dot)} />
                {condition.label}
              </span>
            </div>
          </div>

          {/* ── BODY ──────────────────────────────── */}
          <div className="flex flex-col gap-0 p-5">
            
            {/* Brand (Optional) & Title */}
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {listing.brand}
            </div>
            <h3
              className="line-clamp-2 text-[17px] font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary"
            >
              {listing.title}
            </h3>

            {/* Spec tags (Dot separated) */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
              <span>Size {listing.frameSize}</span>
              <span>•</span>
              <span className="truncate">{listing.groupset}</span>
              {listing.isVeloSafeVerified && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    VeloSafe
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-border/50 to-transparent" />

            {/* Price & Savings */}
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
                    <span className="text-muted-foreground line-through decoration-muted-foreground/50">
                      {formatVND(marketPrice)}
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Giảm {savingPct}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Location */}
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
