import { useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { HERO_GATEWAY_SELECTOR } from '../components/layout/headerTokens'

const SCROLL_THRESHOLD = 10

function readHeaderMode() {
  if (typeof window === 'undefined') return 'scrolled'
  const hasHero = document.querySelector(HERO_GATEWAY_SELECTOR)
  if (!hasHero) return 'scrolled'
  return window.scrollY > SCROLL_THRESHOLD ? 'scrolled' : 'hero'
}

/**
 * Marketing navbar: transparent over hero at scrollY ≤ 10, solid glass immediately on scroll.
 */
export function useSiteHeaderMode() {
  const location = useLocation()
  const [mode, setMode] = useState(readHeaderMode)

  useLayoutEffect(() => {
    let raf = 0

    const update = () => {
      const next = readHeaderMode()
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
  }, [location.pathname])

  return mode
}
