'use client'

import * as React from 'react'

// Simplified ThemeProvider that doesn't rely on next-themes
interface ThemeProviderProps {
  children: React.ReactNode
  [key: string]: any
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <>{children}</>
}
