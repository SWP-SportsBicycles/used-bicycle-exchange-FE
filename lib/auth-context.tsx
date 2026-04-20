'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// User roles as defined in SRS
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

// Mock users for demo role switching
export const MOCK_USERS: Record<UserRole, User> = {
  guest: {
    id: 'guest',
    name: 'Khách',
    email: '',
    role: 'guest',
  },
  buyer: {
    id: 'buyer-1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@email.com',
    role: 'buyer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer',
    phone: '0901234567',
    address: '123 Lý Thường Kiệt, Quận 10',
    city: 'hcm',
  },
  seller: {
    id: 'seller-1',
    name: 'Trần Minh Đức',
    email: 'duc.tran@email.com',
    role: 'seller',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller',
    phone: '0912345678',
    address: '456 Nguyễn Trãi, Ba Đình',
    city: 'hanoi',
    walletBalance: 15500000,
    totalSales: 12,
    rating: 4.8,
  },
  inspector: {
    id: 'inspector-1',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@velotrust.vn',
    role: 'inspector',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inspector',
    phone: '0923456789',
    city: 'hanoi',
    assignedInspections: 5,
    completedInspections: 47,
  },
  admin: {
    id: 'admin-1',
    name: 'Admin VeloTrust',
    email: 'admin@velotrust.vn',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    permissions: ['manage_users', 'manage_listings', 'manage_disputes', 'view_analytics'],
  },
}

interface AuthContextType {
  user: User
  isAuthenticated: boolean
  switchRole: (role: UserRole) => void
  login: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USERS.guest)

  const switchRole = useCallback((role: UserRole) => {
    setUser(MOCK_USERS[role])
  }, [])

  const login = useCallback((role: UserRole) => {
    setUser(MOCK_USERS[role])
  }, [])

  const logout = useCallback(() => {
    setUser(MOCK_USERS.guest)
  }, [])

  const isAuthenticated = user.role !== 'guest'

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, switchRole, login, logout }}>
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
