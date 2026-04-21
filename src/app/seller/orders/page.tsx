'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, Search, Eye, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

import { useSellerOrders } from '@/modules/seller/hooks/useSellerOrders'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLanguage } from '@/lib/language-context'
import { ORDER_STATUS_LABELS, formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  pending_seller_confirm: 'bg-yellow-500/15 text-yellow-600',
  seller_confirmed: 'bg-blue-500/15 text-blue-600',
  pending_inspection: 'bg-blue-500/15 text-blue-600',
  inspection_passed: 'bg-green-500/15 text-green-600',
  inspection_failed: 'bg-red-500/15 text-red-600',
  shipping: 'bg-purple-500/15 text-purple-600',
  delivered: 'bg-green-500/15 text-green-600',
  completed: 'bg-[#407F3E]/15 text-[#407F3E]',
  cancelled: 'bg-destructive/20 text-destructive',
}

const TABS = [
  { value: 'all', label: { vi: 'Tất cả', en: 'All' } },
  { value: 'pending_seller_confirm', label: { vi: 'Chờ xác nhận', en: 'Pending Confirm' } },
  { value: 'shipping', label: { vi: 'Đang giao', en: 'Shipping' } },
  { value: 'completed', label: { vi: 'Hoàn thành', en: 'Completed' } },
]

export default function SellerOrdersPage() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  const { data: response, isLoading, isError } = useSellerOrders({ page, size: 10 })

  // Extract orders dynamically dealing with common nested backend responses
  const orders = Array.isArray(response) 
    ? response 
    : (response as any)?.data 
      ? Array.isArray((response as any).data) ? (response as any).data : (response as any).data.items || []
      : (response as any)?.items || []

  // Filter local for now if not supported via API
  const filteredOrders = orders.filter((order: any) => {
    if (activeTab !== 'all' && order.status !== activeTab) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const titleMatch = order.listing?.title?.toLowerCase().includes(searchLower)
      const buyerMatch = order.buyer?.name?.toLowerCase().includes(searchLower)
      const codeMatch = order.id?.toLowerCase().includes(searchLower)
      return titleMatch || buyerMatch || codeMatch
    }
    return true
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {language === 'vi' ? 'Quản Lý Đơn Hàng' : 'Order Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'vi' ? 'Theo dõi và xử lý các đơn hàng của bạn' : 'Track and process your orders'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto overflow-x-auto">
              <TabsList className="w-full sm:w-auto flex-nowrap shrink-0">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-sm">
                    {tab.label[language]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-80 shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={language === 'vi' ? 'Tìm kiếm đơn hàng...' : 'Search orders...'}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'vi' ? 'Mã Đơn' : 'Order ID'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Sản Phẩm' : 'Product'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Người Mua' : 'Buyer'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Ngày Đặt' : 'Date'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Tổng Tiền' : 'Total'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Trạng Thái' : 'Status'}</TableHead>
                  <TableHead className="text-right">{language === 'vi' ? 'Thao Tác' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      {language === 'vi' ? 'Đang tải dữ liệu...' : 'Loading...'}
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-destructive">
                      {language === 'vi' ? 'Lỗi khi tải dữ liệu đơn hàng' : 'Failed to load orders'}
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      {language === 'vi' ? 'Không tìm thấy đơn hàng nào' : 'No orders found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order: any) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-xs">
                        #{order.id?.substring(0, 8).toUpperCase() || 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {order.listing?.title || order.listingTitle || 'Unknown Product'}
                      </TableCell>
                      <TableCell>{order.buyer?.name || order.buyerName || 'Unknown Buyer'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {order.createdAt 
                          ? format(new Date(order.createdAt), 'dd MMM yyyy', { locale: language === 'vi' ? vi : enUS }) 
                          : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatVND(order.totalAmount || order.price || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('capitalize whitespace-nowrap text-xs', statusColors[order.status] || 'bg-muted text-muted-foreground')}
                        >
                          {(ORDER_STATUS_LABELS as Record<string, { vi: string, en: string }>)[order.status]?.[language as 'vi' | 'en'] || order.status?.replace(/_/g, ' ') || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/seller/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            {language === 'vi' ? 'Chi tiết' : 'View'}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-end space-x-2 py-4">
             <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                {language === 'vi' ? 'Trước' : 'Previous'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={orders.length < 10 || isLoading}
              >
                {language === 'vi' ? 'Sau' : 'Next'}
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
