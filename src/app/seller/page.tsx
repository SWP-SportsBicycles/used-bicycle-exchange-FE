'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  normalizeListingsPayload, 
  normalizeOrdersPayload 
} from '@/modules/seller/utils/normalization'
import { 
  Package, 
  ShoppingCart, 
  Wallet, 
  TrendingUp, 
  Eye,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { useSellerListings } from '@/modules/seller/hooks/useSellerListings'
import { useSellerOrders } from '@/modules/seller/hooks/useSellerOrders'
import { 
  MOCK_WALLET_TRANSACTIONS,
  formatVND,
  ORDER_STATUS_LABELS
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  pending_deposit: 'bg-muted text-muted-foreground',
  pending_seller_confirm: 'bg-muted text-muted-foreground',
  seller_confirmed: 'bg-[#407F3E]/15 text-[#407F3E]',
  pending_inspection: 'bg-accent/20 text-accent-foreground',
  inspection_passed: 'bg-[#407F3E]/15 text-[#407F3E]',
  inspection_failed: 'bg-destructive/20 text-destructive',
  inspection_scheduled: 'bg-accent/20 text-accent-foreground',
  inspection_completed: 'bg-[#407F3E]/15 text-[#407F3E]',
  pending_payment: 'bg-[#407F3E]/15 text-[#407F3E]',
  shipping: 'bg-accent/20 text-accent-foreground',
  delivered: 'bg-[#407F3E]/15 text-[#407F3E]',
  pending_confirmation: 'bg-[#407F3E]/15 text-[#407F3E]',
  completed: 'bg-[#407F3E]/15 text-[#407F3E]',
  cancelled: 'bg-destructive/20 text-destructive',
  disputed: 'bg-destructive/20 text-destructive',
}

export default function SellerDashboardPage() {
  const { user } = useAuth()
  const { language } = useLanguage()

  const { data: listingsData, isLoading: isLoadingListings } = useSellerListings({ pageSize: 100 })
  const { data: ordersData, isLoading: isLoadingOrders } = useSellerOrders({ size: 100 })

  // Data for this seller
  const normalizedListings = useMemo(() => normalizeListingsPayload(listingsData), [listingsData])
  const myListings = useMemo(() => normalizedListings.slice(0, 3), [normalizedListings])
  const myOrders = useMemo(() => normalizeOrdersPayload(ordersData).slice(0, 3), [ordersData])
  const recentTransactions = MOCK_WALLET_TRANSACTIONS.slice(0, 3)

  const stats = {
    totalListings: normalizedListings.length,
    activeListings: myListings.filter(l => l.status === 'published').length,
    pendingOrders: normalizeOrdersPayload(ordersData).filter(o => 
      !['completed', 'cancelled', 'delivered'].includes(o.status)
    ).length,
    totalEarnings: user.walletBalance || 0,
    thisMonthViews: 1247, // Mock as backend doesn't have views yet
    conversionRate: 4.8,  // Mock
  }

  if (isLoadingListings || isLoadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            {language === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            {language === 'vi' ? 'Xin chào,' : 'Hello,'} {user.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'vi' 
              ? 'Đây là tổng quan hoạt động của bạn' 
              : 'Here is your activity overview'}
          </p>
        </div>
        <Button asChild className="shadow-athletic hover:shadow-athletic-lg transition-all duration-300">
          <Link href="/seller/create">
            {language === 'vi' ? 'Đăng Tin Mới' : 'Create Listing'}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/seller/listings" className="block">
            <Card className="border-border/60 shadow-athletic hover:shadow-athletic-lg transition-all duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'vi' ? 'Tin Đăng' : 'Listings'}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#407F3E]/12 flex items-center justify-center">
                  <Package className="h-4 w-4 text-[#407F3E]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{stats.totalListings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeListings} {language === 'vi' ? 'đang hoạt động' : 'active'}
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/seller/orders" className="block">
            <Card className="border-border/60 shadow-athletic hover:shadow-athletic-lg transition-all duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'vi' ? 'Đơn Hàng' : 'Orders'}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#407F3E]/12 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-[#407F3E]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'vi' ? 'đang xử lý' : 'pending'}
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/60 shadow-athletic hover:shadow-athletic-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'vi' ? 'Lượt Xem' : 'Views'}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#407F3E]/12 flex items-center justify-center">
                <Eye className="h-4 w-4 text-[#407F3E]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-archivo)' }}>{stats.thisMonthViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.conversionRate}% {language === 'vi' ? 'tỉ lệ chuyển đổi' : 'conversion'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders & Listings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{language === 'vi' ? 'Đơn Hàng Gần Đây' : 'Recent Orders'}</CardTitle>
                <CardDescription>
                  {language === 'vi' ? 'Cập nhật mới nhất' : 'Latest updates'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/seller/orders" className="gap-1">
                  {language === 'vi' ? 'Xem tất cả' : 'View all'}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {language === 'vi' ? 'Chưa có đơn hàng nào' : 'No orders yet'}
                  </p>
                ) : (
                  myOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={order.buyer.avatar} alt={order.buyer.name} />
                        <AvatarFallback>{order.buyer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{order.listing.title}</p>
                        <p className="text-xs text-muted-foreground">{order.buyer.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={cn('text-xs', statusColors[order.status] || 'bg-muted')}>
                          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]?.[language] || order.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatVND(order.depositAmount)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* My Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{language === 'vi' ? 'Tin Đăng Của Tôi' : 'My Listings'}</CardTitle>
                <CardDescription>
                  {language === 'vi' ? 'Quản lý xe đang bán' : 'Manage your bikes'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/seller/listings" className="gap-1">
                  {language === 'vi' ? 'Xem tất cả' : 'View all'}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myListings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {language === 'vi' ? 'Chưa có tin đăng nào' : 'No listings yet'}
                  </p>
                ) : (
                  myListings.map((listing) => (
                    <Link 
                      key={listing.id} 
                      href={`/seller/listings/${listing.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                        <Image
                          src={listing.images[0] || '/placeholder.svg'}
                          alt={listing.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{listing.title}</p>
                        <p className="text-xs text-muted-foreground">{formatVND(listing.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {listing.isVeloSafeVerified && (
                          <CheckCircle2 className="h-4 w-4 text-[#407F3E]" />
                        )}
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
                            ? (language === 'vi' ? 'Đang bán' : 'Active')
                            : (language === 'vi' ? 'Nháp/Chờ duyệt' : 'Draft/Pending')
                          }
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
