import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChatWidget } from '../shared/ChatWidget'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ScrollProgress } from './ScrollProgress'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('ten-theme')
    if (saved === 'dark' || saved === 'light') return saved === 'dark'
  } catch { /* localStorage blocked */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function MainLayout({ children }) {
  const [dark, setDark] = useState(getInitialTheme)
  const location = useLocation()
  // Home starts in hero nav mode to avoid a scrolled→hero flash over the gateway
  const [headerMode, setHeaderMode] = useState(() =>
    location.pathname === '/' ? 'hero' : 'scrolled',
  )

  // Apply theme class to <html> immediately, before paint
  useLayoutEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [dark])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  // Transparent-over-hero detection
  const heroSelector = useMemo(
    () => '#home-gateway, [data-section="hero-gateway"]',
    []
  )

  useEffect(() => {
    let raf = 0

    const compute = () => {
      if (location.pathname !== '/') {
        setHeaderMode('scrolled')
        return
      }
      const hero = document.querySelector(heroSelector)
      if (!hero) {
        setHeaderMode('scrolled')
        return
      }
      const heroHeight = hero.getBoundingClientRect().height || 0
      const threshold = Math.max(120, heroHeight - 88)
      const next = window.scrollY < threshold ? 'hero' : 'scrolled'
      setHeaderMode((prev) => (prev === next ? prev : next))
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(compute)
    }

    raf = requestAnimationFrame(compute)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', compute)
    }
  }, [location.pathname, heroSelector])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    try {
      localStorage.setItem('ten-theme', next ? 'dark' : 'light')
    } catch { /* ignore */ }
  }

  const path = location.pathname
  const isAppShell = path.startsWith('/admin') || path.startsWith('/mentor')

  return (
    // Root wrapper uses CSS variables so the whole page reacts to .dark
    <div
      className="flex min-h-dvh flex-col bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100"
      style={{ transition: 'background-color 200ms ease-out, color 200ms ease-out' }}
    >
      <ScrollProgress />
      {!isAppShell && (
        <Navbar mode={headerMode} dark={dark} onToggleTheme={toggleTheme} />
      )}
      <div className="flex flex-1 flex-col">{children}</div>
      {!isAppShell && <Footer />}
      <ChatWidget />
    </div>
  )
}
