'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, User, Heart, Menu, Globe, ChevronDown, LayoutDashboard, ClipboardCheck, Shield, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'
import { useAuth, type UserRole } from '@/lib/auth-context'
import { useLanguage, type Language } from '@/lib/language-context'
import { cn } from '@/lib/utils'

const roleLabels: Record<UserRole, { vi: string; en: string }> = {
  guest: { vi: 'Khách', en: 'Guest' },
  buyer: { vi: 'Người Mua', en: 'Buyer' },
  seller: { vi: 'Người Bán', en: 'Seller' },
  inspector: { vi: 'Kiểm Định Viên', en: 'Inspector' },
  admin: { vi: 'Quản Trị', en: 'Admin' },
}

const roleColors: Record<UserRole, string> = {
  guest: 'bg-muted text-muted-foreground',
  buyer: 'bg-primary/20 text-primary',
  seller: 'bg-success/20 text-success',
  inspector: 'bg-accent/20 text-accent-foreground',
  admin: 'bg-destructive/20 text-destructive',
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, switchRole, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()

  const getDashboardLink = () => {
    switch (user.role) {
      case 'seller': return '/seller'
      case 'inspector': return '/inspector'
      case 'admin': return '/admin'
      default: return '/profile'
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/90 backdrop-blur-xl supports-[backdrop-filter]:bg-card/85 shadow-athletic">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-athletic transition-all duration-300 group-hover:shadow-athletic-lg group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="18.5" cy="17.5" r="3.5" />
              <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
            </svg>
          </div>
          <span className="hidden text-xl font-extrabold tracking-tight text-foreground sm:inline-block" style={{ fontFamily: 'var(--font-archivo)' }}>
            VeloTrust
          </span>
        </Link>

        {/* Search - Desktop */}
        <div className="hidden flex-1 max-w-xl md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search.placeholder')}
              className="w-full pl-10 bg-secondary border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Button 
            variant={pathname === '/' ? 'secondary' : 'ghost'} 
            size="sm" 
            asChild
          >
            <Link href="/">{t('nav.marketplace')}</Link>
          </Button>
          
          {isAuthenticated && (
            <Button 
              variant={pathname.startsWith('/wishlist') ? 'secondary' : 'ghost'} 
              size="sm" 
              className="relative" 
              asChild
            >
              <Link href="/wishlist">
                <Heart className="h-4 w-4" />
                <span className="sr-only">{t('nav.wishlist')}</span>
              </Link>
            </Button>
          )}

          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="h-4 w-4" />
                <span className="uppercase text-xs font-medium">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('vi')} className={cn(language === 'vi' && 'bg-accent')}>
                Tiếng Việt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')} className={cn(language === 'en' && 'bg-accent')}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none">{user.name}</span>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 mt-0.5', roleColors[user.role])}>
                      {roleLabels[user.role][language]}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {user.role === 'seller' && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      {language === 'vi' ? 'Bảng Điều Khiển' : 'Dashboard'}
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'inspector' && (
                  <DropdownMenuItem asChild>
                    <Link href="/inspector" className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" />
                      {language === 'vi' ? 'Cổng Kiểm Định' : 'Inspector Portal'}
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {language === 'vi' ? 'Quản Trị' : 'Admin Panel'}
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link href="/profile">{t('nav.profile')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">{t('nav.myOrders')}</Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Demo: Switch Role
                </DropdownMenuLabel>
                {(['buyer', 'seller', 'inspector', 'admin'] as UserRole[]).map(role => (
                  <DropdownMenuItem 
                    key={role} 
                    onClick={() => switchRole(role)}
                    className={cn(user.role === role && 'bg-accent')}
                  >
                    <Badge variant="outline" className={cn('mr-2 text-xs', roleColors[role])}>
                      {roleLabels[role][language]}
                    </Badge>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  <span className="sr-only">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Demo: Login As
                </DropdownMenuLabel>
                {(['buyer', 'seller', 'inspector', 'admin'] as UserRole[]).map(role => (
                  <DropdownMenuItem key={role} onClick={() => switchRole(role)}>
                    <Badge variant="outline" className={cn('mr-2 text-xs', roleColors[role])}>
                      {roleLabels[role][language]}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {(user.role === 'seller' || user.role === 'guest' || user.role === 'buyer') && (
            <Button size="sm" className="ml-2" asChild>
              <Link href="/seller/create">{t('nav.postListing')}</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col gap-6 pt-6">
              {/* User Info */}
              {isAuthenticated && (
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <Badge variant="outline" className={cn('text-xs', roleColors[user.role])}>
                      {roleLabels[user.role][language]}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('search.placeholder')}
                  className="pl-10 bg-secondary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <nav className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/">{t('nav.marketplace')}</Link>
                </Button>
                
                {isAuthenticated && (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/wishlist">
                        <Heart className="mr-2 h-4 w-4" />
                        {t('nav.wishlist')}
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href={getDashboardLink()}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {t('nav.dashboard')}
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/orders">{t('nav.myOrders')}</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/profile">{t('nav.profile')}</Link>
                    </Button>
                  </>
                )}
              </nav>

              {/* Language Toggle */}
              <div className="flex items-center gap-2 py-2 border-t border-border">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Button 
                  variant={language === 'vi' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setLanguage('vi')}
                >
                  VN
                </Button>
                <Button 
                  variant={language === 'en' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setLanguage('en')}
                >
                  EN
                </Button>
              </div>

              {/* Role Switcher (Demo) */}
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-2">Demo: Switch Role</p>
                <div className="flex flex-wrap gap-2">
                  {(['guest', 'buyer', 'seller', 'inspector', 'admin'] as UserRole[]).map(role => (
                    <Badge 
                      key={role}
                      variant="outline" 
                      className={cn(
                        'cursor-pointer text-xs transition-colors',
                        roleColors[role],
                        user.role === role && 'ring-2 ring-primary'
                      )}
                      onClick={() => switchRole(role)}
                    >
                      {roleLabels[role][language]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <Button className="w-full mb-3" asChild>
                  <Link href="/seller/create">{t('nav.postListing')}</Link>
                </Button>
                {!isAuthenticated && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => switchRole('buyer')}>
                      {t('nav.login')}
                    </Button>
                    <Button variant="secondary" className="flex-1">
                      {t('nav.register')}
                    </Button>
                  </div>
                )}
                {isAuthenticated && (
                  <Button variant="outline" className="w-full" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
