/** Shared Framer Motion presets for TEN marketing pages. */

/** Soft deceleration — feels slower and less snappy at the end. */
export const easeSmooth = [0.16, 1, 0.3, 1]

export const transition = {
  duration: 0.85,
  ease: easeSmooth,
}

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: easeSmooth,
    },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: easeSmooth,
    },
  },
}

export const heroStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.22 },
  },
}

export const heroBgTransition = {
  duration: 1.65,
  ease: easeSmooth,
}

export const pageEnter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

export const pageTransition = {
  duration: 0.55,
  ease: easeSmooth,
}

export const viewport = { once: true, amount: 0.12 }
