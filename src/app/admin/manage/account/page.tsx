'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, Eye, Loader2 } from 'lucide-react'
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
import { useState } from 'react'

const roleColors: Record<string, string> = {
  Buyer: 'bg-blue-100 text-blue-700 border-blue-200',
  Seller: 'bg-green-100 text-green-700 border-green-200',
  Admin: 'bg-red-100 text-red-700 border-red-200',
  Inspector: 'bg-purple-100 text-purple-700 border-purple-200',
}

const roleLabels: Record<string, { vi: string; en: string }> = {
  Buyer: { vi: 'Người mua', en: 'Buyer' },
  Seller: { vi: 'Người bán', en: 'Seller' },
  Admin: { vi: 'Quản trị', en: 'Admin' },
  Inspector: { vi: 'Kiểm định viên', en: 'Inspector' },
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700 border-green-200',
  InActive: 'bg-gray-100 text-gray-700 border-gray-200',
  Banned: 'bg-red-100 text-red-700 border-red-200',
}

const statusLabels: Record<string, { vi: string; en: string }> = {
  Active: { vi: 'Hoạt động', en: 'Active' },
  InActive: { vi: 'Chưa kích hoạt', en: 'Inactive' },
  Banned: { vi: 'Bị cấm', en: 'Banned' },
}

export default function AccountManagementPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  })

  const filteredUsers = (usersQuery.data || []).filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            {language === 'vi' ? 'Quản lý tài khoản' : 'Account Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'vi'
              ? 'Quản lý và xem thông tin tất cả tài khoản người dùng'
              : 'Manage and view all user account information'}
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/30 bg-primary/5 text-primary font-medium">
          <Users className="h-3.5 w-3.5 mr-1.5" />
          {filteredUsers.length} {language === 'vi' ? 'tài khoản' : 'accounts'}
        </Badge>
      </div>

      {/* Search */}
      <Card className="border-border/60">
        <CardContent className="p-4">
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
        <Card className="border-border/60 shadow-athletic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {language === 'vi' ? 'Danh sách tài khoản' : 'Account List'}
            </CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'Nhấn vào hàng để xem chi tiết tài khoản'
                : 'Click on a row to view account details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : usersQuery.error ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'vi' ? 'Có lỗi xảy ra khi tải dữ liệu' : 'Error loading data'}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'vi' ? 'Không tìm thấy tài khoản nào' : 'No accounts found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>{language === 'vi' ? 'Họ tên' : 'Full Name'}</TableHead>
                      <TableHead>{language === 'vi' ? 'Số điện thoại' : 'Phone Number'}</TableHead>
                      <TableHead>{language === 'vi' ? 'Vai trò' : 'Role'}</TableHead>
                      <TableHead>{language === 'vi' ? 'Trạng thái' : 'Status'}</TableHead>
                      <TableHead className="text-right">{language === 'vi' ? 'Thao tác' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', roleColors[user.role] || 'bg-gray-100')}
                          >
                            {roleLabels[user.role]?.[language] || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', statusColors[user.status] || 'bg-gray-100')}
                          >
                            {statusLabels[user.status]?.[language] || user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/manage/account/${user.id}`} className="flex items-center gap-1">
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
