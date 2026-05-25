import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, transition, viewport } from '../../lib/motion'

const motionTags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  header: motion.header,
}

/**
 * Reveal — fade + slide-up on scroll (Framer Motion).
 * Respects prefers-reduced-motion.
 *
 * Props:
 *   as        – element tag (default: 'div')
 *   delay     – stagger delay in ms (0, 100, 200 …)
 *   className – additional classes
 */
export function Reveal({ as: asTag = 'div', delay = 0, className = '', children, ...props }) {
  const reduceMotion = useReducedMotion()
  const Component = motionTags[asTag] || motion.div

  if (reduceMotion) {
    return (
      <Component className={className} {...props}>
        {children}
      </Component>
    )
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeUp}
      transition={{ ...transition, delay: delay / 1000 }}
      {...props}
    >
      {children}
    </Component>
  )
}
