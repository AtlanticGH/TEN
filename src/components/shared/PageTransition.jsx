import { useLayoutEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { pageEnter, pageTransition } from '../../lib/motion'

/**
 * Subtle fade/slide when navigating between public routes (not on first load).
 */
export function PageTransition({ children }) {
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const skipEnter = useRef(true)

  useLayoutEffect(() => {
    skipEnter.current = false
  }, [])

  if (reduceMotion) {
    return <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="flex min-h-0 flex-1 flex-col"
        initial={skipEnter.current ? false : pageEnter.initial}
        animate={pageEnter.animate}
        exit={pageEnter.exit}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
