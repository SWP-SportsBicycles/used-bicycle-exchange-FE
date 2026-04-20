'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Calendar,
  CheckCircle2,
  ChevronRight 
} from 'lucide-react'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { 
    href: '/inspector', 
    icon: LayoutDashboard, 
    label: { vi: 'Tổng Quan', en: 'Overview' },
    exact: true
  },
  { 
    href: '/inspector/assigned', 
    icon: ClipboardCheck, 
    label: { vi: 'Xe Được Giao', en: 'Assigned' },
    badge: 3
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

  return (
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
              {sidebarItems.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href)
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label[language]}
                      {item.badge && (
                        <Badge 
                          variant={isActive ? 'secondary' : 'default'}
                          className="ml-auto h-5 px-1.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      {isActive && !item.badge && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Stats Summary */}
          <div className="p-4 border-t border-border/50">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold text-primary">{user.assignedInspections || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' ? 'Đang chờ' : 'Pending'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold text-success">{user.completedInspections || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' ? 'Hoàn thành' : 'Completed'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center gap-2 p-4 border-b border-border/50 overflow-x-auto bg-card/50 backdrop-blur-sm">
            {sidebarItems.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label[language]}
                  {item.badge && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
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
  )
}
