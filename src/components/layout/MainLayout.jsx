import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteHeaderMode } from '../../hooks/useSiteHeaderMode'
import { PageTransition } from '../shared/PageTransition'
import { ChatWidget } from '../shared/ChatWidget'
import { Footer } from './Footer'
import { SiteNavbar } from './Header'
import { ScrollProgress } from './ScrollProgress'

export function MainLayout({ children }) {
  const location = useLocation()
  const headerMode = useSiteHeaderMode()
  const prevPath = useRef(location.pathname)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    if (prevPath.current !== location.pathname) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      prevPath.current = location.pathname
    }
  }, [location.pathname])

  return (
    <div
      className="flex min-h-dvh flex-col bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100"
    >
      <ScrollProgress />
      <SiteNavbar key={location.pathname} mode={headerMode} />
      <PageTransition>{children}</PageTransition>
      <Footer />
      <ChatWidget />
    </div>
  )
}
