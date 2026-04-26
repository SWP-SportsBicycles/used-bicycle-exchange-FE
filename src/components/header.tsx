'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  CircleCheckBig,
  ClipboardCheck,
  Globe,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  ShoppingCart,
  Shield,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { useAuth, type UserRole } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'
import { useCart } from '@/modules/buyer/hooks/useCart'

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
  const { user, isAuthenticated, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const isHome = pathname === '/'
  const authRedirect = encodeURIComponent(pathname || '/')
  const isBuyer = user.role === 'buyer'
  const { data: cart } = useCart({ enabled: isBuyer })
  const cartCount = isBuyer ? (cart?.items?.length ?? 0) : 0
  const showPostListingCta = (user.role === 'seller' || user.role === 'guest') && (!isHome || isAuthenticated)
  const postListingHref =
    user.role === 'seller'
      ? '/seller/create'
      : `/auth/login?redirect=${encodeURIComponent('/auth/register?role=2&redirect=/seller/create')}`

  const getDashboardLink = () => {
    switch (user.role) {
      case 'buyer':
        return '/buyer'
      case 'seller':
        return '/seller'
      case 'inspector':
        return '/inspector'
      case 'admin':
        return '/admin'
      default:
        return '/profile'
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/85 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group transition-opacity hover:opacity-80">
          <Image 
            src="/logoSBE.jpg" 
            alt="SBE Logo" 
            width={120} 
            height={40} 
            className="h-10 w-auto object-contain mix-blend-multiply rounded-lg" 
            priority
          />
        </Link>

        {/* Assurance Marquee */}
        <div className="hidden md:flex flex-1 max-w-2xl">
          <div className="header-marquee w-full">
            <span className="header-marquee-item">
              <CircleCheckBig className="h-4 w-4 shrink-0 text-primary" />
              Xe đạp được kiểm định khắt khe bởi các chuyên gia
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Button variant={pathname.startsWith('/marketplace') ? 'secondary' : 'ghost'} size="sm" asChild>
            <Link href="/marketplace">{t('nav.marketplace')}</Link>
          </Button>

          {isBuyer && (
            <Button variant={pathname.startsWith('/buyer/orders') ? 'secondary' : 'ghost'} size="sm" className="relative" asChild>
              <Link href="/buyer/orders">
                <Package className="h-4 w-4" />
                <span className="sr-only">Đơn hàng</span>
              </Link>
            </Button>
          )}

          {isBuyer && (
            <Button variant={pathname.startsWith('/buyer/wishlist') ? 'secondary' : 'ghost'} size="sm" className="relative" asChild>
              <Link href="/buyer/wishlist">
                <Heart className="h-4 w-4" />
                <span className="sr-only">{t('nav.wishlist')}</span>
              </Link>
            </Button>
          )}

          {isBuyer && (
            <Button variant={pathname.startsWith('/buyer/cart') ? 'secondary' : 'ghost'} size="sm" className="relative" asChild>
              <Link href="/buyer/cart">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
                <span className="sr-only">{t('nav.cart')}</span>
              </Link>
            </Button>
          )}

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="relative h-9 w-9 p-0"
            aria-label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="h-4 w-4" />
                <span className="uppercase text-xs font-medium">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setLanguage('vi')}
                className={cn(language === 'vi' && 'bg-accent')}
              >
                Tiếng Việt
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('en')}
                className={cn(language === 'en' && 'bg-accent')}
              >
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
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] px-1.5 py-0 mt-0.5', roleColors[user.role])}
                      >
                      {roleLabels[user.role][language]}
                    </Badge>
                  </div>
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

                {isBuyer && (
                  <DropdownMenuItem asChild>
                    <Link href="/buyer" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      {language === 'vi' ? 'Tổng quan' : 'Dashboard'}
                    </Link>
                  </DropdownMenuItem>
                )}

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
                {isBuyer && (
                  <DropdownMenuItem asChild>
                    <Link href="/buyer/orders">{t('nav.myOrders')}</Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/auth/login?redirect=${authRedirect}`}>{t('nav.login')}</Link>
            </Button>
          )}

          {showPostListingCta && (
            <Button size="sm" className="ml-2" asChild>
              <Link href={postListingHref}>{t('nav.postListing')}</Link>
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

              {!isAuthenticated && (
                <Button variant="outline" asChild>
                  <Link href={`/auth/login?redirect=${authRedirect}`}>{t('nav.login')}</Link>
                </Button>
              )}

              <nav className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/marketplace">{t('nav.marketplace')}</Link>
                </Button>

                {isAuthenticated && (
                  <>
                    {isBuyer && (
                      <Button variant="ghost" className="justify-start" asChild>
                        <Link href="/buyer/cart">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {t('nav.cart')}
                        </Link>
                      </Button>
                    )}

                    {isBuyer && (
                      <Button variant="ghost" className="justify-start" asChild>
                        <Link href="/buyer/wishlist">
                          <Heart className="mr-2 h-4 w-4" />
                          {t('nav.wishlist')}
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href={getDashboardLink()}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {t('nav.dashboard')}
                      </Link>
                    </Button>
                    {isBuyer && (
                      <Button variant="ghost" className="justify-start" asChild>
                        <Link href="/buyer/orders">{t('nav.myOrders')}</Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/profile">{t('nav.profile')}</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-destructive" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.logout')}
                    </Button>
                  </>
                )}
              </nav>

              {/* Language Toggle */}
              <div className="flex items-center gap-2 py-2 border-t border-border">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Button variant={language === 'vi' ? 'secondary' : 'ghost'} size="sm" onClick={() => setLanguage('vi')}>
                  VN
                </Button>
                <Button variant={language === 'en' ? 'secondary' : 'ghost'} size="sm" onClick={() => setLanguage('en')}>
                  EN
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                {showPostListingCta && (
                  <Button className="w-full mb-3" asChild>
                    <Link href={postListingHref}>{t('nav.postListing')}</Link>
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
