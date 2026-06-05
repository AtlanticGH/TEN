/** Public marketing routes — each has a matching tab under Admin → Pages. */

export const ADMIN_SITE_PAGES = [
  {
    slug: 'home',
    label: 'Home',
    path: '/',
    description: 'Homepage hero, headlines, and primary CTAs.',
    hasHero: true,
    editorPath: '/admin/home',
    suggestedSections: [],
  },
  {
    slug: 'about',
    label: 'About',
    path: '/about',
    description: 'Mission, story, team, and about-page blocks.',
    suggestedSections: ['intro', 'mission', 'team', 'cta'],
  },
  {
    slug: 'programs',
    label: 'Programs',
    path: '/programs',
    description: 'Program cards, growth cycle media, and copy (/admin/programs).',
    editorPath: '/admin/programs',
    suggestedSections: ['intro', 'monthly', 'pitch', 'cta'],
  },
  {
    slug: 'resources',
    label: 'Resources',
    path: '/resources',
    description: 'Resources page copy plus downloadable files.',
    editorPath: '/admin/resources',
    suggestedSections: ['intro', 'faq'],
    hasDownloads: true,
  },
  {
    slug: 'gallery',
    label: 'Gallery',
    path: '/gallery',
    description: 'Photo albums and video gallery.',
    editorPath: '/admin/gallery',
    suggestedSections: ['hero', 'albums', 'videos'],
  },
  {
    slug: 'community',
    label: 'Community',
    path: '/community',
    description: 'Membership / community landing content.',
    suggestedSections: ['intro', 'pillars', 'benefits', 'cta'],
  },
  {
    slug: 'contact',
    label: 'Contact',
    path: '/contact',
    description: 'Contact hero, details, and FAQ.',
    suggestedSections: ['hero', 'details', 'faq'],
  },
]

export const ADMIN_PAGES_MEDIA_TAB = {
  slug: 'media',
  label: 'Media library',
  description: 'Images, videos, and PDFs used across the site.',
  editorPath: '/admin/media',
}

export function getAdminSitePage(slug) {
  return ADMIN_SITE_PAGES.find((p) => p.slug === slug) || null
}

export function isAdminPagesTab(slug) {
  return slug === ADMIN_PAGES_MEDIA_TAB.slug || !!getAdminSitePage(slug)
}
