'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, type AuthSession } from '@/lib/api/auth-api'

export type UserRole = 'guest' | 'buyer' | 'seller' | 'inspector' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  address?: string
  city?: 'hanoi' | 'hcm' | 'danang'
  // Seller-specific
  walletBalance?: number
  totalSales?: number
  rating?: number
  // Inspector-specific
  assignedInspections?: number
  completedInspections?: number
  // Admin-specific
  permissions?: string[]
}

interface AuthContextType {
  user: User
  isAuthenticated: boolean
  isInitializing: boolean
  switchRole: (role: UserRole) => void
  login: (role: UserRole) => void
  loginWithSession: (session: AuthSession) => Promise<void>
  refreshMe: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest',
  email: '',
  role: 'guest',
}

function normalizeRoleLabel(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function mapApiRoleToContextRole(role: unknown): UserRole | null {
  const roleLabel = normalizeRoleLabel(role)

  // Backend RoleEnum: ADMIN=1, BUYER=2, SELLER=3, INSPECTOR=4
  if (
    role === 1 ||
    role === '1' ||
    roleLabel === 'admin' ||
    roleLabel === 'role_admin'
  ) {
    return 'admin'
  }
  if (
    role === 2 ||
    role === '2' ||
    roleLabel === 'buyer' ||
    roleLabel === 'nguoimua' ||
    roleLabel === 'nguoi_mua' ||
    roleLabel === 'role_buyer'
  ) {
    return 'buyer'
  }
  if (
    role === 3 ||
    role === '3' ||
    roleLabel === 'seller' ||
    roleLabel === 'nguoiban' ||
    roleLabel === 'nguoi_ban' ||
    roleLabel === 'role_seller'
  ) {
    return 'seller'
  }
  if (role === 4 || role === '4' || roleLabel === 'inspector' || roleLabel === 'role_inspector') {
    return 'inspector'
  }

  return null
}

function mapRoleFromUnknown(value: unknown): UserRole | null {
  const mappedPrimitive = mapApiRoleToContextRole(value)
  if (mappedPrimitive) return mappedPrimitive

  if (!value || typeof value !== 'object') return null
  const roleObject = value as Record<string, unknown>

  return (
    mapApiRoleToContextRole(roleObject.id) ??
    mapApiRoleToContextRole(roleObject.code) ??
    mapApiRoleToContextRole(roleObject.name) ??
    mapApiRoleToContextRole(roleObject.value) ??
    mapApiRoleToContextRole(roleObject.label) ??
    mapApiRoleToContextRole(roleObject.role) ??
    mapApiRoleToContextRole(roleObject.roleId) ??
    mapApiRoleToContextRole(roleObject.roleCode) ??
    mapApiRoleToContextRole(roleObject.roleName)
  )
}

function readRoleHintFromStorage(): UserRole | null {
  if (typeof window === 'undefined') return null
  const hint = normalizeRoleLabel(localStorage.getItem('pendingAuthRole'))
  if (hint === 'seller') return 'seller'
  if (hint === 'buyer') return 'buyer'
  if (hint === 'inspector') return 'inspector'
  if (hint === 'admin') return 'admin'
  return null
}

function clearRoleHintFromStorage() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('pendingAuthRole')
}

function resolveRole(candidate: Record<string, unknown>, fallbackRole: UserRole = 'buyer'): UserRole {
  const hint = readRoleHintFromStorage()
  const mappedPrimary =
    mapRoleFromUnknown(candidate.role) ??
    mapRoleFromUnknown(candidate.roleId) ??
    mapRoleFromUnknown(candidate.userRole) ??
    mapRoleFromUnknown(candidate.roleCode) ??
    mapRoleFromUnknown(candidate.roleName)

  // Prefer explicit user choice from signup flow when backend primary role is inconsistent
  if (hint && mappedPrimary && hint !== mappedPrimary) {
    if (hint === 'seller' && mappedPrimary === 'buyer') {
      return hint
    }
  }

  // If we have a hint and no mapped role, prefer the hint over fallback
  if (hint && !mappedPrimary) {
    return hint
  }

  if (mappedPrimary) return mappedPrimary

  if (Array.isArray(candidate.roles)) {
    const roleSet = new Set<UserRole>(
      candidate.roles
        .map((item) => {
          return mapRoleFromUnknown(item)
        })
        .filter((role): role is UserRole => Boolean(role)),
    )

    if (hint && roleSet.has(hint)) return hint

    if (roleSet.has('admin')) return 'admin'
    if (roleSet.has('inspector')) return 'inspector'
    if (roleSet.has('seller')) return 'seller'
    if (roleSet.has('buyer')) return 'buyer'
  }

  return hint ?? fallbackRole
}

function extractObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

function extractUserFromMePayload(payload: unknown): User | null {
  const root = extractObject(payload)
  if (!root) return null

  const data = extractObject(root.data)
  const nestedUser = extractObject(data?.user)
  const rootUser = extractObject(root.user)
  const candidate = nestedUser ?? rootUser ?? data ?? root
  if (!candidate) return null

  const city = candidate.city
  const role = resolveRole(candidate)

  return {
    id: typeof candidate.id === 'string' ? candidate.id : 'me',
    name:
      (typeof candidate.fullName === 'string' && candidate.fullName) ||
      (typeof candidate.name === 'string' && candidate.name) ||
      (typeof candidate.email === 'string' && candidate.email) ||
      'User',
    email: typeof candidate.email === 'string' ? candidate.email : '',
    role,
    avatar: typeof candidate.avatar === 'string' ? candidate.avatar : undefined,
    phone: typeof candidate.phoneNumber === 'string' ? candidate.phoneNumber : undefined,
    address: typeof candidate.address === 'string' ? candidate.address : undefined,
    city: city === 'hanoi' || city === 'hcm' || city === 'danang' ? city : undefined,
    walletBalance: typeof candidate.walletBalance === 'number' ? candidate.walletBalance : undefined,
    totalSales: typeof candidate.totalSales === 'number' ? candidate.totalSales : undefined,
    rating: typeof candidate.rating === 'number' ? candidate.rating : undefined,
    assignedInspections:
      typeof candidate.assignedInspections === 'number' ? candidate.assignedInspections : undefined,
    completedInspections:
      typeof candidate.completedInspections === 'number' ? candidate.completedInspections : undefined,
    permissions: Array.isArray(candidate.permissions)
      ? candidate.permissions.filter((item): item is string => typeof item === 'string')
      : undefined,
  }
}

function buildFallbackUserFromSession(session: AuthSession): User {
  const mappedSessionRole = mapApiRoleToContextRole(session.user?.role)
  const role = mappedSessionRole ?? readRoleHintFromStorage() ?? 'buyer'
  return {
    id: session.user?.id ?? 'me',
    name: session.user?.fullName ?? session.user?.email ?? 'User',
    email: session.user?.email ?? '',
    role,
  }
}

function setRoleCookie(role: UserRole) {
  if (typeof document === 'undefined') return
  document.cookie = `role=${role}; path=/; max-age=86400; samesite=lax`
}

function setAccessTokenCookie(accessToken: string) {
  if (typeof document === 'undefined') return
  document.cookie = `accessToken=${encodeURIComponent(accessToken)}; path=/; max-age=86400; samesite=lax`
}

function clearAuthCookies() {
  if (typeof document === 'undefined') return
  document.cookie = 'role=; path=/; max-age=0; samesite=lax'
  document.cookie = 'accessToken=; path=/; max-age=0; samesite=lax'
}

function clearAuthStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
  clearAuthCookies()
}

function persistSession(session: AuthSession) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', session.accessToken)
    if (session.refreshToken) {
      localStorage.setItem('refreshToken', session.refreshToken)
    }
  }
  setAccessTokenCookie(session.accessToken)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(GUEST_USER)
  const [isInitializing, setIsInitializing] = useState(true)

  const refreshMe = useCallback(async () => {
    const me = await authApi.getMe()
    const normalized = extractUserFromMePayload(me)
    if (!normalized) {
      throw new Error('Unable to parse user profile from /me response')
    }

    setUser(normalized)
    setRoleCookie(normalized.role)
    // Only clear role hint if we successfully got a role from API
    if (normalized.role !== 'buyer' || !readRoleHintFromStorage()) {
      clearRoleHintFromStorage()
    }
  }, [])

  const loginWithSession = useCallback(
    async (session: AuthSession) => {
      const fallbackUser = buildFallbackUserFromSession(session)
      persistSession(session)
      setRoleCookie(fallbackUser.role)

      try {
        await refreshMe()
      } catch {
        setUser(fallbackUser)
        // Don't clear role hint on fallback, preserve it for next refresh attempt
      }
    },
    [refreshMe],
  )

  useEffect(() => {
    let mounted = true

    const bootstrapAuth = async () => {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      if (!accessToken) {
        clearAuthCookies()
        if (mounted) {
          setUser(GUEST_USER)
          setIsInitializing(false)
        }
        return
      }

      try {
        await refreshMe()
      } catch {
        clearAuthStorage()
        if (mounted) {
          setUser(GUEST_USER)
        }
      } finally {
        if (mounted) {
          setIsInitializing(false)
        }
      }
    }

    bootstrapAuth()

    return () => {
      mounted = false
    }
  }, [refreshMe])

  const switchRole = useCallback(() => {
    // Demo role switching is intentionally disabled in real-auth mode.
  }, [])

  const login = useCallback((role: UserRole) => {
    // Legacy compatibility path; prefer loginWithSession for real authentication.
    if (role === 'guest') {
      setUser(GUEST_USER)
      clearAuthStorage()
      return
    }

    setUser({
      id: `legacy-${role}`,
      name: role,
      email: '',
      role,
    })
    setRoleCookie(role)
  }, [])

  const logout = useCallback(() => {
    setUser(GUEST_USER)
    clearAuthStorage()
  }, [])

  const isAuthenticated = user.role !== 'guest'

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isInitializing, switchRole, login, loginWithSession, refreshMe, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
