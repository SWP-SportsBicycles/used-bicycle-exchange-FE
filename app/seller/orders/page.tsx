'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'
import { MOCK_SELLER_ORDERS, ORDER_STATUS_LABELS, formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  pending_deposit: 'bg-muted text-muted-foreground',
  soft_reserved: 'bg-[#407F3E]/15 text-[#407F3E]',
  inspection_scheduled: 'bg-accent/20 text-accent-foreground',
  inspection_completed: 'bg-[#407F3E]/15 text-[#407F3E]',
  pending_payment: 'bg-[#407F3E]/15 text-[#407F3E]',
  delivered: 'bg-[#407F3E]/15 text-[#407F3E]',
  pending_confirmation: 'bg-[#407F3E]/15 text-[#407F3E]',
  completed: 'bg-[#407F3E]/15 text-[#407F3E]',
  cancelled: 'bg-destructive/20 text-destructive',
  disputed: 'bg-destructive/20 text-destructive',
}

export default function SellerOrdersPage() {
  const { language } = useLanguage()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{language === 'vi' ? 'Đơn Hàng Gần Đây' : 'Recent Orders'}</CardTitle>
          <CardDescription>
            {language === 'vi' ? 'Cập nhật mới nhất' : 'Latest updates'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/seller" className="gap-1">
            {language === 'vi' ? 'Xem tổng quan' : 'View overview'}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="premium-subpanel mb-4 grid gap-3 border border-border/60 bg-gradient-to-r from-[#f7fbf7] via-white to-[#f3f8f2] p-4 sm:grid-cols-3">
          <div>
            <p className="metric-label">{language === 'vi' ? 'Dang xu ly' : 'In motion'}</p>
            <p className="metric-value">{MOCK_SELLER_ORDERS.filter((order) => !['completed', 'cancelled'].includes(order.status)).length}</p>
          </div>
          <div>
            <p className="metric-label">{language === 'vi' ? 'Buyer dang doi' : 'Buyer waiting'}</p>
            <p className="metric-value">{MOCK_SELLER_ORDERS.filter((order) => ['pending_deposit', 'inspection_scheduled', 'pending_payment'].includes(order.status)).length}</p>
          </div>
          <div>
            <p className="metric-label">{language === 'vi' ? 'Tam nhin' : 'Operational cue'}</p>
            <p className="text-sm font-medium text-foreground">{language === 'vi' ? 'Theo doi timeline va giu phan hoi nhanh' : 'Watch timing and keep response times tight'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {MOCK_SELLER_ORDERS.map((order) => (
            <Link
              href={`/transaction/${order.listing.id}`}
              key={order.id}
              className="flex items-center gap-4 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={order.buyer.avatar} alt={order.buyer.name} />
                <AvatarFallback>{order.buyer.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{order.listing.title}</p>
                <p className="text-xs text-muted-foreground">{order.buyer.name}</p>
              </div>

              <div className="text-right">
                <Badge variant="outline" className={cn('text-xs', statusColors[order.status])}>
                  {ORDER_STATUS_LABELS[order.status][language]}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">{formatVND(order.depositAmount)}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
