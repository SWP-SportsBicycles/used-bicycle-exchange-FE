'use client'

import Link from 'next/link'
import { ArrowUpRight, TrendingUp, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'
import { MOCK_WALLET_TRANSACTIONS, formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function SellerWalletPage() {
  const { language } = useLanguage()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{language === 'vi' ? 'Giao Dịch Gần Đây' : 'Recent Transactions'}</CardTitle>
          <CardDescription>
            {language === 'vi' ? 'Lịch sử ví tiền' : 'Wallet history'}
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
            <p className="metric-label">{language === 'vi' ? 'Dong tien vao' : 'Cash-in'}</p>
            <p className="metric-value">{MOCK_WALLET_TRANSACTIONS.filter((tx) => tx.amount > 0).length}</p>
          </div>
          <div>
            <p className="metric-label">{language === 'vi' ? 'Moc da xac nhan' : 'Confirmed'}</p>
            <p className="metric-value">{MOCK_WALLET_TRANSACTIONS.filter((tx) => tx.status === 'completed').length}</p>
          </div>
          <div>
            <p className="metric-label">{language === 'vi' ? 'Goc nhin' : 'Payout read'}</p>
            <p className="text-sm font-medium text-foreground">{language === 'vi' ? 'Vi hien nhu mot bang dieu khien doanh thu' : 'Wallet reads more like a revenue console'}</p>
          </div>
        </div>

        <div className="space-y-3">
          {MOCK_WALLET_TRANSACTIONS.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between border-b border-border py-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    tx.amount > 0 ? 'bg-[#407F3E]/15' : 'bg-destructive/20'
                  )}
                >
                  {tx.amount > 0 ? (
                    <TrendingUp className="h-4 w-4 text-[#407F3E]" />
                  ) : (
                    <Wallet className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={cn('text-sm font-semibold', tx.amount > 0 ? 'text-[#407F3E]' : 'text-destructive')}>
                  {tx.amount > 0 ? '+' : ''}
                  {formatVND(tx.amount)}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    tx.status === 'completed'
                      ? 'bg-[#407F3E]/15 text-[#407F3E]'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tx.status === 'completed'
                    ? language === 'vi'
                      ? 'Hoàn thành'
                      : 'Completed'
                    : language === 'vi'
                      ? 'Đang xử lý'
                      : 'Pending'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
