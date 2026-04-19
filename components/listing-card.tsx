'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Clock3,
  Eye,
  Flame,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type Listing, formatVND, getMarketPrice, getTimeAgo, getViewerCount } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface ListingCardProps {
  listing: Listing
  index?: number
  promoTag?: 'best_deal' | 'popular' | 'new'
}

const CITY_LABELS: Record<string, string> = {
  hanoi: 'Ha Noi',
  hcm: 'Ho Chi Minh City',
  danang: 'Da Nang',
}

const CONDITION_STYLES: Record<string, { label: string; className: string }> = {
  like_new: { label: 'Like New', className: 'bg-emerald-500/12 text-emerald-700 border-emerald-500/20' },
  excellent: { label: 'Excellent', className: 'bg-sky-500/12 text-sky-700 border-sky-500/20' },
  good: { label: 'Good', className: 'bg-amber-500/12 text-amber-700 border-amber-500/20' },
  fair: { label: 'Fair', className: 'bg-rose-500/12 text-rose-700 border-rose-500/20' },
}

const PROMO_TAG_CONFIG = {
  best_deal: { label: 'Best Deal', icon: TrendingDown, className: 'bg-[#316226] text-white' },
  popular: { label: 'High Demand', icon: Flame, className: 'bg-[#db6c27] text-white' },
  new: { label: 'Fresh In', icon: Sparkles, className: 'bg-[#265f95] text-white' },
}

function getAutoPromoTag(listing: Listing, savingPct: number): ListingCardProps['promoTag'] {
  if (savingPct >= 20) return 'best_deal'
  if (listing.seller.totalSales >= 10 || listing.seller.rating >= 4.8) return 'popular'
  if (listing.condition === 'like_new') return 'new'
  return undefined
}

function getSellerBadge(listing: Listing) {
  if (listing.seller.rating >= 4.9) return 'Top-rated seller'
  if (listing.seller.totalSales >= 10) return 'Repeat seller'
  if (listing.isVeloSafeVerified) return 'Verified handoff'
  return 'Private seller'
}

export function ListingCard({ listing, index = 0, promoTag }: ListingCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const viewerCount = getViewerCount(listing.id)
  const timeAgo = getTimeAgo(listing.createdAt)
  const marketPrice = getMarketPrice(listing.price, listing.id)
  const delta = marketPrice - listing.price
  const savingPct = Math.max(0, Math.round((delta / marketPrice) * 100))
  const resolvedTag = promoTag ?? getAutoPromoTag(listing, savingPct)
  const PromoIcon = resolvedTag ? PROMO_TAG_CONFIG[resolvedTag].icon : null
  const condition = CONDITION_STYLES[listing.condition] ?? CONDITION_STYLES.good
  const inspectionGrade = listing.inspection?.report.overallGrade

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Link href={`/listing/${listing.id}`} className="group block">
        <article className="mesh-card relative overflow-hidden rounded-[1.7rem] border border-border/60 bg-white/92 shadow-premium transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-[0_32px_70px_-46px_rgba(45,75,29,0.65)]">
          <div className="relative aspect-[1.08/1] overflow-hidden rounded-[1.55rem] rounded-b-[1.15rem] bg-secondary/60">
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className={cn(
                'object-cover transition-all duration-500 group-hover:scale-[1.05]',
                !imageLoaded && 'scale-105 blur-sm'
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.2)_45%,rgba(9,12,7,0.7)_100%)]" />

            <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
              {listing.isVeloSafeVerified && (
                <Badge className="rounded-full border-0 bg-[#aee86c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1f2c12]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  VeloSafe
                </Badge>
              )}

              <Badge variant="outline" className={cn('rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md', condition.className)}>
                {condition.label}
              </Badge>
            </div>

            {resolvedTag && PromoIcon && (
              <div className={cn('absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-lg', PROMO_TAG_CONFIG[resolvedTag].className)}>
                <PromoIcon className="h-3.5 w-3.5" />
                {PROMO_TAG_CONFIG[resolvedTag].label}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute bottom-3 right-3 h-9 w-9 rounded-full border border-white/20 bg-white/88 text-foreground backdrop-blur-md shadow-sm hover:bg-white',
                isWishlisted && 'text-rose-500'
              )}
              onClick={(event) => {
                event.preventDefault()
                setIsWishlisted((current) => !current)
              }}
            >
              <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
              <span className="sr-only">Save listing</span>
            </Button>

            <div className="absolute inset-x-3 bottom-3">
              <div className="rounded-[1.2rem] border border-white/12 bg-black/34 px-3.5 py-3 text-white backdrop-blur-md">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">Current asking</div>
                    <div className="mt-1 text-2xl font-extrabold tracking-[-0.03em]" style={{ fontFamily: 'var(--font-archivo)' }}>
                      {formatVND(listing.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-white/60">Market ref</div>
                    <div className="mt-1 text-sm font-semibold text-white/90">{formatVND(marketPrice)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                {getSellerBadge(listing)}
              </Badge>
              {inspectionGrade && (
                <Badge variant="outline" className="rounded-full border-border/70 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
                  Grade {inspectionGrade}
                </Badge>
              )}
            </div>

            <div>
              <h3 className="line-clamp-2 text-[1.02rem] font-bold leading-6 tracking-[-0.02em] text-foreground transition-colors duration-200 group-hover:text-primary">
                {listing.title}
              </h3>
              <p className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                {[listing.brand, `Size ${listing.frameSize}`, listing.groupset].map((spec) => (
                  <span key={spec} className="rounded-full border border-border/70 bg-secondary/50 px-2.5 py-1 font-medium">
                    {spec}
                  </span>
                ))}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="premium-subpanel p-3">
                <div className="metric-label">Price signal</div>
                <div className="metric-value text-lg text-foreground">
                  {savingPct > 0 ? `${savingPct}% below ref` : 'In market range'}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {delta > 0 ? `Approx. save ${formatVND(delta)}` : 'Positioned close to current comps'}
                </div>
              </div>
              <div className="premium-subpanel p-3">
                <div className="metric-label">Seller proof</div>
                <div className="metric-value text-lg text-foreground">
                  {listing.seller.rating.toFixed(1)}
                  <span className="ml-1 text-sm text-muted-foreground">/ 5</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {listing.seller.totalSales} completed sales on record
                </div>
              </div>
            </div>

            <div className="ambient-divider" />

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {CITY_LABELS[listing.city] ?? listing.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {timeAgo}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {viewerCount} viewing
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[1.2rem] border border-border/70 bg-white/72 px-3.5 py-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <div>
                  <div className="text-sm font-semibold text-foreground">{listing.seller.name}</div>
                  <div className="text-xs text-muted-foreground">Trusted seller profile</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                {listing.isVeloSafeVerified ? <BadgeCheck className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                <span>{listing.isVeloSafeVerified ? 'Inspection ready' : 'Private listing'}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
