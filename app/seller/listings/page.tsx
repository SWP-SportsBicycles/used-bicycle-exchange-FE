'use client'

import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { MOCK_LISTINGS, formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function SellerListingsPage() {
  const { language } = useLanguage()
  const myListings = MOCK_LISTINGS.slice(0, 3)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{language === 'vi' ? 'Tin Đăng Của Tôi' : 'My Listings'}</CardTitle>
          <CardDescription>
            {language === 'vi' ? 'Quản lý xe đang bán' : 'Manage your bikes'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/seller/create" className="gap-1">
            {language === 'vi' ? 'Đăng tin mới' : 'Create listing'}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {myListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="flex items-center gap-4 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{listing.title}</p>
                <p className="text-xs text-muted-foreground">{formatVND(listing.price)}</p>
              </div>

              <div className="flex items-center gap-2">
                {listing.isVeloSafeVerified && <CheckCircle2 className="h-4 w-4 text-[#407F3E]" />}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    listing.status === 'published'
                      ? 'bg-[#407F3E]/15 text-[#407F3E]'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {listing.status === 'published'
                    ? language === 'vi'
                      ? 'Đang bán'
                      : 'Active'
                    : language === 'vi'
                      ? 'Nháp'
                      : 'Draft'}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
