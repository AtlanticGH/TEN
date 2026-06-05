export const ABOUT_FOUNDER_KEY = 'about.founder.v1'
export const ABOUT_TEAM_KEY = 'about.team.v1'
export const HOME_TORCHBEARER_KEY = 'home.torchbearer.v1'

export const DEFAULT_SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/theembernetwork' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/theembernetwork' },
  { label: 'Facebook', href: 'https://www.facebook.com/theembernetwork' },
]

export const DEFAULT_ABOUT_FOUNDER = {
  eyebrow: 'Meet Our Founder',
  title: 'Maud Lindsay-Gamrat',
  subtitle: 'Founder & Executive Director',
  image: '',
  image_fallback: '',
  body:
    "Maud Lindsay-Gamrat is a dynamic entrepreneur and seasoned business leader with over two decades of experience in Ghana's corporate landscape. As the CEO of Atlantic, she has built a thriving company delivering world-class catering and hospitality solutions across inflight, offshore, remote site, and corporate operations on some of the continent's largest oil and gas and mining sites.\n\nUnder her leadership, Atlantic has grown into a powerhouse employing more than 545 staff, with approximately 98% being Ghanaians, reflecting her strong commitment to local capacity building. Across a 24-year career spanning Sales, Marketing, Human Resources, and Finance, she has launched and managed major remote-site hospitality projects with consistent operational excellence.\n\nHer strategic vision has earned notable recognition, including Most Outstanding Female-Owned Business in Ghana's Upstream Petroleum Sector (Petroleum Commission of Ghana) and Glitz Woman of the Year for Catering and Hospitality (Glitz Africa). She has also been featured on global platforms such as CNN's \"Passion to Portfolio\" for her impact as a business leader.\n\nBeyond business, Maud is deeply committed to women's empowerment and entrepreneurship. Through The Ember Network, she is focused on equipping and connecting ambitious entrepreneurs, especially women, by building a supportive ecosystem that fosters innovation, leadership, and sustainable venture growth.",
  social_links: [...DEFAULT_SOCIAL_LINKS],
}

export const DEFAULT_ABOUT_TEAM = {
  eyebrow: 'Meet The Team',
  title: 'The people powering TEN',
  items: [
    {
      title: 'Program Lead',
      description: 'Designs weekly and monthly activities that keep members accountable and growth-focused.',
      image: '',
      image_fallback: '',
      social_links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com' },
        { label: 'Instagram', href: 'https://www.instagram.com' },
      ],
    },
    {
      title: 'Mentor Relations',
      description: 'Connects members with experienced founders, experts, and strategic advisors.',
      image: '',
      image_fallback: '',
      social_links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com' },
        { label: 'Instagram', href: 'https://www.instagram.com' },
      ],
    },
    {
      title: 'Member Engagement Lead',
      description: 'Cultivates engagement across circles, events, and founder collaboration touchpoints.',
      image: '',
      image_fallback: '',
      social_links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com' },
        { label: 'Instagram', href: 'https://www.instagram.com' },
      ],
    },
    {
      title: 'Partnerships & Growth',
      description: 'Builds ecosystem partnerships that expand opportunity for TEN members.',
      image: '',
      image_fallback: '',
      social_links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com' },
        { label: 'Instagram', href: 'https://www.instagram.com' },
      ],
    },
  ],
}

export const DEFAULT_HOME_TORCHBEARER = {
  eyebrow: 'Leadership',
  title: 'Meet the Torchbearer',
  name: 'Maud Lindsay-Gamrat',
  tagline: 'Entrepreneur. Mentor. Builder of Possibilities.',
  subtitle: 'The Flame Behind the Vision',
  image: '',
  image_fallback: '',
  stats: [
    { value: '24+', label: 'Years Leadership Experience' },
    { value: 'CEO', label: 'of Atlantic Catering' },
    { value: '600+', label: 'Employees Led' },
    { value: 'CNN', label: 'Featured Business Leader' },
  ],
  story_link: '/about',
  story_link_label: 'Read her full story',
  social_links: [...DEFAULT_SOCIAL_LINKS],
}
