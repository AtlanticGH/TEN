import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { HERO_GATEWAY_SELECTOR, SITE_HEADER_ATTR } from '../components/layout/headerTokens'

/**
 * Switches the marketing navbar between transparent (over hero) and solid (scrolled).
 * Uses the hero section's position relative to the header — not pathname alone.
 */
export function useSiteHeaderMode() {
  const location = useLocation()
  const [mode, setMode] = useState('scrolled')

  useEffect(() => {
    let raf = 0

    const compute = () => {
      const hero = document.querySelector(HERO_GATEWAY_SELECTOR)
      if (!hero) {
        setMode((prev) => (prev === 'scrolled' ? prev : 'scrolled'))
        return
      }

      const header = document.querySelector(`[${SITE_HEADER_ATTR}]`)
      const headerBottom = header?.getBoundingClientRect().bottom ?? 72
      const heroBottom = hero.getBoundingClientRect().bottom
      const next = heroBottom > headerBottom + 4 ? 'hero' : 'scrolled'
      setMode((prev) => (prev === next ? prev : next))
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(compute)
    }

    raf = requestAnimationFrame(compute)
    const afterPaint = requestAnimationFrame(() => requestAnimationFrame(compute))

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(afterPaint)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [location.pathname])

  return mode
}
