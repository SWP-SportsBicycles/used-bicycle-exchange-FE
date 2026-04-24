'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Eye, Loader2, ReceiptText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

export default function AdminOrderPage() {
  const { language } = useLanguage()
  const ordersQuery = useQuery({
    queryKey: ['admin-orders', 1, 10],
    queryFn: () => adminApi.getOrders({ page: 1, size: 10 }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
          {language === 'vi' ? 'Kiểm duyệt đơn hàng' : 'Order Review'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === 'vi' ? 'Danh sách đơn hàng theo trạng thái giao dịch' : 'Orders grouped by transaction status'}
        </p>
      </div>

      <Card className="border-border/60 shadow-athletic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5" />
            {language === 'vi' ? 'Danh sách đơn hàng' : 'Order list'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' ? 'Nhấn vào nút Xem để xử lý chi tiết đơn hàng' : 'Open details to process order actions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ordersQuery.isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : ordersQuery.error ? (
            <div className="text-sm text-destructive py-8 text-center">
              {language === 'vi' ? 'Không thể tải danh sách đơn hàng.' : 'Unable to load order list.'}
            </div>
          ) : (ordersQuery.data ?? []).length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              {language === 'vi' ? 'Chưa có đơn hàng.' : 'No orders found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{language === 'vi' ? 'Xe' : 'Bike'}</TableHead>
                    <TableHead>{language === 'vi' ? 'Người bán' : 'Seller'}</TableHead>
                    <TableHead>{language === 'vi' ? 'Tổng tiền' : 'Total amount'}</TableHead>
                    <TableHead>{language === 'vi' ? 'Trạng thái' : 'Status'}</TableHead>
                    <TableHead className="text-right">{language === 'vi' ? 'Thao tác' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ordersQuery.data ?? []).map((order, index) => (
                    <TableRow key={order.orderId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{order.bikeTitle || '-'}</TableCell>
                      <TableCell>{order.sellerName || '-'}</TableCell>
                      <TableCell className="font-medium">{formatVND(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs', statusClass[order.status] || 'bg-muted')}>
                          {statusLabel[order.status]?.[language] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/order/${order.orderId}`} className="gap-1">
                            <Eye className="h-4 w-4" />
                            {language === 'vi' ? 'Xem' : 'View'}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
