'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Eye, Loader2, ReceiptText, ChevronLeft, ChevronRight, Package } from 'lucide-react'
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
  Pending: 'bg-amber-100 text-amber-700 border-amber-300/60 dark:bg-amber-900/30 dark:text-amber-400',
  pending: 'bg-amber-100 text-amber-700 border-amber-300/60 dark:bg-amber-900/30 dark:text-amber-400',
  Paid: 'bg-blue-100 text-blue-700 border-blue-300/60 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-blue-100 text-blue-700 border-blue-300/60 dark:bg-blue-900/30 dark:text-blue-400',
  Shipping: 'bg-sky-100 text-sky-700 border-sky-300/60 dark:bg-sky-900/30 dark:text-sky-400',
  shipping: 'bg-sky-100 text-sky-700 border-sky-300/60 dark:bg-sky-900/30 dark:text-sky-400',
  Delivered: 'bg-teal-100 text-teal-700 border-teal-300/60 dark:bg-teal-900/30 dark:text-teal-400',
  delivered: 'bg-teal-100 text-teal-700 border-teal-300/60 dark:bg-teal-900/30 dark:text-teal-400',
  Locked: 'bg-rose-100 text-rose-700 border-rose-300/60 dark:bg-rose-900/30 dark:text-rose-400',
  Confirmed: 'bg-amber-100 text-amber-700 border-amber-300/60 dark:bg-amber-900/30 dark:text-amber-400',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-300/60 dark:bg-emerald-900/30 dark:text-emerald-400',
  Cancelled: 'bg-rose-100 text-rose-700 border-rose-300/60 dark:bg-rose-900/30 dark:text-rose-400',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-300/60 dark:bg-rose-900/30 dark:text-rose-400',
  Disputed: 'bg-orange-100 text-orange-700 border-orange-300/60 dark:bg-orange-900/30 dark:text-orange-400',
  disputed: 'bg-orange-100 text-orange-700 border-orange-300/60 dark:bg-orange-900/30 dark:text-orange-400',
}

const statusLabel: Record<string, { vi: string; en: string }> = {
  Pending: { vi: 'Chờ xử lý', en: 'Pending' },
  pending: { vi: 'Chờ xử lý', en: 'Pending' },
  Paid: { vi: 'Đã thanh toán', en: 'Paid' },
  paid: { vi: 'Đã thanh toán', en: 'Paid' },
  Shipping: { vi: 'Đang giao hàng', en: 'Shipping' },
  shipping: { vi: 'Đang giao hàng', en: 'Shipping' },
  Delivered: { vi: 'Đã giao hàng', en: 'Delivered' },
  delivered: { vi: 'Đã giao hàng', en: 'Delivered' },
  Locked: { vi: 'Đã khóa', en: 'Locked' },
  Confirmed: { vi: 'Đã xác nhận', en: 'Confirmed' },
  Completed: { vi: 'Hoàn thành', en: 'Completed' },
  Cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
  cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
  Disputed: { vi: 'Khiếu nại', en: 'Disputed' },
  disputed: { vi: 'Khiếu nại', en: 'Disputed' },
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
  const [page, setPage] = useState(1)
  const pageSize = 10

  const ordersQuery = useQuery({
    queryKey: ['admin-orders', page, pageSize],
    queryFn: () => adminApi.getOrders({ page, size: pageSize }),
  })

  const orders = ordersQuery.data ?? []
  const isLastPage = orders.length < pageSize

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            {language === 'vi' ? 'Kiểm Duyệt Đơn Hàng' : 'Order Review'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'vi' ? 'Danh sách đơn hàng theo trạng thái giao dịch' : 'Orders grouped by transaction status'}
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1.5">
          <ReceiptText className="h-3.5 w-3.5 mr-1.5" />
          {orders.length} {language === 'vi' ? 'đơn hàng' : 'orders'}
        </Badge>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{language === 'vi' ? 'Danh sách đơn hàng' : 'Order List'}</CardTitle>
                <CardDescription>
                  {language === 'vi' ? 'Nhấn vào nút Xem để xử lý chi tiết đơn hàng' : 'Open details to process order actions'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {ordersQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : ordersQuery.error ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm text-destructive">{language === 'vi' ? 'Không thể tải danh sách đơn hàng.' : 'Unable to load order list.'}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-30" />
                <p className="font-medium">{language === 'vi' ? 'Chưa có đơn hàng.' : 'No orders found.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-14 font-semibold">#</TableHead>
                      <TableHead className="font-semibold">{language === 'vi' ? 'Xe' : 'Bike'}</TableHead>
                      <TableHead className="font-semibold">{language === 'vi' ? 'Người bán' : 'Seller'}</TableHead>
                      <TableHead className="font-semibold">{language === 'vi' ? 'Tổng tiền' : 'Total'}</TableHead>
                      <TableHead className="font-semibold">{language === 'vi' ? 'Trạng thái' : 'Status'}</TableHead>
                      <TableHead className="text-right font-semibold">{language === 'vi' ? 'Thao tác' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, index) => (
                      <TableRow
                        key={order.orderId}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <TableCell className="font-medium text-muted-foreground">{(page - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="font-medium max-w-48 truncate">{order.bikeTitle || '-'}</TableCell>
                        <TableCell>{order.sellerName || '-'}</TableCell>
                        <TableCell className="font-semibold text-primary">{formatVND(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs', statusClass[order.status] || 'bg-muted')}>
                            {statusLabel[order.status]?.[language] || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild className="opacity-60 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/order/${order.orderId}`} className="gap-1.5">
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

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Trang' : 'Page'} {page}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || ordersQuery.isFetching}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {language === 'vi' ? 'Trước' : 'Prev'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLastPage || ordersQuery.isFetching}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  {language === 'vi' ? 'Sau' : 'Next'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
