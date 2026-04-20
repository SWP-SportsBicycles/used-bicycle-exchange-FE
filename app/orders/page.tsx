'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Calendar,
  MapPin,
  ArrowLeft,
  Eye
} from 'lucide-react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { MOCK_SELLER_ORDERS, ORDER_STATUS_LABELS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusIcons = {
  pending_deposit: Clock,
  soft_reserved: CheckCircle2,
  inspection_scheduled: Calendar,
  inspection_completed: CheckCircle2,
  pending_payment: Clock,
  delivered: Package,
  pending_confirmation: Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
  disputed: AlertTriangle,
}

const statusColors = {
  pending_deposit: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  soft_reserved: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  inspection_scheduled: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  inspection_completed: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
  pending_payment: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  delivered: 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30',
  pending_confirmation: 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30',
  completed: 'bg-success/20 text-success border-success/30',
  cancelled: 'bg-muted text-muted-foreground border-border',
  disputed: 'bg-destructive/20 text-destructive border-destructive/30',
}

export default function OrdersPage() {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getWaitingOwner = (status: string) => {
    switch (status) {
      case 'pending_deposit':
        return language === 'vi' ? 'Chờ Buyer đặt Soft Reserve' : 'Waiting Buyer to soft reserve'
      case 'soft_reserved':
        return language === 'vi' ? 'Chờ Buyer đặt cọc kiểm định' : 'Waiting Buyer inspection deposit'
      case 'inspection_scheduled':
        return language === 'vi' ? 'Chờ Inspector kiểm định' : 'Waiting Inspector'
      case 'inspection_completed':
        return language === 'vi' ? 'Chờ Buyer quyết định thanh toán' : 'Waiting Buyer payment decision'
      case 'pending_payment':
        return language === 'vi' ? 'Chờ Buyer thanh toán escrow' : 'Waiting Buyer escrow payment'
      case 'delivered':
        return language === 'vi' ? 'Chờ Buyer xác nhận đã nhận' : 'Waiting Buyer confirmation'
      case 'pending_confirmation':
        return language === 'vi' ? 'System chờ timeout xác nhận' : 'System waiting confirmation timeout'
      case 'disputed':
        return language === 'vi' ? 'Chờ Admin xử lý tranh chấp' : 'Waiting Admin resolution'
      default:
        return language === 'vi' ? 'Đã hoàn tất' : 'Completed'
    }
  }

  const { user, isAuthenticated } = useAuth()
  const { language, t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all')

  // Mock buyer orders (using seller orders but as if user is the buyer)
  const buyerOrders = MOCK_SELLER_ORDERS.map(order => ({
    ...order,
    seller: order.buyer, // Swap for demo
    buyer: { id: user.id, name: user.name, avatar: user.avatar },
  }))

  const filteredOrders = buyerOrders.filter(order => {
    if (activeTab === 'active') {
      return !['completed', 'cancelled'].includes(order.status)
    }
    if (activeTab === 'completed') {
      return ['completed', 'cancelled'].includes(order.status)
    }
    return true
  })

  const getEffectiveStatus = (order: typeof buyerOrders[number]) => {
    if (order.status !== 'pending_confirmation') return order.status
    const start = new Date(order.createdAt).getTime()
    const due = start + 24 * 60 * 60 * 1000
    return now >= due ? 'completed' : 'pending_confirmation'
  }

  const getPendingConfirmationCountdown = (createdAt: string) => {
    const start = new Date(createdAt).getTime()
    const due = start + 24 * 60 * 60 * 1000
    const remainingMs = due - now
    if (remainingMs <= 0) return null
    const totalSeconds = Math.floor(remainingMs / 1000)
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-24">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {language === 'vi' ? 'Vui lòng đăng nhập' : 'Please Login'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {language === 'vi' 
              ? 'Đăng nhập để xem đơn hàng của bạn' 
              : 'Login to view your orders'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Quay lại Marketplace' : 'Back to Marketplace'}
          </Link>
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'vi' ? 'Đơn Hàng Của Tôi' : 'My Orders'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'vi' 
                ? 'Theo dõi và quản lý đơn mua xe của bạn' 
                : 'Track and manage your bicycle purchases'}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              {language === 'vi' ? 'Tất cả' : 'All'} ({buyerOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              {language === 'vi' ? 'Đang xử lý' : 'Active'} (
              {buyerOrders.filter(o => !['completed', 'cancelled'].includes(o.status)).length}
              )
            </TabsTrigger>
            <TabsTrigger value="completed">
              {language === 'vi' ? 'Hoàn thành' : 'Completed'} (
              {buyerOrders.filter(o => ['completed', 'cancelled'].includes(o.status)).length}
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => {
                const effectiveStatus = getEffectiveStatus(order)
                const StatusIcon = statusIcons[effectiveStatus]
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-secondary/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {language === 'vi' ? 'Mã đơn:' : 'Order:'} #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {order.createdAt}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn('gap-1.5', statusColors[effectiveStatus])}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {ORDER_STATUS_LABELS[effectiveStatus][language]}
                        </Badge>
                        {order.status === 'pending_confirmation' && effectiveStatus === 'completed' && (
                          <Badge variant="outline" className="ml-2 text-xs border-emerald-500/40 text-emerald-600">
                            {language === 'vi' ? 'Auto-completed' : 'Auto-completed'}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                            <Image
                              src={order.listing.images[0]}
                              alt={order.listing.title}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/listing/${order.listing.id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                            >
                              {order.listing.title}
                            </Link>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span>{order.listing.brand}</span>
                              <span>•</span>
                              <span>{order.listing.frameSize}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {order.listing.city}
                              </span>
                            </div>

                            {/* Seller Info */}
                            <div className="flex items-center gap-2 mt-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={order.seller.avatar} />
                                <AvatarFallback className="text-[10px]">
                                  {order.seller.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                {language === 'vi' ? 'Người bán:' : 'Seller:'} {order.seller.name}
                              </span>
                            </div>

                            {/* Inspection Date if scheduled */}
                            {order.inspectionDate && (
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="text-foreground">
                                  {language === 'vi' ? 'Ngày kiểm định:' : 'Inspection:'} {order.inspectionDate}
                                </span>
                              </div>
                            )}
                            <p className="mt-2 text-xs font-medium text-primary">
                              {getWaitingOwner(effectiveStatus)}
                            </p>
                            {order.status === 'pending_confirmation' && effectiveStatus === 'pending_confirmation' && (
                              <p className="mt-1 text-xs text-amber-600">
                                {language === 'vi' ? 'Tự động hoàn tất sau:' : 'Auto-complete in:'}{' '}
                                {getPendingConfirmationCountdown(order.createdAt) ?? (language === 'vi' ? 'Đã hết thời gian, chờ đồng bộ trạng thái' : 'Expired, waiting status sync')}
                              </p>
                            )}
                            {order.status === 'pending_confirmation' && effectiveStatus === 'completed' && (
                              <p className="mt-1 text-xs text-emerald-600">
                                {language === 'vi' ? 'Đã tự động hoàn tất sau timeout xác nhận.' : 'Auto-completed after confirmation timeout.'}
                              </p>
                            )}
                          </div>

                          {/* Price & Actions */}
                          <div className="flex flex-col items-end justify-between shrink-0">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {language === 'vi' ? 'Đã cọc' : 'Deposit'}
                              </p>
                              <p className="font-semibold text-success">
                                {order.depositAmount.toLocaleString('vi-VN')}đ
                              </p>
                              <p className="text-lg font-bold text-foreground">
                                {order.totalAmount.toLocaleString('vi-VN')}đ
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/listing/${order.listing.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
                              </Link>
                            </Button>
                          </div>
                        </div>

                        {/* Progress Steps */}
                        {!['cancelled', 'disputed'].includes(effectiveStatus) && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between text-xs">
                              {[
                                { key: 'soft_reserved', label: language === 'vi' ? 'Reserve' : 'Reserve' },
                                { key: 'inspection_scheduled', label: language === 'vi' ? 'Kiểm định' : 'Inspect' },
                                { key: 'pending_payment', label: language === 'vi' ? 'Thanh toán' : 'Pay' },
                                { key: 'delivered', label: language === 'vi' ? 'Đã giao' : 'Delivered' },
                                { key: 'pending_confirmation', label: language === 'vi' ? 'Xác nhận' : 'Confirm' },
                                { key: 'completed', label: language === 'vi' ? 'Hoàn thành' : 'Completed' },
                              ].map((step, i, arr) => {
                                const stepOrder = ['pending_deposit', 'soft_reserved', 'inspection_scheduled', 'inspection_completed', 'pending_payment', 'delivered', 'pending_confirmation', 'completed']
                                const currentIndex = stepOrder.indexOf(effectiveStatus)
                                const stepIndex = stepOrder.indexOf(step.key)
                                const isCompleted = stepIndex <= currentIndex
                                const isCurrent = step.key === effectiveStatus

                                return (
                                  <div key={step.key} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                      <div className={cn(
                                        'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors',
                                        isCompleted 
                                          ? 'bg-success text-success-foreground' 
                                          : 'bg-muted text-muted-foreground',
                                        isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                      )}>
                                        {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                                      </div>
                                      <span className={cn(
                                        'mt-1',
                                        isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                      )}>
                                        {step.label}
                                      </span>
                                    </div>
                                    {i < arr.length - 1 && (
                                      <div className={cn(
                                        'h-0.5 w-12 mx-2',
                                        stepIndex < currentIndex ? 'bg-success' : 'bg-border'
                                      )} />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            ) : (
              <Card className="py-12">
                <div className="flex flex-col items-center text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'vi' ? 'Chưa có đơn hàng' : 'No orders yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'vi' 
                      ? 'Khám phá marketplace để tìm xe đạp phù hợp' 
                      : 'Explore the marketplace to find your perfect bike'}
                  </p>
                  <Button asChild>
                    <Link href="/">
                      {language === 'vi' ? 'Khám phá ngay' : 'Explore Now'}
                    </Link>
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
