import { motion, useReducedMotion } from 'framer-motion'
import { LAYOUT_CONTAINER, SITE_HERO_OFFSET } from '../layout/headerTokens'
import { fadeUp, heroBgTransition, heroStagger } from '../../lib/motion'

/**
 * InnerPageHero — reusable hero for inner pages (About, Programs, Resources, Contact…)
 */
export function InnerPageHero({ badge, heading, description, image, actions, className = '' }) {
  const reduceMotion = useReducedMotion()

  const content = (
    <>
      {badge && (
        <motion.p
          variants={fadeUp}
          className="mb-5 inline-flex rounded-full border border-white/25 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-200/90 backdrop-blur"
        >
          {badge}
        </motion.p>
      )}
      <motion.h1
        variants={fadeUp}
        className="max-w-[660px] text-[clamp(1.8rem,5vw,3.5rem)] font-extrabold leading-[1.06] tracking-[-0.02em] text-white"
      >
        {heading}
      </motion.h1>
      {description && (
        <motion.p
          variants={fadeUp}
          className="mt-5 max-w-[520px] text-[15px] leading-[1.65] text-zinc-200/80 md:text-base"
        >
          {description}
        </motion.p>
      )}
      {actions ? (
        <motion.div variants={fadeUp} className="mt-8">
          {actions}
        </motion.div>
      ) : null}
    </>
  )

  return (
    <section
      id="page-hero"
      data-section="hero-gateway"
      className={['relative overflow-hidden bg-zinc-950', className].join(' ')}
    >
      {image && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
          initial={reduceMotion ? false : { scale: 1.04, opacity: 0 }}
          animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
          transition={heroBgTransition}
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-zinc-950/72 via-zinc-950/60 to-zinc-950/88"
      />

      <div className={`relative ${LAYOUT_CONTAINER} pb-16 md:pb-20 ${SITE_HERO_OFFSET}`}>
        {reduceMotion ? (
          <div>
            {badge && (
              <p className="mb-5 inline-flex rounded-full border border-white/25 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-200/90 backdrop-blur">
                {badge}
              </p>
            )}
            <h1 className="max-w-[660px] text-[clamp(1.8rem,5vw,3.5rem)] font-extrabold leading-[1.06] tracking-[-0.02em] text-white">
              {heading}
            </h1>
            {description && (
              <p className="mt-5 max-w-[520px] text-[15px] leading-[1.65] text-zinc-200/80 md:text-base">
                {description}
              </p>
            )}
            {actions ? <div className="mt-8">{actions}</div> : null}
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={heroStagger}>
            {content}
          </motion.div>
        )}
      </div>
    </section>
  )
}
