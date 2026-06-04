/** Static marketing copy for home below-the-fold sections (legacy + hybrid CMS). */

function LineIcon({ children, label }) {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  )
}

export const IconBeaker = () => (
  <LineIcon label="Ignition Labs">
    <path d="M9 3h6M10 3v6l-4.6 8.1A2 2 0 0 0 7.2 20h9.6a2 2 0 0 0 1.8-2.9L14 9V3" />
    <path d="M7.5 14h9" />
  </LineIcon>
)
export const IconBolt = () => (
  <LineIcon label="Spark Challenge">
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </LineIcon>
)
export const IconMic = () => (
  <LineIcon label="Fireside Dialogues">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
    <path d="M12 18v3M8 21h8" />
  </LineIcon>
)
export const IconUsers = () => (
  <LineIcon label="Founder Mastermind">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </LineIcon>
)
export const IconGlobe = () => (
  <LineIcon label="Impact Ventures">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </LineIcon>
)

export const HOME_FIRE = [
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
]

export const HOME_WHO_STATS = [
  { value: '100+', label: 'Future Founders' },
  { value: 'Mentorship', label: 'Driven Ecosystem' },
  { value: 'Quarterly', label: 'Pitch Experiences' },
  { value: 'Real', label: 'Industry Access' },
]

export const HOME_TORCHBEARER_STATS = [
  { value: '24+', label: 'Years Leadership Experience' },
  { value: 'CEO', label: 'of Atlantic Catering' },
  { value: '600+', label: 'Employees Led' },
  { value: 'CNN', label: 'Featured Business Leader' },
]

export const HOME_PROGRAMS = [
  {
    Icon: IconBeaker,
    title: 'Ignition Labs',
    desc: 'Hands-on workshops in strategy, branding, finance, product development and business growth — from idea validation to execution.',
  },
  {
    Icon: IconBolt,
    title: 'Spark Challenge',
    desc: 'Pitch experiences that sharpen ideas, build confidence and help founders communicate their vision with clarity and purpose.',
  },
  {
    Icon: IconMic,
    title: 'Fireside Dialogues',
    desc: 'Conversations with entrepreneurs, investors and industry leaders — real stories, lessons and access.',
  },
  {
    Icon: IconUsers,
    title: 'Founder Mastermind',
    desc: 'Collaborative circles for strategic feedback, accountability and sustainable growth with mentors and peers.',
  },
  {
    Icon: IconGlobe,
    title: 'Impact Ventures',
    desc: 'Entrepreneurial solutions that combine innovation with social impact and lasting community value.',
  },
]

export const HOME_GROWTH_CYCLE = [
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
]

export const HOME_TIERS = [
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
]

export const HOME_BENEFITS = [
  'Access to Mentorship',
  'Collaborative Community',
  'Networking Opportunities',
  'Increased Visibility',
  'Hands-On Learning',
  'Funding & Growth Opportunities',
  'Personal Development',
  'Exclusive Events & Experiences',
]

export const HOME_TESTIMONIALS = [
  {
    name: 'Future Founder',
    quote: 'Placeholder for founder transformation stories.',
    avatar: '/assets/images/1531123897727-8f129e1688ce.jpg',
  },
  {
    name: 'Mentor Story',
    quote: 'Placeholder for mentorship impact experiences.',
    avatar: '/assets/images/1507003211169-0a1dd7228f2d.jpg',
  },
  {
    name: 'Community Impact',
    quote: 'Placeholder for ventures creating social change.',
    avatar: '/assets/images/1573497019940-1c28c88b4f3e.jpg',
  },
]

export const HOME_SECTION_PAD = 'py-20 md:py-28 lg:py-32'
export const HOME_CONTAINER = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-10'

/** Orange “Join The Movement” CTA band — shared compact layout */
export const MOVEMENT_CTA_PAD = 'py-12 md:py-16'
export const MOVEMENT_CTA_GRADIENT = `bg-gradient-to-br from-orange-600 to-orange-500 ${MOVEMENT_CTA_PAD}`
export const MOVEMENT_CTA_SOLID = `bg-[#F97316] ${MOVEMENT_CTA_PAD}`
export const MOVEMENT_CTA_EYEBROW = 'mb-3 block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-100'
export const MOVEMENT_CTA_HEADLINE = 'mb-4 text-3xl font-black leading-tight tracking-tight text-white md:text-4xl'
export const MOVEMENT_CTA_BODY = 'mx-auto max-w-[640px] text-base leading-relaxed text-orange-50/95'
export const MOVEMENT_CTA_ACTIONS = 'mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-3'
export const MOVEMENT_CTA_BTN_PRIMARY =
  'inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-orange-600 transition-all duration-200 ease-out hover:bg-orange-50 active:scale-[0.98] sm:w-auto'
export const MOVEMENT_CTA_BTN_SECONDARY =
  'inline-flex w-full items-center justify-center rounded-full border-2 border-white px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 ease-out hover:bg-white/10 active:scale-[0.98] sm:w-auto'
export const MOVEMENT_CTA_FOOTNOTE = 'mt-5 text-xs font-medium text-orange-50/95'
export const HOME_EYEBROW = 'block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-4'
export const HOME_HEADLINE = 'text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6'
