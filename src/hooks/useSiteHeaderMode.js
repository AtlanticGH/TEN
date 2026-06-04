import { useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { guessHeaderMode, readHeaderMode } from '../lib/headerMode'

/**
 * Marketing navbar: transparent over hero at scrollY ≤ 10, solid glass immediately on scroll.
 */
export function useSiteHeaderMode() {
  const location = useLocation()
  const pathname = location.pathname
  const [mode, setMode] = useState(() => guessHeaderMode(pathname))

  useLayoutEffect(() => {
    let raf = 0

    const update = () => {
      const next = readHeaderMode(pathname)
      setMode((prev) => (prev === next ? prev : next))
    }

    update()

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  return mode
}
