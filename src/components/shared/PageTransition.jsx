import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { pageEnter, pageTransition } from '../../lib/motion'

/**
 * Subtle fade/slide when navigating between public routes.
 */
export function PageTransition({ children }) {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <motion.div className="flex min-h-0 flex-1 flex-col">{children}</motion.div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="flex min-h-0 flex-1 flex-col"
        initial={pageEnter.initial}
        animate={pageEnter.animate}
        exit={pageEnter.exit}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
