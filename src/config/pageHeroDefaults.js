/** Inner-page hero copy stored in site_content (page.{slug}.hero.v1). */

export const PAGE_HERO_PAGES = [
  { slug: 'about', label: 'About', path: '/about', uploadFolder: 'cms' },
  { slug: 'programs', label: 'Programs', path: '/programs', uploadFolder: 'cms' },
  { slug: 'resources', label: 'Resources', path: '/resources', uploadFolder: 'cms' },
  { slug: 'contact', label: 'Contact', path: '/contact', uploadFolder: 'cms' },
  { slug: 'gallery', label: 'Gallery', path: '/gallery', uploadFolder: 'gallery' },
  { slug: 'community', label: 'Community', path: '/community', uploadFolder: 'cms' },
]

export function pageHeroKey(slug) {
  return `page.${slug}.hero.v1`
}

export const DEFAULT_PAGE_HEROES = {
  about: {
    badge: 'About',
    heading: 'Who we are and why TEN exists',
    description:
      'The Ember Network is a transformative hub for emerging entrepreneurs, turning ambitious ideas into thriving enterprises through mentorship and strategic guidance.',
    image: '/assets/images/1519389950473-47ba0277781c.jpg',
  },
  programs: {
    badge: 'Programs',
    heading: 'From spark to scale',
    description:
      'Structured programs and experiences that move founders from ideation to impact — through workshops, pitch challenges, mentorship circles, and the entrepreneurial growth cycle.',
    image: '/assets/images/1498050108023-c5249f4df085.jpg',
  },
  resources: {
    badge: 'Resources',
    heading: 'Practical guides for purposeful growth',
    description:
      'Explore actionable playbooks, templates, and mentorship notes to help you move from idea to measurable progress.',
    image: '/assets/images/1454165804606-c3d57bc86b40.jpg',
  },
  contact: {
    badge: 'Contact',
    heading: 'Contact The Ember Network',
    description:
      'Reach out for membership support, mentor collaboration, and strategic partnerships within TEN.',
    image: '/assets/images/1517048676732-d65bc937f952.jpg',
  },
  gallery: {
    badge: 'Gallery',
    heading: 'Moments from the network',
    description:
      'Watch program highlights and browse photo albums from events, mentorship sessions, and community gatherings.',
    image: '/assets/images/1531123897727-8f129e1688ce.jpg',
  },
  community: {
    badge: 'Community',
    heading: 'Who Can Join TEN',
    description:
      'TEN brings together aspiring entrepreneurs, early-stage founders, and experts in one collaborative ecosystem — built for ambitious individuals ready to learn, collaborate, and grow.',
    image: '/assets/images/1529156069898-49953e39b3ac.jpg',
  },
}

export const EMPTY_PAGE_HERO = { badge: '', heading: '', description: '', image: '' }

export function getDefaultPageHero(slug) {
  return { ...(DEFAULT_PAGE_HEROES[slug] || EMPTY_PAGE_HERO) }
}

/** Map CMS hero block JSON → site_content hero shape. */
export function blockContentToPageHero(content) {
  const c = content || {}
  return {
    badge: c.badge || '',
    heading:
      [c.headline_before, c.headline_emphasis].filter(Boolean).join(' ') || c.headline || c.title || '',
    description: c.description || c.subheadline || '',
    image: c.background_image || c.image || '',
  }
}

/** Map site_content hero → CMS hero block JSON (inner variant). */
export function pageHeroToBlockContent(hero) {
  const h = hero || {}
  return {
    variant: 'inner',
    badge: h.badge || '',
    headline_before: h.heading || '',
    description: h.description || '',
    background_image: h.image || '',
    image: h.image || '',
  }
}
