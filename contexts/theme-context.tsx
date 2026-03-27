'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type ThemeVariant = 'modern-finance' | 'minimal-luxury' | 'warm-premium' | 'financial-premium'
export type ColorMode = 'light' | 'dark'

type ThemeContextType = {
  themeVariant: ThemeVariant
  colorMode: ColorMode
  setThemeVariant: (variant: ThemeVariant) => void
  setColorMode: (mode: ColorMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeVariant, setThemeVariantState] = useState<ThemeVariant>('minimal-luxury')
  const [colorMode, setColorModeState] = useState<ColorMode>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load from localStorage
    const savedVariant = localStorage.getItem('theme-variant') as ThemeVariant
    const savedMode = localStorage.getItem('color-mode') as ColorMode

    if (savedVariant) setThemeVariantState(savedVariant)
    if (savedMode) setColorModeState(savedMode)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Apply dark mode class to html element
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Apply theme variant as data attribute
    document.documentElement.setAttribute('data-theme', themeVariant)
  }, [colorMode, themeVariant, mounted])

  const setThemeVariant = (variant: ThemeVariant) => {
    setThemeVariantState(variant)
    localStorage.setItem('theme-variant', variant)
  }

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode)
    localStorage.setItem('color-mode', mode)
  }

  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ themeVariant, colorMode, setThemeVariant, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
