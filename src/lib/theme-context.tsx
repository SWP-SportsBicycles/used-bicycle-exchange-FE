/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  // On mount: read from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('sbe-theme') as Theme | null
    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored)
      setThemeState(stored)
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial: Theme = prefersDark ? 'dark' : 'light'
      applyTheme(initial)
      setThemeState(initial)
    }
  }, [])

  const applyTheme = (t: Theme) => {
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const setTheme = (t: Theme) => {
    applyTheme(t)
    setThemeState(t)
    localStorage.setItem('sbe-theme', t)
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
