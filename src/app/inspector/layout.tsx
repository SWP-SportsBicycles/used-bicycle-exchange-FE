'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Calendar,
  CheckCircle2,
  ChevronRight 
} from 'lucide-react'
import { Header } from '@/components/header'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { Badge } from '@/components/ui/badge'
import { inspectorApi } from '@/lib/api/inspector-api'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

type SidebarItem = {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: { vi: string; en: string }
  exact?: boolean
  badge?: number
  badgeTone?: 'alert' | 'default'
}

const sidebarItems: SidebarItem[] = [
  { 
    href: '/inspector', 
    icon: LayoutDashboard, 
    label: { vi: 'Tổng Quan', en: 'Overview' },
    exact: true
  },
  { 
    href: '/inspector/assigned', 
    icon: ClipboardCheck, 
    label: { vi: 'Kiểm định xe', en: 'Bike Inspection' }
  },
  { 
    href: '/inspector/schedule', 
    icon: Calendar, 
    label: { vi: 'Lịch Kiểm Định', en: 'Schedule' }
  },
  { 
    href: '/inspector/completed', 
    icon: CheckCircle2, 
    label: { vi: 'Đã Hoàn Thành', en: 'Completed' }
  },
]

export default function InspectorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { language } = useLanguage()

  const pendingListingsQuery = useQuery({
    queryKey: ['inspector-listings', 'pending'],
    queryFn: inspectorApi.getPendingListings,
    refetchInterval: 15000,
  })

  const pendingCount = pendingListingsQuery.data?.length ?? 0

  const sidebarItemsWithBadge = sidebarItems.map((item) =>
    item.href === '/inspector/assigned'
      ? { ...item, badge: pendingCount, badgeTone: 'alert' as const }
      : item
  )

  return (
    <RoleGuard allow={['inspector']}>
      <div className="min-h-screen bg-background">
        <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 bg-sidebar min-h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-4 border-b border-border/60">
            <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-archivo)' }}>
              {language === 'vi' ? 'Cổng Kiểm Định' : 'Inspector Portal'}
            </h2>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarItemsWithBadge.map((item) => {
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
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-sm hover:shadow-primary/30' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label[language]}
                      {typeof item.badge === 'number' && (
                        <Badge 
                          variant={item.badgeTone === 'alert' ? 'destructive' : isActive ? 'secondary' : 'default'}
                          className="ml-auto h-5 px-1.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      {isActive && typeof item.badge !== 'number' && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center gap-2 p-4 border-b border-border/50 overflow-x-auto bg-card/50 backdrop-blur-sm">
            {sidebarItemsWithBadge.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
                    isActive 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label[language]}
                  {typeof item.badge === 'number' && (
                    <Badge variant={item.badgeTone === 'alert' ? 'destructive' : 'secondary'} className="h-5 px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
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
