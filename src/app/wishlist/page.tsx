'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Trash2, 
  ShoppingCart,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { MOCK_LISTINGS, formatVND, getConditionColor, CITIES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function WishlistPage() {
  const { user, isAuthenticated } = useAuth()
  const { language } = useLanguage()
  // Mock wishlist with first 3 listings
  const [wishlistIds, setWishlistIds] = useState(['1', '3', '5'])
  
  const wishlistItems = MOCK_LISTINGS.filter(l => wishlistIds.includes(l.id))

  const removeFromWishlist = (id: string) => {
    setWishlistIds(prev => prev.filter(i => i !== id))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'vi' ? 'Vui lòng đăng nhập' : 'Please login'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {language === 'vi'
                  ? 'Đăng nhập để xem danh sách xe yêu thích của bạn.'
                  : 'Sign in to view your wishlist.'}
              </p>
              <Button asChild>
                <Link href="/auth/login?redirect=/wishlist">
                  {language === 'vi' ? 'Đăng nhập' : 'Sign in'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (user.role !== 'buyer') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'vi' ? 'Trang này dành cho Người Mua' : 'This page is for Buyers only'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {language === 'vi'
                  ? 'Vai trò hiện tại không sử dụng danh sách yêu thích.'
                  : 'Your current role does not use wishlist.'}
              </p>
              <Button asChild>
                <Link href="/">{language === 'vi' ? 'Về Trang Chủ' : 'Back to Home'}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            {language === 'vi' ? 'Danh Sách Yêu Thích' : 'Wishlist'}
          </h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} {language === 'vi' ? 'xe đã lưu' : 'bikes saved'}
          </p>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'vi' ? 'Chưa có xe yêu thích' : 'No saved bikes yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {language === 'vi' 
                  ? 'Thêm xe vào danh sách yêu thích để theo dõi và so sánh dễ dàng hơn'
                  : 'Add bikes to your wishlist to track and compare them easily'}
              </p>
              <Button asChild>
                <Link href="/">
                  {language === 'vi' ? 'Khám phá Marketplace' : 'Explore Marketplace'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {wishlistItems.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden hover:border-primary/40 transition-all bg-card/80 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        <Link 
                          href={`/listing/${listing.id}`}
                          className="relative sm:w-48 aspect-4/3 sm:aspect-square overflow-hidden bg-muted"
                        >
                          <Image 
                            src={listing.images[0]} 
                            alt={listing.title}
                            fill
                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          {listing.isVeloSafeVerified && (
                            <Badge className="absolute top-2 left-2 bg-success text-success-foreground text-xs gap-1">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              VeloSafe
                            </Badge>
                          )}
                        </Link>

                        {/* Content */}
                        <div className="flex-1 p-4 flex flex-col">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <Link 
                                href={`/listing/${listing.id}`}
                                className="font-semibold hover:text-primary transition-colors line-clamp-2"
                              >
                                {listing.title}
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={() => removeFromWishlist(listing.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>

                            <p className="text-xl font-bold text-primary mb-3">
                              {formatVND(listing.price)}
                            </p>

                            {/* Specs */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className={cn('text-xs', getConditionColor(listing.condition))}>
                                {listing.condition.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {listing.frameSize}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {listing.groupset}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {CITIES.find(c => c.value === listing.city)?.label}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {listing.description}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                            <Button className="flex-1" asChild>
                              <Link href={`/listing/${listing.id}`}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {language === 'vi' ? 'Đặt Cọc' : 'Deposit'}
                              </Link>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/listing/${listing.id}`}>
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
