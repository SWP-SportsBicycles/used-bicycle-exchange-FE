'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Wallet, 
  MapPin, 
  Shield, 
  Eye, 
  EyeOff,
  Loader2,
  AlertCircle,
  Edit
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export default function AccountDetailPage() {
  const { language } = useLanguage()
  const params = useParams()
  const userId = params.id as string
  const [showPassword, setShowPassword] = useState(false)

  const userQuery = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminApi.getUserById(userId),
  })

  const user = userQuery.data

  if (userQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (userQuery.error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">
          {language === 'vi' ? 'Không tìm thấy tài khoản' : 'Account not found'}
        </p>
        <Button asChild variant="outline">
          <Link href="/admin/manage/account">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Quay lại' : 'Go back'}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/manage/account">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
              {language === 'vi' ? 'Chi tiết tài khoản' : 'Account Details'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user.fullName}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Edit className="h-4 w-4" />
          {language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
        </Button>
      </div>

      {/* Main Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/60 shadow-athletic">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-32 w-32 rounded-2xl border-4 border-background shadow-lg">
                  <AvatarImage 
                    src={user.avtUrl} 
                    alt={user.fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl rounded-2xl">
                    {user.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Badge
                  variant="outline"
                  className={cn('text-xs', statusColors[user.status] || 'bg-gray-100')}
                >
                  {statusLabels[user.status]?.[language] || user.status}
                </Badge>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4 w-full">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {language === 'vi' ? 'Họ tên' : 'Full Name'}
                    </div>
                    <p className="font-medium text-lg">{user.fullName}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      {language === 'vi' ? 'Vai trò' : 'Role'}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-sm', roleColors[user.role] || 'bg-gray-100')}
                    >
                      {roleLabels[user.role]?.[language] || user.role}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {language === 'vi' ? 'Email' : 'Email'}
                    </div>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {language === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                    </div>
                    <p className="font-medium">{user.phoneNumber}</p>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      {language === 'vi' ? 'Số dư ví' : 'Wallet Balance'}
                    </div>
                    <p className="font-medium text-lg text-success">{formatVND(user.walletBalance)}</p>
                  </div>

                  {/* Password Field with Toggle */}
                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      {language === 'vi' ? 'Mật khẩu' : 'Password'}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 max-w-md">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={user.password}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md bg-muted text-sm font-mono"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="shrink-0"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Address Info */}
      {user.pickupAddress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {language === 'vi' ? 'Địa chỉ nhận hàng' : 'Pickup Address'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{language === 'vi' ? 'Địa chỉ' : 'Address'}</p>
                  <p className="font-medium">{user.pickupAddress}</p>
                </div>
                {user.pickupWardName && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{language === 'vi' ? 'Phường/Xã' : 'Ward'}</p>
                    <p className="font-medium">{user.pickupWardName}</p>
                  </div>
                )}
                {user.pickupDistrictName && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{language === 'vi' ? 'Quận/Huyện' : 'District'}</p>
                    <p className="font-medium">{user.pickupDistrictName}</p>
                  </div>
                )}
                {user.pickupProvinceName && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{language === 'vi' ? 'Tỉnh/Thành phố' : 'Province'}</p>
                    <p className="font-medium">{user.pickupProvinceName}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {language === 'vi' ? 'Thông tin bổ sung' : 'Additional Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {user.firebaseUID && (
              <div className="flex justify-between">
                <span>Firebase UID:</span>
                <span className="font-mono">{user.firebaseUID}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono">{user.id}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
