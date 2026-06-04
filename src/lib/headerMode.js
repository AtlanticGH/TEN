import { HERO_GATEWAY_SELECTOR } from '../components/layout/headerTokens'

const SCROLL_THRESHOLD = 10
const PILL_THRESHOLD = 70

/** Marketing routes that use a full-bleed hero under the fixed header. */
const HERO_PATHS = new Set(['/', '/about', '/programs', '/gallery', '/resources', '/contact', '/community'])

export function routeExpectsHero(pathname = '') {
  return HERO_PATHS.has(String(pathname || '').replace(/\/$/, '') || '/')
}

export function readHeaderPillScrolled() {
  if (typeof window === 'undefined') return false
  return window.scrollY >= PILL_THRESHOLD
}

/** Initial header tone before paint — pathname-based to avoid DOM timing flash. */
export function guessHeaderMode(pathname = '') {
  if (!routeExpectsHero(pathname)) return 'scrolled'
  if (typeof window === 'undefined') return 'hero'
  return window.scrollY > SCROLL_THRESHOLD ? 'scrolled' : 'hero'
}

/** Confirm hero presence after the page tree is in the DOM. */
export function readHeaderMode(pathname = '') {
  if (typeof window === 'undefined') return 'scrolled'
  if (!routeExpectsHero(pathname)) return 'scrolled'
  const hasHero = document.querySelector(HERO_GATEWAY_SELECTOR)
  if (!hasHero) return 'scrolled'
  return window.scrollY > SCROLL_THRESHOLD ? 'scrolled' : 'hero'
}
