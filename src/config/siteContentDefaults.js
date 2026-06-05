export const HOME_HERO_KEY = 'home.hero.v1'

/** Canonical home hero copy — used as merge fallback and CMS bootstrap default. */
export const DEFAULT_HOME_HERO = {
  badge: 'A COMMUNITY OF IGNITION & EMPOWERMENT',
  headline_before: 'Here, Small Sparks Ignite',
  headline_emphasis: 'Big Dreams',
  description:
    'We help aspiring entrepreneurs and early-stage founders transform bold ideas into lasting ventures through mentorship, structured learning, and meaningful connections.',
  cta_primary_label: 'Apply for Membership',
  cta_primary_href: '/apply',
  cta_secondary_label: 'Explore Our Story',
  cta_secondary_href: '/about',
  background_image: '/assets/images/1523240795612-9a054b0db644.jpg',
  background_video: '',
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
  background_video: '',
}

export const HOME_HERO_FIELD_KEYS = Object.keys(DEFAULT_HOME_HERO)
