/**
 * Seed About + Programs page_blocks from legacy JSX content.
 * node scripts/bootstrap-marketing-pages.mjs [--force] [--slug=about|programs]
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const force = process.argv.includes('--force')
const slugArg = process.argv.find((a) => a.startsWith('--slug='))
const onlySlug = slugArg ? slugArg.split('=')[1]?.trim() : ''

const FOUNDER_HTML = `
<article class="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
  <div class="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
    <div class="relative min-h-[260px]">
      <img src="/assets/images/profiles/ceo portrat 7.png" alt="Maud Lindsay-Gamrat" class="h-full w-full object-cover" loading="lazy" />
    </div>
    <div class="p-8 md:p-10">
      <p class="text-xs uppercase tracking-[0.18em] text-orange-500">Meet Our Founder</p>
      <h2 class="mt-3 text-3xl font-semibold md:text-4xl">Maud Lindsay-Gamrat</h2>
      <p class="mt-2 text-sm text-zinc-500">Founder &amp; Executive Director</p>
      <p class="mt-5 text-zinc-600">Maud Lindsay-Gamrat is a dynamic entrepreneur and seasoned business leader with over two decades of experience in Ghana's corporate landscape. As the CEO of Atlantic, she has built a thriving company delivering world-class catering and hospitality solutions.</p>
      <p class="mt-4 text-zinc-600">Under her leadership, Atlantic has grown into a powerhouse employing more than 545 staff, with approximately 98% being Ghanaians. Her strategic vision has earned notable recognition across Ghana's upstream petroleum and hospitality sectors.</p>
      <p class="mt-4 text-zinc-600">Through The Ember Network, she is focused on equipping ambitious entrepreneurs, especially women, by building a supportive ecosystem that fosters innovation, leadership, and sustainable venture growth.</p>
    </div>
  </div>
</article>`.trim()

const WHY_JOIN_HTML = `
<article class="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
  <div class="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
    <div class="min-h-[250px]">
      <img src="/assets/images/1520607162513-77705c0f0d4a.jpg" alt="Members collaborating" class="h-full w-full object-cover" loading="lazy" />
    </div>
    <div class="p-8 md:p-10">
      <p class="text-xs uppercase tracking-[0.18em] text-orange-500">Why Join Us</p>
      <h2 class="mt-3 text-3xl font-semibold md:text-4xl">What members gain at TEN</h2>
      <ul class="mt-5 grid gap-2 text-sm text-zinc-600 md:grid-cols-2">
        <li class="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">Access to Mentorship</li>
        <li class="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">Collaborative Network</li>
        <li class="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">Increased Visibility &amp; Business Exposure</li>
        <li class="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">Access to Exclusive Resources</li>
        <li class="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">Access to Funding &amp; Opportunities</li>
        <li class="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">Personal Development</li>
        <li class="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">Hands-on Learning Opportunities</li>
        <li class="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">Networking with Seasoned Industry Professionals</li>
      </ul>
    </div>
  </div>
</article>`.trim()

const PAGE_BLOCKS = {
  about: [
    {
      block_type: 'hero',
      sort_order: 0,
      content: {
        variant: 'inner',
        badge: 'About',
        headline_before: 'Who we are and why TEN exists',
        description:
          'The Ember Network is a transformative hub for emerging entrepreneurs, turning ambitious ideas into thriving enterprises through mentorship and strategic guidance.',
        background_image: '/assets/images/1519389950473-47ba0277781c.jpg',
      },
    },
    {
      block_type: 'text',
      sort_order: 1,
      content: {
        title: 'Vision',
        body: 'To build a global network of forward-thinking entrepreneurs who drive innovation, lead with resilience, and create meaningful impact.\n\nWe envision a world where young founders transform industries, uplift communities and shape the future through purposeful, sustainable businesses.',
      },
    },
    {
      block_type: 'text',
      sort_order: 2,
      content: {
        title: 'Mission',
        body: 'To ignite and sustain a thriving entrepreneurial ecosystem that empowers young innovators through mentorship, resources, and opportunities to transform bold ideas into lasting ventures.',
      },
    },
    {
      block_type: 'features',
      sort_order: 3,
      content: {
        eyebrow: 'The Ember Circle',
        title: 'Our Core Values',
        subtitle: 'We embody the spirit of FIRE, a philosophy that fuels our mission.',
        variant: 'cards',
        items: [
          {
            title: 'F - Fostering Potential',
            description:
              'We believe every great entrepreneur starts somewhere. We cultivate an environment where raw potential is refined into real-world success.',
          },
          {
            title: 'I - Igniting Innovation',
            description:
              'Bold ideas drive change. We encourage creative problem-solving, disruptive thinking, and pioneering leadership.',
          },
          {
            title: 'R - Resilience in Action',
            description:
              'Every journey has setbacks, but we view challenges as stepping stones. We instill perseverance, adaptability, and a mindset that thrives under pressure.',
          },
          {
            title: 'E - Empowering Growth',
            description:
              'Mentorship, knowledge, and strategic partnerships ignite success. We equip our members with the tools to elevate themselves and their ventures.',
          },
        ],
      },
    },
    {
      block_type: 'rich_text',
      sort_order: 4,
      content: { html: WHY_JOIN_HTML },
    },
    {
      block_type: 'features',
      sort_order: 5,
      content: {
        eyebrow: 'Meet The Team',
        title: 'The people powering TEN',
        variant: 'team',
        items: [
          {
            title: 'Program Lead',
            description:
              'Designs weekly and monthly activities that keep members accountable and growth-focused.',
            image: '/assets/images/profiles/team-program-lead.jpg',
            fallback_image: '/assets/images/1560250097-0b93528c311a.jpg',
          },
          {
            title: 'Mentor Relations',
            description: 'Connects members with experienced founders, experts, and strategic advisors.',
            image: '/assets/images/profiles/team-mentor-relations.jpg',
            fallback_image: '/assets/images/1573497019940-1c28c88b4f3e.jpg',
          },
          {
            title: 'Member Engagement Lead',
            description: 'Cultivates engagement across circles, events, and founder collaboration touchpoints.',
            image: '/assets/images/profiles/team-community-manager.jpg',
            fallback_image: '/assets/images/1542744173-05336fcc7ad4.jpg',
          },
          {
            title: 'Partnerships & Growth',
            description: 'Builds ecosystem partnerships that expand opportunity for TEN members.',
            image: '/assets/images/profiles/team-partnerships-growth.jpg',
            fallback_image: '/assets/images/1520607162513-77705c0f0d4a.jpg',
          },
        ],
      },
    },
    {
      block_type: 'rich_text',
      sort_order: 6,
      content: { html: FOUNDER_HTML },
    },
    {
      block_type: 'cta',
      sort_order: 7,
      content: {
        title: 'Ready to explore the program?',
        body: 'Continue to Programs or apply to join the network.',
        primary_label: 'Continue to Programs',
        primary_href: '/programs',
        secondary_label: 'Apply to Join',
        secondary_href: '/community',
      },
    },
  ],
  programs: [
    {
      block_type: 'hero',
      sort_order: 0,
      content: {
        variant: 'inner',
        badge: 'Programs',
        headline_before: 'From spark to scale',
        description:
          'Structured programs and experiences that move founders from ideation to impact — through workshops, pitch challenges, mentorship circles, and the entrepreneurial growth cycle.',
        background_image: '/assets/images/1498050108023-c5249f4df085.jpg',
      },
    },
    {
      block_type: 'text',
      sort_order: 1,
      content: {
        eyebrow: 'Program Cards',
        title: 'How We Build Our Founders',
        body: 'The Ember Network combines mentorship, practical learning and collaborative experiences to help entrepreneurs move confidently from idea to execution.',
      },
    },
    {
      block_type: 'features',
      sort_order: 2,
      content: {
        variant: 'cards',
        items: [
          {
            title: 'Ignition Labs',
            description:
              'Build the foundation behind bold ideas. Hands-on workshops in strategy, branding, finance, product development and business growth.',
            image: '/assets/images/1454165804606-c3d57bc86b40.jpg',
          },
          {
            title: 'Spark Challenge',
            description:
              'Where innovation meets opportunity. Competitive pitch experiences with expert feedback and recognition.',
            image: '/assets/images/1542744173-8e7e53415bb0.jpg',
          },
          {
            title: 'Fireside Dialogues',
            description:
              'Real stories. Real lessons. Real access. Conversations with entrepreneurs, investors and industry leaders.',
            image: '/assets/images/1573496359142-b8d87734a5a2.jpg',
          },
          {
            title: 'Founder Mastermind',
            description:
              'Growth happens in community. Collaborative circles with mentors and peers for accountability and sustainable growth.',
            image: '/assets/images/1520607162513-77705c0f0d4a.jpg',
          },
          {
            title: 'Impact Ventures',
            description:
              'Build businesses that create meaningful change — innovation with social impact and lasting value.',
            image: '/assets/images/1573496774426-fe3db3dd1731.jpg',
          },
        ],
      },
    },
    {
      block_type: 'features',
      sort_order: 3,
      content: {
        eyebrow: 'From Spark to Scale',
        title: 'The Entrepreneurial Growth Cycle',
        subtitle: 'A structured journey designed to move founders from ideation to impact.',
        variant: 'cards',
        items: [
          {
            title: 'Stage 1 — Weekly Momentum',
            description:
              'Learn. Build. Present. Improve. Weekly tasks on ideation, research, business models and strategy with peer reviews.',
          },
          {
            title: 'Stage 2 — Monthly Immersion',
            description:
              'Workshops. Mentorship. Networking. Expert-led sessions, progress reviews and meaningful networking.',
          },
          {
            title: 'Stage 3 — Quarterly Elevation',
            description:
              'Exposure. Impact. Transformation. Pitch experiences, masterclasses and innovation challenges with social impact.',
          },
        ],
      },
    },
    {
      block_type: 'cta',
      sort_order: 4,
      content: {
        variant: 'banner',
        eyebrow: 'Next step',
        title: 'Join The Ember Network',
        body: 'Apply for membership or explore learning resources to start your journey.',
        primary_label: 'Apply for Membership',
        primary_href: '/community',
        secondary_label: 'Learning Resources',
        secondary_href: '/resources',
      },
    },
  ],
}

async function seedSlug(slug) {
  const blocks = PAGE_BLOCKS[slug]
  if (!blocks) {
    console.error(`Unknown slug: ${slug}`)
    return false
  }

  const { data: page, error: pageErr } = await supabase.from('pages').select('id').eq('slug', slug).maybeSingle()
  if (pageErr || !page) {
    console.error(`Page "${slug}" not found. Run migrations first.`)
    return false
  }

  const { count } = await supabase.from('page_blocks').select('id', { count: 'exact', head: true }).eq('page_id', page.id)
  if (count > 0 && !force) {
    console.log(`[${slug}] Already has ${count} block(s). Skipping (use --force).`)
    return true
  }

  if (count > 0 && force) {
    const { error: delErr } = await supabase.from('page_blocks').delete().eq('page_id', page.id)
    if (delErr) {
      console.error(`[${slug}] Failed to clear blocks:`, delErr.message)
      return false
    }
    console.log(`[${slug}] Cleared existing blocks.`)
  }

  for (const b of blocks) {
    const { error } = await supabase.from('page_blocks').insert({
      page_id: page.id,
      block_type: b.block_type,
      content: b.content,
      sort_order: b.sort_order,
      enabled: true,
    })
    if (error) {
      console.error(`[${slug}] Insert failed (${b.block_type}):`, error.message)
      return false
    }
    console.log(`[${slug}] Added: ${b.block_type}`)
  }

  await supabase.from('pages').update({ status: 'published', layout_mode: 'blocks_only' }).eq('id', page.id)
  console.log(`[${slug}] Published (layout_mode: blocks_only).`)
  return true
}

const slugs = onlySlug ? [onlySlug] : ['about', 'programs']
let ok = true
for (const slug of slugs) {
  const result = await seedSlug(slug)
  if (!result) ok = false
}
process.exit(ok ? 0 : 1)
