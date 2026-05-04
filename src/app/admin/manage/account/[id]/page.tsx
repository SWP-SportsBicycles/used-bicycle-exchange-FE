'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Wallet,
  MapPin, 
  Shield, 
  Loader2,
  AlertCircle,
  CalendarDays,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/lib/language-context'
import { adminApi } from '@/lib/api/admin-api'
import { cn } from '@/lib/utils'

const roleColors: Record<string, string> = {
  BUYER: 'bg-blue-100 text-blue-700 border-blue-200',
  SELLER: 'bg-green-100 text-green-700 border-green-200',
  ADMIN: 'bg-red-100 text-red-700 border-red-200',
  INSPECTOR: 'bg-purple-100 text-purple-700 border-purple-200',
}

const roleLabels: Record<string, { vi: string; en: string }> = {
  BUYER: { vi: 'Người mua', en: 'Buyer' },
  SELLER: { vi: 'Người bán', en: 'Seller' },
  ADMIN: { vi: 'Quản trị', en: 'Admin' },
  INSPECTOR: { vi: 'Kiểm định viên', en: 'Inspector' },
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
  const { toast } = useToast()
  const params = useParams()
  const userId = params.id as string
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState('')

  const userQuery = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminApi.getUserById(userId),
  })

  const user = userQuery.data
  const isBuyer = user?.role === 'BUYER'
  const isSeller = user?.role === 'SELLER'
  const hidePhone = isBuyer || isSeller
  const statusKey = user?.status === 'InActive' ? undefined : user?.status ?? (user?.isActive ? 'Active' : undefined)
  const isBanned = user?.status === 'Banned'
  const canSubmitBan = Boolean(banReason.trim())

  const banMutation = useMutation({
    mutationFn: (reason: string) => adminApi.banUser(userId, { reason }),
    onSuccess: () => {
      setIsBanDialogOpen(false)
      setBanReason('')
      toast({
        title: language === 'vi' ? 'Đã khóa tài khoản' : 'Account locked',
        description:
          language === 'vi'
            ? 'Tài khoản đã bị khóa thành công.'
            : 'The account has been locked successfully.',
      })
      userQuery.refetch()
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: language === 'vi' ? 'Khóa thất bại' : 'Lock failed',
        description:
          language === 'vi'
            ? 'Không thể khóa tài khoản này. Vui lòng thử lại.'
            : 'Unable to lock this account. Please try again.',
      })
    },
  })

  const unbanMutation = useMutation({
    mutationFn: () => adminApi.unbanUser(userId),
    onSuccess: () => {
      toast({
        title: language === 'vi' ? 'Đã mở khóa tài khoản' : 'Account unlocked',
        description:
          language === 'vi'
            ? 'Tài khoản đã được mở khóa thành công.'
            : 'The account has been unlocked successfully.',
      })
      userQuery.refetch()
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: language === 'vi' ? 'Mở khóa thất bại' : 'Unlock failed',
        description:
          language === 'vi'
            ? 'Không thể mở khóa tài khoản này. Vui lòng thử lại.'
            : 'Unable to unlock this account. Please try again.',
      })
    },
  })

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
        <Badge variant="outline" className="gap-2">
          <CalendarDays className="h-3.5 w-3.5" />
          {user.createdAt
            ? new Date(user.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')
            : '-'}
        </Badge>
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
                {statusKey && (
                  <Badge
                    variant="outline"
                    className={cn('text-xs', statusColors[statusKey] || 'bg-gray-100')}
                  >
                    {statusLabels[statusKey]?.[language] || statusKey}
                  </Badge>
                )}
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

                  {!hidePhone && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {language === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                      </div>
                      <p className="font-medium">{user.phoneNumber || '-'}</p>
                    </div>
                  )}

                  {(isSeller || (!isBuyer && !isSeller)) && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wallet className="h-4 w-4" />
                        {language === 'vi' ? 'Tổng doanh thu' : 'Total Revenue'}
                      </div>
                      <p className="font-medium text-lg text-success">{formatVND(user.totalRevenue || 0)}</p>
                    </div>
                  )}

                  {(isBuyer || (!isBuyer && !isSeller)) && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wallet className="h-4 w-4" />
                        {language === 'vi' ? 'Tổng chi tiêu' : 'Total Spent'}
                      </div>
                      <p className="font-medium text-lg">{formatVND(user.totalSpent || 0)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {language === 'vi' ? 'Thực hiện hành động' : 'Take action'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="destructive"
                onClick={() => setIsBanDialogOpen(true)}
                disabled={banMutation.isPending || isBanned}
              >
                {banMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'vi' ? 'Khóa tài khoản' : 'Lock account'}
              </Button>
              <Button
                className="bg-success text-success-foreground hover:bg-success/90"
                onClick={() => unbanMutation.mutate()}
                disabled={unbanMutation.isPending || !isBanned}
              >
                {unbanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'vi' ? 'Mở khóa tài khoản' : 'Unlock account'}
              </Button>
            </div>
            {isBanned && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle />
                <AlertTitle>{language === 'vi' ? 'Tài khoản đang bị khóa' : 'Account is locked'}</AlertTitle>
                <AlertDescription>
                  {language === 'vi'
                    ? 'Tài khoản này đã bị khóa. Vui lòng mở khóa nếu cần khôi phục hoạt động.'
                    : 'This account is currently locked. Unlock it to restore access.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'vi' ? 'Khóa tài khoản' : 'Lock account'}</DialogTitle>
            <DialogDescription>
              Nhập lý do khóa tài khoản
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'vi' ? 'Lý do' : 'Reason'}
            </label>
            <Textarea
              rows={4}
              value={banReason}
              onChange={(event) => setBanReason(event.target.value)}
              placeholder={
                language === 'vi'
                  ? 'VD: Vi phạm chính sách, nghi ngờ gian lận...'
                  : 'E.g., Policy violation, suspected fraud...'
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => banMutation.mutate(banReason.trim())}
              disabled={banMutation.isPending || !canSubmitBan}
            >
              {banMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {language === 'vi' ? 'Xác nhận khóa' : 'Confirm lock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Info */}
      {(user.pickupAddress || user.senderAddress) && (
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
                  <p className="font-medium">{user.senderAddress || user.pickupAddress}</p>
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
            {!hidePhone && (
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="font-mono">{user.id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{language === 'vi' ? 'Tổng đơn hàng:' : 'Total orders:'}</span>
              <span>{user.totalOrders ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>{language === 'vi' ? 'Đơn hoàn tất:' : 'Completed orders:'}</span>
              <span>{user.completedOrders ?? 0}</span>
            </div>
            {isSeller && (
              <div className="flex justify-between">
                <span>{language === 'vi' ? 'Tổng listings:' : 'Total listings:'}</span>
                <span>{user.totalListings ?? 0}</span>
              </div>
            )}
            {(user.bankName || user.bankAccountNumber || user.bankAccountName) && (
              <div className="pt-2 border-t border-border">
                <p className="font-medium text-foreground mb-1">{language === 'vi' ? 'Thông tin ngân hàng' : 'Bank Information'}</p>
                <p>{user.bankName || '-'}</p>
                <p>{user.bankAccountName || '-'}</p>
                <p>{user.bankAccountNumber || '-'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
