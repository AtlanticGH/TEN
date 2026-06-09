export const HOME_PAGE_CONTENT_KEY = 'home.page.v1'

export const DEFAULT_HOME_PAGE_CONTENT = {
  purpose: {
    eyebrow: 'Our Purpose',
    title: 'Every Venture Begins With a Spark',
    description:
      'Entrepreneurship starts with belief, but growth requires guidance, community and opportunity. The Ember Network exists to transform raw ambition into lasting impact.',
  },
  who: {
    eyebrow: 'Who We Are',
    title: 'More Than A Network',
    paragraphs: [
      'We are a transformative ecosystem for emerging entrepreneurs, equipping ambitious innovators with mentorship, strategic guidance, collaboration and the tools to thrive in today\u2019s world.',
      'We exist to nurture bold thinkers, resilient builders and purpose-driven founders who are ready to shape industries and uplift communities.',
    ],
    story: {
      sections: [
        {
          eyebrow: 'Our Story',
          title: 'A transformative hub for emerging entrepreneurs',
          paragraphs: [
            'The Ember Network is dedicated to turning ambitious ideas into thriving enterprises. We provide mentorship, strategic guidance, and a supportive ecosystem where young visionaries gain the skills, knowledge, and connections they need to succeed.',
            'More than a network, TEN is a movement where small sparks of potential ignite into powerful flames of achievement.',
          ],
        },
        {
          eyebrow: 'Background',
          title: 'Bridging ambition and execution',
          paragraphs: [
            'Entrepreneurship begins with a spark, but it takes the right environment to turn that spark into a lasting fire. TEN was founded to close the gap between ambition and execution through structured mentorship, hands-on learning, and a strong community.',
            'We connect aspiring entrepreneurs with experienced mentors and industry leaders, creating a space where ideas are nurtured, resilience is built, and businesses take flight.',
          ],
        },
      ],
      image: {
        src: '/assets/images/1521737604893-d14cc237f11d.jpg',
        alt: 'Entrepreneurs collaborating in a workshop',
      },
    },
    mission: {
      eyebrow: 'Our Mission',
      body: 'To ignite and sustain a thriving entrepreneurial ecosystem that empowers young innovators through mentorship, resources and opportunities to transform bold ideas into lasting ventures.',
      image: '/assets/images/1520607162513-77705c0f0d4a.jpg',
      image_alt: 'Members collaborating at a TEN session',
    },
    vision: {
      eyebrow: 'Our Vision',
      body: 'To build a global network of forward-thinking entrepreneurs who drive innovation, lead with resilience and create meaningful impact.',
      image: '/assets/images/1517048676732-d65bc937f952.jpg',
      image_alt: 'Founders connecting at a TEN community event',
    },
    fire: {
      eyebrow: 'The FIRE Philosophy',
      title: 'What Keeps Our Flame Burning',
      items: [
        {
          letter: 'F',
          title: 'Fostering Potential',
          body: 'Every great founder starts somewhere. We cultivate raw ambition into real-world success by creating environments where emerging entrepreneurs can grow with confidence and purpose.',
        },
        {
          letter: 'I',
          title: 'Igniting Innovation',
          body: 'Bold ideas create transformative futures. We encourage disruptive thinking, creative problem-solving and visionary leadership that inspires meaningful change.',
        },
        {
          letter: 'R',
          title: 'Resilience In Action',
          body: 'Growth is built through perseverance. We empower founders to navigate challenges with adaptability, courage and determination.',
        },
        {
          letter: 'E',
          title: 'Empowering Growth',
          body: 'Mentorship fuels transformation. Through guidance, strategic partnerships and opportunities, we equip members with the tools needed to elevate their ventures and impact.',
        },
      ],
    },
    stats: [
      { value: '100+', label: 'Future Founders' },
      { value: 'Mentorship', label: 'Driven Ecosystem' },
      { value: 'Quarterly', label: 'Pitch Experiences' },
      { value: 'Real', label: 'Industry Access' },
    ],
  },
  quote: {
    text: 'When young people are empowered with guidance and opportunity, they don\u2019t just build businesses \u2014 they transform communities.',
    attribution: '\u2014 Maud Lindsay-Gamrat, Founder',
  },
  programs: {
    eyebrow: 'Programs & Experiences',
    title: 'How We Build Our Founders',
    description:
      'The Ember Network combines mentorship, practical learning and collaborative experiences to help entrepreneurs move confidently from idea to execution.',
    items: [
      {
        icon: 'beaker',
        title: 'Ignition Labs',
        desc: 'Hands-on workshops in strategy, branding, finance, product development and business growth — from idea validation to execution.',
      },
      {
        icon: 'bolt',
        title: 'Spark Challenge',
        desc: 'Pitch experiences that sharpen ideas, build confidence and help founders communicate their vision with clarity and purpose.',
      },
      {
        icon: 'mic',
        title: 'Fireside Dialogues',
        desc: 'Conversations with entrepreneurs, investors and industry leaders — real stories, lessons and access.',
      },
      {
        icon: 'users',
        title: 'Founder Mastermind',
        desc: 'Collaborative circles for strategic feedback, accountability and sustainable growth with mentors and peers.',
      },
      {
        icon: 'globe',
        title: 'Impact Ventures',
        desc: 'Entrepreneurial solutions that combine innovation with social impact and lasting community value.',
      },
    ],
    growth_cycle: {
      eyebrow: 'The Growth Cycle',
      title: 'A Rhythm Built for Momentum',
      items: [
        {
          num: '01',
          title: 'Weekly Momentum',
          tagline: 'Learn. Build. Present. Improve.',
          body: 'Weekly tasks on ideation, research, business models and strategy — with peer reviews and presentations for accountability.',
        },
        {
          num: '02',
          title: 'Monthly Immersion',
          tagline: 'Workshops. Mentorship. Networking.',
          body: 'Expert-led workshops, progress reviews and networking with personalized feedback on each venture.',
        },
        {
          num: '03',
          title: 'Quarterly Elevation',
          tagline: 'Exposure. Impact. Transformation.',
          body: 'Pitch experiences, masterclasses and innovation challenges — integrating social impact into scalable solutions.',
        },
      ],
    },
  },
  community: {
    eyebrow: 'Community & Membership',
    title: 'Find Your Circle',
    description:
      'Built for ambitious individuals ready to learn, collaborate and grow within a community of forward-thinking entrepreneurs.',
    tiers: [
      {
        name: 'Aspiring Entrepreneurs',
        desc: 'For dreamers ready to begin transforming ideas into action.',
        cta: 'Apply Now',
        to: '/community',
        featured: false,
      },
      {
        name: 'Early-Stage Founders',
        desc: 'For builders refining, growing and scaling their ventures.',
        cta: 'Apply Now',
        to: '/community',
        featured: true,
      },
      {
        name: 'Mentors & Investors',
        desc: 'For experienced leaders ready to guide the next generation.',
        cta: 'Join Us',
        to: '/community',
        featured: false,
      },
    ],
    benefits: [
      'Access to Mentorship',
      'Collaborative Community',
      'Networking Opportunities',
      'Increased Visibility',
      'Hands-On Learning',
      'Funding & Growth Opportunities',
      'Personal Development',
      'Exclusive Events & Experiences',
    ],
  },
  testimonials: {
    eyebrow: 'Impact Stories',
    title: 'Sparks Becoming Success Stories',
    description:
      'Every entrepreneur begins with potential. Through mentorship, collaboration and opportunity, those sparks evolve into stories of growth, resilience and transformation.',
    items: [
      {
        name: 'Future Founder',
        quote: 'Placeholder for founder transformation stories.',
        avatar: '',
      },
      {
        name: 'Mentor Story',
        quote: 'Placeholder for mentorship impact experiences.',
        avatar: '',
      },
      {
        name: 'Community Impact',
        quote: 'Placeholder for ventures creating social change.',
        avatar: '',
      },
    ],
  },
  cta: {
    eyebrow: 'Join The Movement',
    title: 'The Future Needs Builders Like You',
    body: 'Your ideas matter. Your vision deserves guidance. Your future deserves community. The Ember Network exists to help ambitious entrepreneurs ignite their potential and build lasting impact.',
    primary_label: 'Become An Ember',
    primary_href: '/community',
    secondary_label: 'Join The Network',
    secondary_href: '/community',
  },
}

function pickString(override, fallback) {
  if (typeof override === 'string' && override.trim()) return override
  return fallback
}

function pickStringList(override, fallback) {
  if (!Array.isArray(override)) return [...fallback]
  const list = override.map((s) => String(s || '').trim()).filter(Boolean)
  return list.length ? list : [...fallback]
}

function mergeStorySections(override, fallback) {
  if (!Array.isArray(override) || !override.length) return fallback.map((s) => ({ ...s, paragraphs: [...s.paragraphs] }))
  return override.map((section, i) => {
    const def = fallback[i] || fallback[0] || { eyebrow: '', title: '', paragraphs: [] }
    return {
      eyebrow: pickString(section?.eyebrow, def.eyebrow),
      title: pickString(section?.title, def.title),
      paragraphs: pickStringList(section?.paragraphs, def.paragraphs),
    }
  })
}

function mergeStoryImage(override, fallback) {
  if (override?.image?.src) {
    return {
      src: override.image.src,
      alt: pickString(override.image.alt, fallback.alt),
    }
  }
  if (Array.isArray(override?.images) && override.images[0]?.src) {
    return {
      src: override.images[0].src,
      alt: pickString(override.images[0].alt, fallback.alt),
    }
  }
  return { ...fallback }
}

function mergeStats(override, fallback) {
  if (!Array.isArray(override) || !override.length) return [...fallback]
  return override
    .map((item, i) => ({
      value: pickString(item?.value, fallback[i]?.value || ''),
      label: pickString(item?.label, fallback[i]?.label || ''),
    }))
    .filter((item) => item.value || item.label)
}

function mergeFireItems(override, fallback) {
  if (!Array.isArray(override) || !override.length) return fallback.map((item) => ({ ...item }))
  return override.map((item, i) => {
    const def = fallback[i] || fallback[0]
    return {
      letter: pickString(item?.letter, def?.letter || 'F').slice(0, 1).toUpperCase(),
      title: pickString(item?.title, def?.title || ''),
      body: pickString(item?.body, def?.body || ''),
    }
  })
}

function mergePrograms(override, fallback) {
  if (!Array.isArray(override) || !override.length) return fallback.map((item) => ({ ...item }))
  return override.map((item, i) => {
    const def = fallback[i] || fallback[0]
    return {
      icon: pickString(item?.icon, def?.icon || 'beaker'),
      title: pickString(item?.title, def?.title || ''),
      desc: pickString(item?.desc, def?.desc || ''),
    }
  })
}

function mergeGrowthItems(override, fallback) {
  if (!Array.isArray(override) || !override.length) return fallback.map((item) => ({ ...item }))
  return override.map((item, i) => {
    const def = fallback[i] || fallback[0]
    return {
      num: pickString(item?.num, def?.num || ''),
      title: pickString(item?.title, def?.title || ''),
      tagline: pickString(item?.tagline, def?.tagline || ''),
      body: pickString(item?.body, def?.body || ''),
    }
  })
}

function mergeTiers(override, fallback) {
  if (!Array.isArray(override) || !override.length) return fallback.map((item) => ({ ...item }))
  return override.map((item, i) => {
    const def = fallback[i] || fallback[0]
    return {
      name: pickString(item?.name, def?.name || ''),
      desc: pickString(item?.desc, def?.desc || ''),
      cta: pickString(item?.cta, def?.cta || 'Apply Now'),
      to: pickString(item?.to, def?.to || '/community'),
      featured: typeof item?.featured === 'boolean' ? item.featured : def?.featured || false,
    }
  })
}

function mergeTestimonials(override, fallback) {
  if (!Array.isArray(override) || !override.length) return fallback.map((item) => ({ ...item }))
  return override.map((item, i) => {
    const def = fallback[i] || fallback[0]
    return {
      name: pickString(item?.name, def?.name || ''),
      quote: pickString(item?.quote, def?.quote || ''),
      avatar: typeof item?.avatar === 'string' ? item.avatar : def?.avatar || '',
    }
  })
}

export function mergeHomePageContent(defaults, override) {
  if (!override || typeof override !== 'object') {
    return JSON.parse(JSON.stringify(defaults))
  }

  const d = defaults
  const o = override

  return {
    purpose: {
      eyebrow: pickString(o.purpose?.eyebrow, d.purpose.eyebrow),
      title: pickString(o.purpose?.title, d.purpose.title),
      description: pickString(o.purpose?.description, d.purpose.description),
    },
    who: {
      eyebrow: pickString(o.who?.eyebrow, d.who.eyebrow),
      title: pickString(o.who?.title, d.who.title),
      paragraphs: pickStringList(o.who?.paragraphs, d.who.paragraphs),
      story: {
        sections: mergeStorySections(o.who?.story?.sections, d.who.story.sections),
        image: mergeStoryImage(o.who?.story, d.who.story.image),
      },
      mission: {
        eyebrow: pickString(o.who?.mission?.eyebrow, d.who.mission.eyebrow),
        body: pickString(o.who?.mission?.body, d.who.mission.body),
        image: pickString(o.who?.mission?.image, d.who.mission.image),
        image_alt: pickString(o.who?.mission?.image_alt, d.who.mission.image_alt),
      },
      vision: {
        eyebrow: pickString(o.who?.vision?.eyebrow, d.who.vision.eyebrow),
        body: pickString(o.who?.vision?.body, d.who.vision.body),
        image: pickString(o.who?.vision?.image, d.who.vision.image),
        image_alt: pickString(o.who?.vision?.image_alt, d.who.vision.image_alt),
      },
      fire: {
        eyebrow: pickString(o.who?.fire?.eyebrow, d.who.fire.eyebrow),
        title: pickString(o.who?.fire?.title, d.who.fire.title),
        items: mergeFireItems(o.who?.fire?.items, d.who.fire.items),
      },
      stats: mergeStats(o.who?.stats, d.who.stats),
    },
    quote: {
      text: pickString(o.quote?.text, d.quote.text),
      attribution: pickString(o.quote?.attribution, d.quote.attribution),
    },
    programs: {
      eyebrow: pickString(o.programs?.eyebrow, d.programs.eyebrow),
      title: pickString(o.programs?.title, d.programs.title),
      description: pickString(o.programs?.description, d.programs.description),
      items: mergePrograms(o.programs?.items, d.programs.items),
      growth_cycle: {
        eyebrow: pickString(o.programs?.growth_cycle?.eyebrow, d.programs.growth_cycle.eyebrow),
        title: pickString(o.programs?.growth_cycle?.title, d.programs.growth_cycle.title),
        items: mergeGrowthItems(o.programs?.growth_cycle?.items, d.programs.growth_cycle.items),
      },
    },
    community: {
      eyebrow: pickString(o.community?.eyebrow, d.community.eyebrow),
      title: pickString(o.community?.title, d.community.title),
      description: pickString(o.community?.description, d.community.description),
      tiers: mergeTiers(o.community?.tiers, d.community.tiers),
      benefits: pickStringList(o.community?.benefits, d.community.benefits),
    },
    testimonials: {
      eyebrow: pickString(o.testimonials?.eyebrow, d.testimonials.eyebrow),
      title: pickString(o.testimonials?.title, d.testimonials.title),
      description: pickString(o.testimonials?.description, d.testimonials.description),
      items: mergeTestimonials(o.testimonials?.items, d.testimonials.items),
    },
    cta: {
      eyebrow: pickString(o.cta?.eyebrow, d.cta.eyebrow),
      title: pickString(o.cta?.title, d.cta.title),
      body: pickString(o.cta?.body, d.cta.body),
      primary_label: pickString(o.cta?.primary_label, d.cta.primary_label),
      primary_href: pickString(o.cta?.primary_href, d.cta.primary_href),
      secondary_label: pickString(o.cta?.secondary_label, d.cta.secondary_label),
      secondary_href: pickString(o.cta?.secondary_href, d.cta.secondary_href),
    },
  }
}
