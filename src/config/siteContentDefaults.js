/** Canonical home hero copy — used as merge fallback and CMS bootstrap default. */
export const DEFAULT_HOME_HERO = {
  badge: 'A COMMUNITY OF IGNITION & EMPOWERMENT',
  headline_before: 'Small sparks ignite',
  headline_emphasis: 'big dreams at The Ember Network',
  description:
    'We help aspiring entrepreneurs and early-stage founders transform bold ideas into lasting ventures through mentorship, structured learning, and meaningful connections.',
  cta_primary_label: 'Apply for Membership',
  cta_primary_href: '/apply',
  cta_secondary_label: 'Explore Our Story',
  cta_secondary_href: '/about',
  background_image:
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
}

/** Empty form shape for admin editor before load. */
export const EMPTY_HOME_HERO = {
  badge: '',
  headline_before: '',
  headline_emphasis: '',
  description: '',
  cta_primary_label: '',
  cta_primary_href: '/apply',
  cta_secondary_label: '',
  cta_secondary_href: '/about',
  background_image: '',
}

export const HOME_HERO_FIELD_KEYS = Object.keys(DEFAULT_HOME_HERO)
