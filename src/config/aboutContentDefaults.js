export const ABOUT_PAGE_CONTENT_KEY = 'about.page.v1'

export const DEFAULT_ABOUT_PAGE_CONTENT = {
  vision: {
    title: 'Vision',
    body:
      'To build a global network of forward-thinking entrepreneurs who drive innovation, lead with resilience, and create meaningful impact.\n\nWe envision a world where young founders transform industries, uplift communities and shape the future through purposeful, sustainable businesses.',
  },
  mission: {
    title: 'Mission',
    body:
      'To ignite and sustain a thriving entrepreneurial ecosystem that empowers young innovators through mentorship, resources, and opportunities to transform bold ideas into lasting ventures.',
  },
  fire_values: {
    eyebrow: 'The Ember Circle',
    title: 'Our Core Values',
    description: 'We embody the spirit of FIRE, a philosophy that fuels our mission.',
    items: [
      {
        letter: 'F',
        title: 'Fostering Potential',
        description:
          'We believe every great entrepreneur starts somewhere. We cultivate an environment where raw potential is refined into real-world success.',
      },
      {
        letter: 'I',
        title: 'Igniting Innovation',
        description:
          'Bold ideas drive change. We encourage creative problem-solving, disruptive thinking, and pioneering leadership.',
      },
      {
        letter: 'R',
        title: 'Resilience in Action',
        description:
          'Every journey has setbacks, but we view challenges as stepping stones. We instill perseverance, adaptability, and a mindset that thrives under pressure.',
      },
      {
        letter: 'E',
        title: 'Empowering Growth',
        description:
          'Mentorship, knowledge, and strategic partnerships ignite success. We equip our members with the tools to elevate themselves and their ventures.',
      },
    ],
  },
  why_join: {
    eyebrow: 'Why Join Us',
    title: 'What members gain at TEN',
    image: '',
    benefits: [
      'Access to Mentorship',
      'Collaborative Network',
      'Increased Visibility & Business Exposure',
      'Access to Exclusive Resources',
      'Access to Funding & Opportunities',
      'Personal Development',
      'Hands-on Learning Opportunities',
      'Networking with Seasoned Industry Professionals & Entrepreneurs',
    ],
  },
  social_links: [
    {
      label: 'The Ember Network Instagram',
      href: 'https://www.instagram.com/theembernetwork',
      primary: true,
    },
    {
      label: 'The Ember Network LinkedIn',
      href: 'https://www.linkedin.com/company/theembernetwork',
    },
    {
      label: 'The Ember Network Facebook',
      href: 'https://www.facebook.com/theembernetwork',
    },
  ],
  cta_buttons: [
    { label: 'Continue to Programs', href: '/programs', primary: true },
    { label: 'Apply to Join', href: '/community' },
    { label: 'Explore Resources', href: '/resources' },
  ],
  marquee_items: [
    'Entrepreneur of the week: Maya - scaling eco logistics',
    'Testimonial: I found my cofounder in two weeks',
    'Spotlight: AI mentor circles now open worldwide',
    'New challenge: Build a social-impact prototype in 30 days',
  ],
}

export function mergeAboutPageContent(override) {
  const base = structuredClone(DEFAULT_ABOUT_PAGE_CONTENT)
  if (!override || typeof override !== 'object') return base
  return {
    ...base,
    ...override,
    vision: { ...base.vision, ...(override.vision || {}) },
    mission: { ...base.mission, ...(override.mission || {}) },
    fire_values: {
      ...base.fire_values,
      ...(override.fire_values || {}),
      items: override.fire_values?.items?.length ? override.fire_values.items : base.fire_values.items,
    },
    why_join: {
      ...base.why_join,
      ...(override.why_join || {}),
      benefits: override.why_join?.benefits?.length ? override.why_join.benefits : base.why_join.benefits,
    },
    social_links: override.social_links?.length ? override.social_links : base.social_links,
    cta_buttons: override.cta_buttons?.length ? override.cta_buttons : base.cta_buttons,
    marquee_items: override.marquee_items?.length ? override.marquee_items : base.marquee_items,
  }
}
