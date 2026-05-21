import { createContext, useContext } from 'react'
import { useThemeToggle } from '../hooks/useThemeToggle'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const value = useThemeToggle()
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
