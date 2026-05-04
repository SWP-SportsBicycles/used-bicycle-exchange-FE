'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, Eye, Loader2, UserCheck, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLanguage } from '@/lib/language-context'
import { adminApi } from '@/lib/api/admin-api'
import { cn } from '@/lib/utils'

const roleColors: Record<string, string> = {
  BUYER: 'bg-blue-100 text-blue-700 border-blue-300/60 dark:bg-blue-900/30 dark:text-blue-400',
  SELLER: 'bg-emerald-100 text-emerald-700 border-emerald-300/60 dark:bg-emerald-900/30 dark:text-emerald-400',
  ADMIN: 'bg-rose-100 text-rose-700 border-rose-300/60 dark:bg-rose-900/30 dark:text-rose-400',
  INSPECTOR: 'bg-violet-100 text-violet-700 border-violet-300/60 dark:bg-violet-900/30 dark:text-violet-400',
}

const roleLabels: Record<string, { vi: string; en: string }> = {
  BUYER: { vi: 'Người mua', en: 'Buyer' },
  SELLER: { vi: 'Người bán', en: 'Seller' },
  ADMIN: { vi: 'Quản trị', en: 'Admin' },
  INSPECTOR: { vi: 'Kiểm định viên', en: 'Inspector' },
}

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-300/60 dark:bg-emerald-900/30 dark:text-emerald-400',
  InActive: 'bg-gray-100 text-gray-600 border-gray-300/60 dark:bg-gray-800/30 dark:text-gray-400',
  Banned: 'bg-rose-100 text-rose-700 border-rose-300/60 dark:bg-rose-900/30 dark:text-rose-400',
}

const statusLabels: Record<string, { vi: string; en: string }> = {
  Active: { vi: 'Hoạt động', en: 'Active' },
  InActive: { vi: 'Chưa kích hoạt', en: 'Inactive' },
  Banned: { vi: 'Bị cấm', en: 'Banned' },
}

type UserFilter = 'all' | 'seller' | 'buyer'

export default function AccountManagementPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState<UserFilter>('all')

  const usersQuery = useQuery({
    queryKey: ['admin-users', userFilter],
    queryFn: () => {
      if (userFilter === 'seller') return adminApi.getSellerUsers()
      if (userFilter === 'buyer') return adminApi.getBuyerUsers()
      return adminApi.getUsers()
    },
  })

  const allCountQuery = useQuery({
    queryKey: ['admin-users-total-count'],
    queryFn: adminApi.getUsersTotalCount,
  })

  const sellerCountQuery = useQuery({
    queryKey: ['admin-sellers-total-count'],
    queryFn: adminApi.getSellerUsersTotalCount,
  })

  const buyerCountQuery = useQuery({
    queryKey: ['admin-buyers-total-count'],
    queryFn: adminApi.getBuyerUsersTotalCount,
  })

  const filteredUsers = (usersQuery.data || []).filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phoneNumber ?? '').includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filterTabs: { key: UserFilter; label: { vi: string; en: string }; count: number; tone?: string }[] = [
    { key: 'all', label: { vi: 'Tất cả', en: 'All' }, count: allCountQuery.data ?? 0 },
    { key: 'seller', label: { vi: 'Người bán', en: 'Sellers' }, count: sellerCountQuery.data ?? 0, tone: 'emerald' },
    { key: 'buyer', label: { vi: 'Người mua', en: 'Buyers' }, count: buyerCountQuery.data ?? 0, tone: 'blue' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            {language === 'vi' ? 'Quản Lý Tài Khoản' : 'Account Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'vi'
              ? 'Quản lý và xem thông tin tất cả tài khoản người dùng'
              : 'Manage and view all user account information'}
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1.5">
          <Users className="h-3.5 w-3.5 mr-1.5" />
          {filteredUsers.length} {language === 'vi' ? 'tài khoản' : 'accounts'}
        </Badge>
      </div>

      {/* Filters + Search */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => {
              const isActive = userFilter === tab.key
              return (
                <Button
                  key={tab.key}
                  type="button"
                  size="sm"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setUserFilter(tab.key)}
                  className={cn(
                    !isActive && 'bg-background',
                    isActive && tab.tone === 'emerald' && 'bg-emerald-600 hover:bg-emerald-700',
                    isActive && tab.tone === 'blue' && 'bg-blue-600 hover:bg-blue-700',
                  )}
                >
                  {tab.label[language]} ({tab.count})
                </Button>
              )
            })}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'vi' ? 'Tìm kiếm theo tên, số điện thoại, email...' : 'Search by name, phone, email...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{language === 'vi' ? 'Danh sách tài khoản' : 'Account List'}</CardTitle>
                <CardDescription>
                  {language === 'vi'
                    ? 'Nhấn vào nút Xem để kiểm tra chi tiết tài khoản'
                    : 'Click View to check account details'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : usersQuery.error ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShieldAlert className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm text-destructive">{language === 'vi' ? 'Có lỗi xảy ra khi tải dữ liệu' : 'Error loading data'}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <UserCheck className="h-12 w-12 mb-3 opacity-30" />
                <p className="font-medium">{language === 'vi' ? 'Không tìm thấy tài khoản nào' : 'No accounts found'}</p>
                {searchTerm && (
                  <p className="text-sm mt-1">{language === 'vi' ? 'Thử tìm kiếm với từ khóa khác' : 'Try a different search term'}</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-14 font-semibold">#</TableHead>
                      <TableHead className="font-semibold">{language === 'vi' ? 'Họ tên' : 'Full Name'}</TableHead>
                      <TableHead className="font-semibold">{language === 'vi' ? 'Số điện thoại' : 'Phone'}</TableHead>
                      <TableHead className="font-semibold">{language === 'vi' ? 'Vai trò' : 'Role'}</TableHead>
                      <TableHead className="font-semibold">{language === 'vi' ? 'Trạng thái' : 'Status'}</TableHead>
                      <TableHead className="text-right font-semibold">{language === 'vi' ? 'Thao tác' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell className="text-sm">{user.phoneNumber || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', roleColors[user.role] || 'bg-gray-100')}
                          >
                            {roleLabels[user.role]?.[language] || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.status ? (
                            <Badge
                              variant="outline"
                              className={cn('text-xs', statusColors[user.status] ?? 'bg-gray-100 text-gray-600 border-gray-200')}
                            >
                              {statusLabels[user.status]?.[language] ?? user.status}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild className="opacity-60 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/manage/account/${user.id}`} className="flex items-center gap-1.5">
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
      </motion.div>
    </div>
  )
}
