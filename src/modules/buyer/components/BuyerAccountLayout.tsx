'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { LayoutDashboard, ShoppingBag, Heart, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function BuyerAccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  let navItems = [
    { name: 'Tổng quan', href: '/buyer', icon: LayoutDashboard },
    { name: 'Đơn hàng của tôi', href: '/buyer/orders', icon: ShoppingBag },
    { name: 'Xe đạp yêu thích', href: '/buyer/wishlist', icon: Heart },
    { name: 'Cài đặt tài khoản', href: '/profile', icon: Settings },
  ]

  if (user?.role === 'seller') {
    navItems = [
      { name: 'Tổng quan', href: '/seller', icon: LayoutDashboard },
      { name: 'Tin đăng', href: '/seller/listings', icon: ShoppingBag },
      { name: 'Cài đặt tài khoản', href: '/profile', icon: Settings },
    ]
  } else if (user?.role === 'admin') {
    navItems = [
      { name: 'Bảng điều khiển', href: '/admin', icon: LayoutDashboard },
      { name: 'Cài đặt tài khoản', href: '/profile', icon: Settings },
    ]
  } else if (user?.role === 'inspector') {
    navItems = [
      { name: 'Cổng kiểm định', href: '/inspector', icon: LayoutDashboard },
      { name: 'Cài đặt tài khoản', href: '/profile', icon: Settings },
    ]
  }

  const firstName = user?.name?.split(' ').pop() || user?.name || 'Bạn'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24 rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
                <Avatar className="h-12 w-12 border border-border shadow-sm">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=aee86c&color=1a1a1a`} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {firstName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate" style={{ fontFamily: 'var(--font-archivo)' }}>
                    {user?.name || 'Người dùng'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  return (item as any).disabled ? (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
