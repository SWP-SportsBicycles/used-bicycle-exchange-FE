'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Star, 
  Package, 
  Clock
} from 'lucide-react'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { CITIES, MOCK_SELLER_ORDERS, formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const roleLabels: Record<string, { vi: string; en: string }> = {
  guest: { vi: 'Khách', en: 'Guest' },
  buyer: { vi: 'Người Mua', en: 'Buyer' },
  seller: { vi: 'Người Bán', en: 'Seller' },
  inspector: { vi: 'Kiểm Định Viên', en: 'Inspector' },
  admin: { vi: 'Quản Trị Viên', en: 'Admin' },
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const { language } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    city: user.city || '',
    address: user.address || '',
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Mock save
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      city: user.city || '',
      address: user.address || '',
    })
    setIsEditing(false)
  }

  // Mock transaction history
  const transactions = MOCK_SELLER_ORDERS.slice(0, 3)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
          <Card>
            <CardContent className="py-16 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'vi' ? 'Vui lòng đăng nhập' : 'Please login'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {language === 'vi'
                  ? 'Đăng nhập để quản lý hồ sơ cá nhân của bạn.'
                  : 'Sign in to manage your profile.'}
              </p>
              <Button asChild>
                <Link href="/auth/login?redirect=/profile">{language === 'vi' ? 'Đăng nhập' : 'Sign in'}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {language === 'vi' ? 'Tài Khoản' : 'Account'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'vi' ? 'Quản lý thông tin cá nhân' : 'Manage your personal information'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardContent className="pt-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold mb-1">{user.name}</h2>
                <Badge variant="outline" className="mb-4">
                  {roleLabels[user.role][language]}
                </Badge>

                {/* Stats for sellers */}
                {user.role === 'seller' && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border mt-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">{user.totalSales || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'vi' ? 'Đã bán' : 'Sold'}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">{user.rating || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'vi' ? 'Đánh giá' : 'Rating'}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatVND(user.walletBalance || 0).replace('₫', '')}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'vi' ? 'Số dư' : 'Balance'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats for inspectors */}
                {user.role === 'inspector' && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">{user.assignedInspections || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'vi' ? 'Đang chờ' : 'Assigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">{user.completedInspections || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'vi' ? 'Hoàn thành' : 'Completed'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{language === 'vi' ? 'Thông Tin Cá Nhân' : 'Personal Information'}</CardTitle>
                  <CardDescription>
                    {language === 'vi' ? 'Cập nhật thông tin liên hệ của bạn' : 'Update your contact information'}
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {language === 'vi' ? 'Sửa' : 'Edit'}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      {language === 'vi' ? 'Hủy' : 'Cancel'}
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      {language === 'vi' ? 'Lưu' : 'Save'}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="h-4 w-4 inline mr-2" />
                      {language === 'vi' ? 'Họ tên' : 'Full Name'}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-2" />
                      {language === 'vi' ? 'Số điện thoại' : 'Phone'}
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder={language === 'vi' ? 'Nhập số điện thoại' : 'Enter phone number'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      {language === 'vi' ? 'Thành phố' : 'City'}
                    </Label>
                    <Select 
                      value={formData.city} 
                      onValueChange={(value) => updateField('city', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'vi' ? 'Chọn thành phố' : 'Select city'} />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map((city) => (
                          <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    {language === 'vi' ? 'Địa chỉ' : 'Address'}
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    disabled={!isEditing}
                    placeholder={language === 'vi' ? 'Nhập địa chỉ đầy đủ' : 'Enter full address'}
                  />
                </div>

                {/* Account Security */}
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {language === 'vi' ? 'Bảo mật tài khoản' : 'Account Security'}
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="text-sm font-medium">
                        {language === 'vi' ? 'Mật khẩu' : 'Password'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'vi' ? 'Cập nhật lần cuối: 30 ngày trước' : 'Last updated: 30 days ago'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {language === 'vi' ? 'Đổi mật khẩu' : 'Change password'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {language === 'vi' ? 'Lịch Sử Giao Dịch' : 'Transaction History'}
              </CardTitle>
              <CardDescription>
                {language === 'vi' ? 'Các giao dịch gần đây' : 'Recent transactions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p>{language === 'vi' ? 'Chưa có giao dịch nào' : 'No transactions yet'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={tx.listing.images[0]} 
                            alt={tx.listing.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {tx.listing.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatVND(tx.totalAmount)}</p>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs',
                            tx.status === 'completed' 
                              ? 'bg-success/20 text-success' 
                              : 'bg-primary/20 text-primary'
                          )}
                        >
                          {tx.status === 'completed' 
                            ? (language === 'vi' ? 'Hoàn thành' : 'Completed')
                            : (language === 'vi' ? 'Đang xử lý' : 'Processing')
                          }
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
