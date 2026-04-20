'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Plus,
  ChevronRight 
} from 'lucide-react'
import { Header } from '@/components/header'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { 
    href: '/seller', 
    icon: LayoutDashboard, 
    label: { vi: 'Tổng Quan', en: 'Overview' },
    exact: true
  },
  { 
    href: '/seller/listings', 
    icon: Package, 
    label: { vi: 'Tin Đăng', en: 'Listings' }
  },
  { 
    href: '/seller/orders', 
    icon: ShoppingCart, 
    label: { vi: 'Đơn Hàng', en: 'Orders' }
  },
  { 
    href: '/seller/wallet', 
    icon: Wallet, 
    label: { vi: 'Ví Tiền', en: 'Wallet' }
  },
]

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { language } = useLanguage()

  return (
    <RoleGuard allow={['seller']}>
      <div className="min-h-screen bg-background">
        <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 bg-sidebar min-h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-4 border-b border-border/60">
            <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-archivo)' }}>
              {language === 'vi' ? 'Bảng Điều Khiển' : 'Seller Dashboard'}
            </h2>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href)
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-athletic' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label[language]}
                      {isActive && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-border/60">
            <Button className="w-full gap-2 shadow-athletic hover:shadow-athletic-lg transition-all duration-300" asChild>
              <Link href="/seller/create">
                <Plus className="h-4 w-4" />
                {language === 'vi' ? 'Tạo Tin Mới' : 'Create Listing'}
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center gap-2 p-4 border-b border-border/60 overflow-x-auto bg-card">
            {sidebarItems.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href)
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href={item.href} className="gap-1.5 whitespace-nowrap">
                    <item.icon className="h-4 w-4" />
                    {item.label[language]}
                  </Link>
                </Button>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 lg:p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
      </div>
    </RoleGuard>
  )
}
