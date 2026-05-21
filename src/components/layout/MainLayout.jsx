import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useThemeToggle } from '../../hooks/useThemeToggle'
import { ChatWidget } from '../shared/ChatWidget'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ScrollProgress } from './ScrollProgress'

export function MainLayout({ children }) {
  const { dark, toggle: toggleTheme } = useThemeToggle()
  const location = useLocation()
  // Home starts in hero nav mode to avoid a scrolled→hero flash over the gateway
  const [headerMode, setHeaderMode] = useState(() =>
    location.pathname === '/' ? 'hero' : 'scrolled',
  )

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

  const path = location.pathname
  const isAppShell =
    path.startsWith('/admin') || path.startsWith('/mentor') || path.startsWith('/member')

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
