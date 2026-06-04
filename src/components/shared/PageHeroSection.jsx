import { InnerPageHero } from './InnerPageHero'
import { usePageHero } from '../../hooks/usePageHero'

/** Public inner-page hero driven by site_content (page.{slug}.hero.v1). */
export function PageHeroSection({ slug, actions }) {
  const { hero } = usePageHero(slug)
  if (!hero?.heading && !hero?.badge && !hero?.image) return null
  return (
    <InnerPageHero
      badge={hero.badge}
      heading={hero.heading}
      description={hero.description}
      image={hero.image}
      actions={actions}
    />
  )
}
