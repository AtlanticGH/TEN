import { useEffect, useLayoutEffect, useRef, useState } from 'react'

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0
}

export function useInView(options) {
  const ref = useRef(null)
  const [inView, setInView] = useState(() => prefersReducedMotion())

  // Sync above-the-fold elements before paint to avoid opacity-0 flash
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current
    if (!el || !isElementInViewport(el)) return
    queueMicrotask(() => setInView(true))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          setInView(true)
          if (options?.once !== false) obs.disconnect()
        } else if (options?.once === false) {
          setInView(false)
        }
      },
      {
        root: options?.root ?? null,
        rootMargin: options?.rootMargin ?? '0px 0px -10% 0px',
        threshold: options?.threshold ?? 0.2,
      }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [options?.once, options?.root, options?.rootMargin, options?.threshold])

  return { ref, inView }
}

