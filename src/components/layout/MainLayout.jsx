import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteHeaderMode } from '../../hooks/useSiteHeaderMode'
import { ChatWidget } from '../shared/ChatWidget'
import { Footer } from './Footer'
import { SiteNavbar } from './Header'
import { ScrollProgress } from './ScrollProgress'

export function MainLayout({ children }) {
  const location = useLocation()
  const headerMode = useSiteHeaderMode()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div
      className="flex min-h-dvh flex-col bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100"
      style={{ transition: 'background-color 200ms ease-out, color 200ms ease-out' }}
    >
      <ScrollProgress />
      <SiteNavbar mode={headerMode} />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
      <ChatWidget />
    </div>
  )
}
