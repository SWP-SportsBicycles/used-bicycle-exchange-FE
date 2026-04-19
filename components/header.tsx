'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  Heart,
  Menu,
  Globe,
  ChevronDown,
  LayoutDashboard,
  ClipboardCheck,
  Shield,
  LogOut,
  CircleCheckBig,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AuthModal } from '@/components/auth-modal'
import { useAuth, type UserRole } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

const roleLabels: Record<UserRole, { vi: string; en: string }> = {
  guest: { vi: 'Khach', en: 'Guest' },
  buyer: { vi: 'Nguoi mua', en: 'Buyer' },
  seller: { vi: 'Nguoi ban', en: 'Seller' },
  inspector: { vi: 'Kiem dinh', en: 'Inspector' },
  admin: { vi: 'Quan tri', en: 'Admin' },
}

const roleColors: Record<UserRole, string> = {
  guest: 'bg-white/70 text-muted-foreground border-border/70',
  buyer: 'bg-primary/10 text-primary border-primary/20',
  seller: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  inspector: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  admin: 'bg-slate-900/10 text-slate-800 border-slate-900/15',
}

const assuranceCopy = {
  vi: 'Xe da duoc kiem dinh, giao dich co quan ly, nhan ban giao minh bach.',
  en: 'Verified bikes, managed transactions, and a cleaner handoff from reserve to delivery.',
}

export function Header() {
  const [authOpen, setAuthOpen] = useState(false)
  const { user, isAuthenticated, switchRole, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()
  const isHome = pathname === '/'
  const showPostListingCta =
    (user.role === 'seller' || user.role === 'guest' || user.role === 'buyer') &&
    (!isHome || isAuthenticated)

  const getDashboardLink = () => {
    switch (user.role) {
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

  const navPill = (active: boolean) =>
    cn(
      'rounded-full border px-3.5 text-[13px] font-semibold transition-all duration-200',
      active
        ? 'border-primary/25 bg-primary/10 text-primary shadow-[0_10px_20px_-18px_rgba(58,115,27,0.9)]'
        : 'border-transparent text-muted-foreground hover:border-border/70 hover:bg-white/80 hover:text-foreground'
    )

  return (
    <>
      <header
        className={cn(
          'z-50 w-full transition-all duration-300',
          isHome ? 'fixed inset-x-0 top-2 px-2 sm:px-3' : 'sticky top-0 px-2 py-2 sm:px-3'
        )}
      >
        <div className={cn('mx-auto overflow-hidden', isHome ? 'max-w-[88rem]' : 'max-w-7xl')}>
          <div className="premium-panel flex flex-col gap-0 bg-white/88 px-4 backdrop-blur-2xl sm:px-5 lg:px-6">
            <div className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/" className="group flex items-center gap-3">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,var(--primary),#263f17_78%)] text-primary-foreground shadow-premium transition-transform duration-300 group-hover:-translate-y-0.5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="2.3"
                    >
                      <circle cx="5.5" cy="17.5" r="3.5" />
                      <circle cx="18.5" cy="17.5" r="3.5" />
                      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
                    </svg>
                    <div className="absolute inset-0 rounded-2xl border border-white/15" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="truncate text-lg font-extrabold tracking-[-0.03em] text-foreground sm:text-xl"
                      style={{ fontFamily: 'var(--font-archivo)' }}
                    >
                      VeloTrust
                    </div>
                    <div className="hidden text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:block">
                      Managed bike marketplace
                    </div>
                  </div>
                </Link>

                <div className="hidden xl:flex items-center gap-2 rounded-full border border-border/70 bg-white/70 px-3 py-2 text-xs text-muted-foreground">
                  <CircleCheckBig className="h-3.5 w-3.5 text-primary" />
                  <span>{assuranceCopy[language]}</span>
                </div>
              </div>

              <nav className="hidden items-center gap-2 md:flex">
                <Button variant="ghost" size="sm" className={navPill(pathname.startsWith('/marketplace'))} asChild>
                  <Link href="/marketplace">{t('nav.marketplace')}</Link>
                </Button>

                {isAuthenticated && (
                  <Button variant="ghost" size="sm" className={navPill(pathname.startsWith('/wishlist'))} asChild>
                    <Link href="/wishlist">
                      <Heart className="h-4 w-4" />
                      <span className="hidden lg:inline">{t('nav.wishlist')}</span>
                    </Link>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full border border-border/70 bg-white/75 px-3 shadow-none hover:bg-white">
                      <Globe className="h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em]">{language}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-border/70 bg-white/95 backdrop-blur-xl">
                    <DropdownMenuItem onClick={() => setLanguage('vi')} className={cn(language === 'vi' && 'bg-accent')}>
                      Tieng Viet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('en')} className={cn(language === 'en' && 'bg-accent')}>
                      English
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto rounded-full border border-border/70 bg-white/80 px-2.5 py-1.5 shadow-none hover:bg-white"
                      >
                        <Avatar className="h-8 w-8 ring-2 ring-white/90">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="hidden min-w-0 text-left lg:block">
                          <div className="truncate text-sm font-semibold text-foreground">{user.name}</div>
                          <Badge variant="outline" className={cn('mt-1 rounded-full border px-2 py-0 text-[10px] font-semibold', roleColors[user.role])}>
                            {roleLabels[user.role][language]}
                          </Badge>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 rounded-[1.4rem] border-border/70 bg-white/95 p-1.5 backdrop-blur-xl">
                      <DropdownMenuLabel className="rounded-2xl bg-secondary/55 px-3 py-3 font-normal">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge variant="outline" className={cn('rounded-full border px-2 py-0 text-[10px] font-semibold', roleColors[user.role])}>
                            {roleLabels[user.role][language]}
                          </Badge>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {(user.role === 'seller' || user.role === 'inspector' || user.role === 'admin') && (
                        <DropdownMenuItem asChild className="rounded-xl">
                          <Link href={getDashboardLink()} className="flex items-center gap-2">
                            {user.role === 'seller' && <LayoutDashboard className="h-4 w-4" />}
                            {user.role === 'inspector' && <ClipboardCheck className="h-4 w-4" />}
                            {user.role === 'admin' && <Shield className="h-4 w-4" />}
                            Workspace
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/profile">{t('nav.profile')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/orders">{t('nav.myOrders')}</Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Preview roles
                      </DropdownMenuLabel>
                      {(['buyer', 'seller', 'inspector', 'admin'] as UserRole[]).map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => switchRole(role)}
                          className={cn('rounded-xl', user.role === role && 'bg-secondary')}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <Badge variant="outline" className={cn('rounded-full border px-2 py-0 text-[10px] font-semibold', roleColors[role])}>
                              {roleLabels[role][language]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {role === 'buyer' && 'Browse and buy'}
                              {role === 'seller' && 'List and manage'}
                              {role === 'inspector' && 'Field operations'}
                              {role === 'admin' && 'Control center'}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="rounded-xl text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('nav.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full border border-border/70 bg-white/75 px-3 shadow-none hover:bg-white">
                        <User className="h-4 w-4" />
                        <span className="hidden lg:inline">Preview</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-[1.4rem] border-border/70 bg-white/95 p-1.5 backdrop-blur-xl">
                      <DropdownMenuLabel className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Explore the demo as
                      </DropdownMenuLabel>
                      {(['buyer', 'seller', 'inspector', 'admin'] as UserRole[]).map((role) => (
                        <DropdownMenuItem key={role} onClick={() => switchRole(role)} className="rounded-xl">
                          <div className="flex w-full items-center justify-between gap-2">
                            <Badge variant="outline" className={cn('rounded-full border px-2 py-0 text-[10px] font-semibold', roleColors[role])}>
                              {roleLabels[role][language]}
                            </Badge>
                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {showPostListingCta ? (
                  <Button size="sm" className="ml-1" asChild>
                    <Link href="/seller/create">
                      <Sparkles className="h-4 w-4" />
                      {t('nav.postListing')}
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" className="ml-1" onClick={() => setAuthOpen(true)}>
                    {language === 'vi' ? 'Dang nhap' : 'Sign In'}
                  </Button>
                )}
              </nav>

              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="rounded-full border border-border/70 bg-white/75">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[22rem] border-border/70 bg-[linear-gradient(180deg,rgba(251,252,247,0.98),rgba(244,247,238,0.98))] p-0">
                  <div className="flex h-full flex-col">
                    <div className="border-b border-border/60 px-5 pb-4 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,var(--primary),#263f17_78%)] text-primary-foreground shadow-premium">
                          <CircleCheckBig className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">VeloTrust</p>
                          <p className="text-xs text-muted-foreground">Managed marketplace preview</p>
                        </div>
                      </div>
                      <div className="premium-subpanel mt-4 space-y-2 p-4">
                        <div className="eyebrow-chip">Trust layer</div>
                        <p className="text-sm leading-6 text-foreground">
                          Reserve, inspect, pay, and hand off with a cleaner paper trail.
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                      {isAuthenticated && (
                        <div className="premium-subpanel mb-5 flex items-center gap-3 p-4">
                          <Avatar className="h-11 w-11">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                            <Badge variant="outline" className={cn('mt-2 rounded-full border px-2 py-0 text-[10px] font-semibold', roleColors[user.role])}>
                              {roleLabels[user.role][language]}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start rounded-2xl border border-transparent bg-white/60" asChild>
                          <Link href="/marketplace">{t('nav.marketplace')}</Link>
                        </Button>

                        {isAuthenticated && (
                          <>
                            <Button variant="ghost" className="w-full justify-start rounded-2xl border border-transparent bg-white/60" asChild>
                              <Link href="/wishlist">
                                <Heart className="mr-2 h-4 w-4" />
                                {t('nav.wishlist')}
                              </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start rounded-2xl border border-transparent bg-white/60" asChild>
                              <Link href={getDashboardLink()}>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                {t('nav.dashboard')}
                              </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start rounded-2xl border border-transparent bg-white/60" asChild>
                              <Link href="/orders">{t('nav.myOrders')}</Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start rounded-2xl border border-transparent bg-white/60" asChild>
                              <Link href="/profile">{t('nav.profile')}</Link>
                            </Button>
                          </>
                        )}
                      </div>

                      <div className="premium-subpanel mt-5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" />
                          Language
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={language === 'vi' ? 'secondary' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setLanguage('vi')}
                          >
                            VN
                          </Button>
                          <Button
                            variant={language === 'en' ? 'secondary' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setLanguage('en')}
                          >
                            EN
                          </Button>
                        </div>
                      </div>

                      <div className="premium-subpanel mt-5 p-4">
                        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Preview roles
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(['guest', 'buyer', 'seller', 'inspector', 'admin'] as UserRole[]).map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              onClick={() => switchRole(role)}
                              className={cn(
                                'cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold transition-transform hover:-translate-y-0.5',
                                roleColors[role],
                                user.role === role && 'ring-2 ring-primary/40'
                              )}
                            >
                              {roleLabels[role][language]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/60 px-5 py-5">
                      {showPostListingCta ? (
                        <Button className="w-full" asChild>
                          <Link href="/seller/create">{t('nav.postListing')}</Link>
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={() => setAuthOpen(true)}>
                          {language === 'vi' ? 'Dang nhap' : 'Sign In'}
                        </Button>
                      )}

                      {isAuthenticated && (
                        <Button variant="outline" className="mt-3 w-full" onClick={logout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          {t('nav.logout')}
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  )
}
