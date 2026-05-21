import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { isAppShellPath } from '../../lib/layoutPaths'
import { ChatWidget } from '../shared/ChatWidget'
import { Footer } from './Footer'
import { SiteNavbar } from './Header'
import { ScrollProgress } from './ScrollProgress'

export function MainLayout({ children }) {
  const location = useLocation()
  const [headerMode, setHeaderMode] = useState(() =>
    location.pathname === '/' ? 'hero' : 'scrolled',
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  const heroSelector = useMemo(
    () => '#home-gateway, [data-section="hero-gateway"]',
    [],
  )

  useEffect(() => {
    if (location.pathname !== '/') {
      setHeaderMode('scrolled')
    }
  }, [location.pathname])

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
      window.removeEventListener('resize', onScroll)
    }
  }, [location.pathname, heroSelector])

  const isAppShell = isAppShellPath(location.pathname)

  return (
    <div
      className="flex min-h-dvh flex-col bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100"
      style={{ transition: 'background-color 200ms ease-out, color 200ms ease-out' }}
    >
      <ScrollProgress />
      {!isAppShell && <SiteNavbar mode={headerMode} />}
      <div className="flex flex-1 flex-col">{children}</div>
      {!isAppShell && <Footer />}
      <ChatWidget />
    </div>
  )
}
