'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, MailCheck, ReceiptText, WalletCards } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { adminApi } from '@/lib/api/admin-api'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

const statusClass: Record<string, string> = {
  Locked: 'bg-destructive/15 text-destructive border-destructive/30',
  Confirmed: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  Completed: 'bg-success/15 text-success border-success/30',
}

const statusLabel: Record<string, { vi: string; en: string }> = {
  Locked: { vi: 'Đã khóa', en: 'Locked' },
  Confirmed: { vi: 'Đã xác nhận', en: 'Confirmed' },
  Completed: { vi: 'Hoàn thành', en: 'Completed' },
}

function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminOrderDetailPage() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const params = useParams<{ id: string }>()
  const orderId = params.id

  const orderQuery = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => adminApi.getOrderById(orderId),
    enabled: Boolean(orderId),
  })

  const notifyMutation = useMutation({
    mutationFn: () => adminApi.notifySeller(orderId),
    onSuccess: () => {
      toast({
        title: language === 'vi' ? 'Thành công' : 'Success',
        description: language === 'vi' ? 'Đã gửi email thông báo cho người bán.' : 'Seller notification email sent.',
      })
      orderQuery.refetch()
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: language === 'vi' ? 'Đã duyệt rồi' : 'Already processed',
        description: language === 'vi' ? 'Thông báo này đã được gửi trước đó.' : 'This notification was already sent.',
      })
    },
  })

  const payoutMutation = useMutation({
    mutationFn: () => adminApi.confirmPayout(orderId),
    onSuccess: () => {
      toast({
        title: language === 'vi' ? 'Thành công' : 'Success',
        description: language === 'vi' ? 'Đã xác nhận giải ngân thành công.' : 'Payout confirmed successfully.',
      })
      orderQuery.refetch()
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: language === 'vi' ? 'Đã duyệt rồi' : 'Already processed',
        description: language === 'vi' ? 'Đơn hàng này đã được giải ngân trước đó.' : 'This order has already been paid out.',
      })
    },
  })

  const order = orderQuery.data
  const canProcessCompleted = order?.status === 'Completed'
  const isPayoutDone = Boolean(order?.paidOutAt)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/order">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            {language === 'vi' ? 'Chi tiết đơn hàng' : 'Order details'}
          </h1>
        </div>
      </div>

      {orderQuery.isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : orderQuery.error || !order ? (
        <Card>
          <CardContent className="py-10 text-center text-destructive">
            {language === 'vi' ? 'Không tìm thấy thông tin đơn hàng.' : 'Order information not found.'}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5" />
                {language === 'vi' ? 'Thông tin đơn hàng' : 'Order information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{language === 'vi' ? 'Xe' : 'Bike'}</span>
                <span>{order.bikeTitle || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{language === 'vi' ? 'Người bán' : 'Seller'}</span>
                <span>{order.sellerName || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{language === 'vi' ? 'Tổng tiền' : 'Total amount'}</span>
                <span className="font-semibold">{formatVND(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{language === 'vi' ? 'Trạng thái' : 'Status'}</span>
                <Badge variant="outline" className={cn('text-xs', statusClass[order.status] || 'bg-muted')}>
                  {statusLabel[order.status]?.[language] || order.status}
                </Badge>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{language === 'vi' ? 'Thời gian hoàn tất' : 'Completed at'}</span>
                <span>{order.completedAt ? new Date(order.completedAt).toLocaleString('vi-VN') : '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{language === 'vi' ? 'Thời gian giải ngân' : 'Paid out at'}</span>
                <span>{order.paidOutAt ? new Date(order.paidOutAt).toLocaleString('vi-VN') : '-'}</span>
              </div>
            </CardContent>
          </Card>

          {canProcessCompleted ? (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>{language === 'vi' ? 'Xử lý đơn hàng thành công' : 'Completed order actions'}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  onClick={() => notifyMutation.mutate()}
                  disabled={notifyMutation.isPending}
                  className="gap-2"
                >
                  {notifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
                  {language === 'vi' ? 'Đơn hàng thành công' : 'Notify successful order'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => payoutMutation.mutate()}
                  disabled={payoutMutation.isPending || isPayoutDone}
                  className="gap-2"
                >
                  {payoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletCards className="h-4 w-4" />}
                  {isPayoutDone
                    ? language === 'vi'
                      ? 'Đã duyệt rồi'
                      : 'Already processed'
                    : language === 'vi'
                      ? 'Giải ngân'
                      : 'Confirm payout'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                {language === 'vi'
                  ? 'Chỉ đơn hàng ở trạng thái Hoàn thành mới được thao tác Đơn hàng thành công và Giải ngân.'
                  : 'Only Completed orders can run successful-order and payout actions.'}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
