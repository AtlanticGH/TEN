import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, heroBgTransition, heroStagger } from '../../lib/motion'

function HeroCtas({ heroCopy, reduceMotion }) {
  const className = 'mt-10 flex flex-wrap items-center gap-3'
  const links = (
    <>
      {heroCopy.cta_primary_label ? (
        <Link
          to={heroCopy.cta_primary_href || '/apply'}
          className="inline-flex min-h-[48px] min-w-[11rem] items-center justify-center rounded-full bg-orange-500 px-7 py-3 text-[15px] font-semibold text-white shadow-glow ring-1 ring-white/10 transition-all duration-200 ease-out hover:bg-orange-400 hover:shadow-[0_0_0_1px_rgba(249,115,22,0.2),0_12px_32px_rgba(249,115,22,0.35)] active:scale-[0.98]"
        >
          {heroCopy.cta_primary_label}
        </Link>
      ) : null}
      {heroCopy.cta_secondary_label ? (
        <Link
          to={heroCopy.cta_secondary_href || '/about'}
          className="inline-flex min-h-[48px] items-center gap-1.5 justify-center rounded-full border border-white/30 bg-transparent px-6 py-3 text-[14px] font-medium text-white/80 backdrop-blur-sm transition-all duration-200 ease-out hover:border-white/50 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
        >
          {heroCopy.cta_secondary_label}
          <svg className="h-3.5 w-3.5 opacity-70" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      ) : null}
    </>
  )

  if (reduceMotion) return <div className={className}>{links}</div>

  return (
    <motion.div variants={fadeUp} className={className}>
      {links}
    </motion.div>
  )
}

export function HomeHeroMotion({ heroCopy, bg }) {
  const reduceMotion = useReducedMotion()

  return (
    <>
      {bg ? (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bg}')` }}
          initial={reduceMotion ? false : { scale: 1.05, opacity: 0 }}
          animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
          transition={heroBgTransition}
        />
      ) : (
        <motion.div aria-hidden="true" className="absolute inset-0 bg-zinc-900" />
      )}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-zinc-950/95"
      />
      <motion.div
        className="relative mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-center px-6 pb-20 pt-32 sm:px-8 md:px-12 md:pb-24 lg:px-10"
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        variants={heroStagger}
      >
        <motion.div className="ten-hero-content max-w-6xl">
          {heroCopy.badge ? (
            <motion.p
              variants={reduceMotion ? undefined : fadeUp}
              className="mb-6 inline-block w-fit rounded-full border border-white/25 bg-white/[0.07] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-300/90 backdrop-blur-sm"
            >
              {heroCopy.badge}
            </motion.p>
          ) : null}
          {(heroCopy.headline_before || heroCopy.headline_emphasis) ? (
            <motion.h1
              variants={reduceMotion ? undefined : fadeUp}
              className="text-[clamp(2rem,6vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.025em] text-white ten-hero-text-shadow"
            >
              {heroCopy.headline_before ? (
                <span className="block text-white">{heroCopy.headline_before}</span>
              ) : null}
              {heroCopy.headline_emphasis ? (
                <span className="ten-hero-emphasis mt-1 block">{heroCopy.headline_emphasis}</span>
              ) : null}
            </motion.h1>
          ) : (
            <motion.h1 variants={reduceMotion ? undefined : fadeUp} className="text-3xl font-bold text-white">
              The Ember Network
            </motion.h1>
          )}
          {heroCopy.description ? (
            <motion.p
              variants={reduceMotion ? undefined : fadeUp}
              className="mt-6 max-w-5xl text-balance text-[15px] leading-snug text-zinc-200/85 md:text-[17px] md:leading-snug"
            >
              {heroCopy.description}
            </motion.p>
          ) : null}
          <HeroCtas heroCopy={heroCopy} reduceMotion={reduceMotion} />
        </motion.div>
      </motion.div>
    </>
  )
}
