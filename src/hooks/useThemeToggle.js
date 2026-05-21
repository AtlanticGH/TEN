import { useLayoutEffect, useState } from 'react'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('ten-theme')
    if (saved === 'dark' || saved === 'light') return saved === 'dark'
  } catch {
    /* localStorage blocked */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function useThemeToggle() {
  const [dark, setDark] = useState(getInitialTheme)

  useLayoutEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [dark])

  const toggle = () => {
    const next = !dark
    setDark(next)
    try {
      localStorage.setItem('ten-theme', next ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }

  return { dark, toggle }
}
