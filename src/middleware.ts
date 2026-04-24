import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/buyer', '/seller', '/inspector', '/admin']
const AUTHENTICATED_PATHS = ['/orders', '/wishlist', '/cart', '/profile']
const BUYER_ONLY_PATHS = ['/orders', '/wishlist', '/cart']
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/forgot-password', '/auth/reset-password']

const ROLE_PREFIX: Record<string, string> = {
  buyer: '/buyer',
  seller: '/seller',
  inspector: '/inspector',
  admin: '/admin',
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isAuthenticatedPath(pathname: string) {
  return AUTHENTICATED_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isBuyerOnlyPath(pathname: string) {
  return BUYER_ONLY_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function buildLoginRedirect(request: NextRequest) {
  const redirectUrl = new URL('/auth/login', request.url)
  redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(redirectUrl)
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('accessToken')?.value
  const role = request.cookies.get('role')?.value

  if (isProtectedPath(pathname) && !token) {
    return buildLoginRedirect(request)
  }

  if (isAuthenticatedPath(pathname) && !token) {
    return buildLoginRedirect(request)
  }

  if (isProtectedPath(pathname) && role && role in ROLE_PREFIX) {
    const expectedPrefix = ROLE_PREFIX[role]
    if (!pathname.startsWith(expectedPrefix)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (token && AUTH_PATHS.some((path) => pathname === path)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (token && isBuyerOnlyPath(pathname) && role && role !== 'buyer') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/buyer/:path*',
    '/seller/:path*',
    '/inspector/:path*',
    '/admin/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
    '/cart/:path*',
    '/profile/:path*',
    '/auth/:path*',
  ],
}
