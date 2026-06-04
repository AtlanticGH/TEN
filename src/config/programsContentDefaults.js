/** Programs page body — stored in site_content (page.programs.content.v1). */

export const PROGRAMS_PAGE_CONTENT_KEY = 'page.programs.content.v1'

export const PROGRAM_CARD_ICON_IDS = ['beaker', 'bolt', 'mic', 'users', 'globe']

export const DEFAULT_PROGRAMS_PAGE_CONTENT = {
  cards_section: {
    eyebrow: 'Program Cards',
    title: 'How We Build Our Founders',
    body:
      'The Ember Network combines mentorship, practical learning and collaborative experiences to help entrepreneurs move confidently from idea to execution.',
  },
  cards: [
    {
      id: 'ignition-labs',
      icon: 'beaker',
      title: 'Ignition Labs',
      tagline: 'Build the foundation behind bold ideas.',
      description:
        'Hands-on workshops designed to equip founders with practical skills in strategy, branding, finance, product development and business growth. From idea validation to execution, members gain the tools needed to transform vision into viable ventures.',
      image: '/assets/images/1454165804606-c3d57bc86b40.jpg',
      image_alt: 'Founders in a hands-on workshop session',
      video: '',
    },
    {
      id: 'spark-challenge',
      icon: 'bolt',
      title: 'Spark Challenge',
      tagline: 'Where innovation meets opportunity.',
      description:
        'Competitive pitch experiences that sharpen ideas, build confidence and expose founders to expert feedback and recognition. Members learn how to communicate their vision with clarity, confidence and purpose.',
      image: '/assets/images/1542744173-8e7e53415bb0.jpg',
      image_alt: 'Founder pitching to a panel of judges',
      video: '',
    },
    {
      id: 'fireside-dialogues',
      icon: 'mic',
      title: 'Fireside Dialogues',
      tagline: 'Real stories. Real lessons. Real access.',
      description:
        'Exclusive conversations with accomplished entrepreneurs, investors and industry leaders sharing insights, failures and breakthrough moments. Designed to inspire meaningful connections and practical learning.',
      image: '/assets/images/1573496359142-b8d87734a5a2.jpg',
      image_alt: 'Speaker sharing insights at a fireside dialogue',
      video: '',
    },
    {
      id: 'founder-mastermind',
      icon: 'users',
      title: 'Founder Mastermind',
      tagline: 'Growth happens in community.',
      description:
        'Collaborative circles where founders discuss challenges, exchange ideas and receive strategic feedback from mentors and peers. Accountability and collaboration become catalysts for sustainable growth.',
      image: '/assets/images/1520607162513-77705c0f0d4a.jpg',
      image_alt: 'Founders collaborating in a mastermind circle',
      video: '',
    },
    {
      id: 'impact-ventures',
      icon: 'globe',
      title: 'Impact Ventures',
      tagline: 'Build businesses that create meaningful change.',
      description:
        'Members develop entrepreneurial solutions that combine innovation with social impact, empowering communities while building sustainable ventures. Because successful businesses should also create lasting value.',
      image: '/assets/images/1573496774426-fe3db3dd1731.jpg',
      image_alt: 'Entrepreneur leading an impact-focused venture',
      video: '',
    },
  ],
  growth_section: {
    eyebrow: 'From Spark to Scale',
    title: 'The Entrepreneurial Growth Cycle',
    body: 'A structured journey designed to move founders from ideation to impact.',
  },
  growth_stages: [
    {
      id: 'weekly-momentum',
      num: '01',
      stage: 'Stage 1',
      title: 'Weekly Momentum',
      tagline: 'Learn. Build. Present. Improve.',
      description:
        'Members complete weekly entrepreneurial tasks focused on ideation, research, business models and strategy development. Peer reviews and presentations encourage accountability, collaboration and continuous improvement.',
      image: '/assets/images/1454165804606-c3d57bc86b40.jpg',
      image_alt: 'Weekly planning and collaboration',
      video: '',
    },
    {
      id: 'monthly-immersion',
      num: '02',
      stage: 'Stage 2',
      title: 'Monthly Immersion',
      tagline: 'Workshops. Mentorship. Networking.',
      description:
        'Interactive monthly sessions bring members together for expert-led workshops, progress reviews and meaningful networking experiences. Founders gain personalized feedback while refining their business approaches.',
      image: '/assets/images/1552664730-d307ca884978.jpg',
      image_alt: 'Monthly mentor workshop',
      video: '',
    },
    {
      id: 'quarterly-elevation',
      num: '03',
      stage: 'Stage 3',
      title: 'Quarterly Elevation',
      tagline: 'Exposure. Impact. Transformation.',
      description:
        'Quarterly pitch experiences, masterclasses and innovation challenges help founders showcase growth, attract opportunities and develop scalable solutions. Members are encouraged to integrate social impact into their entrepreneurial journeys.',
      image: '/assets/images/1542744173-05336fcc7ad4.jpg',
      image_alt: 'Quarterly pitch and progress review',
      video: '',
    },
  ],
}

function mergeItemsById(defaultItems, overrideItems) {
  if (!Array.isArray(overrideItems) || overrideItems.length === 0) return defaultItems
  const map = new Map(overrideItems.map((item) => [item.id || item.title, item]))
  return defaultItems.map((item) => {
    const patch = map.get(item.id) || map.get(item.title)
    return patch ? { ...item, ...patch } : item
  })
}

/** Merge CMS overrides onto defaults (sections + card arrays by stable id). */
export function mergeProgramsPageContent(defaults, override) {
  const base = { ...defaults }
  if (!override || typeof override !== 'object') return base

  if (override.cards_section && typeof override.cards_section === 'object') {
    base.cards_section = { ...base.cards_section, ...override.cards_section }
  }
  if (override.growth_section && typeof override.growth_section === 'object') {
    base.growth_section = { ...base.growth_section, ...override.growth_section }
  }
  base.cards = mergeItemsById(base.cards, override.cards)
  base.growth_stages = mergeItemsById(base.growth_stages, override.growth_stages)
  return base
}
