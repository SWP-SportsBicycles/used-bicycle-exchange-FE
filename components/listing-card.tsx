'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, MapPin, ShieldCheck, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type Listing, formatVND, getConditionColor, CONDITIONS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ListingCardProps {
  listing: Listing
  index?: number
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const conditionLabel = CONDITIONS.find(c => c.value === listing.condition)?.label || listing.condition

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/listing/${listing.id}`}>
        <Card className="group overflow-hidden bg-card border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-athletic-lg hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-105",
                !imageLoaded && "blur-sm"
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* VeloSafe Badge */}
            {listing.isVeloSafeVerified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-success text-success-foreground border-0 gap-1 shadow-lg">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        VeloSafe
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Xe Đã Kiểm Định VeloSafe</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Xe này đã được kiểm tra bởi đội ngũ Inspector chuyên nghiệp của VeloTrust
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
                isWishlisted && "text-destructive"
              )}
              onClick={(e) => {
                e.preventDefault()
                setIsWishlisted(!isWishlisted)
              }}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
              <span className="sr-only">Add to wishlist</span>
            </Button>

            {/* Condition Badge */}
            <div className="absolute bottom-3 left-3">
              <Badge 
                variant="outline" 
                className={cn("border backdrop-blur-sm bg-background/80", getConditionColor(listing.condition))}
              >
                {conditionLabel}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Price */}
            <div className="mb-2">
              <span className="text-xl font-bold text-[#407F3E]">
                {formatVND(listing.price)}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>

            {/* Key Specs */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant="secondary" className="text-xs font-normal">
                {listing.brand}
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                {listing.frameSize}
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                {listing.groupset}
              </Badge>
            </div>

            {/* Location & Seller */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {listing.city === 'hanoi' ? 'Hà Nội' : 
                   listing.city === 'hcm' ? 'TP.HCM' : 'Đà Nẵng'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="font-medium text-foreground">{listing.seller.rating}</span>
                <span className="text-muted-foreground">({listing.seller.totalSales})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
