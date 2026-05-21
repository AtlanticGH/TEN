/**
 * Optional starter resources for the public /resources page (idempotent by title).
 * Run: npm run bootstrap:resources
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const url = process.env.SUPABASE_URL?.trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const SAMPLES = [
  {
    title: 'Business Model Canvas Template',
    description: 'A one-page framework to map your value proposition, customers, and revenue streams.',
    category: 'Templates',
    file_url: 'https://www.strategyzer.com/canvas/business-model-canvas',
  },
  {
    title: 'Pitch Deck Outline',
    description: 'Suggested slide order and talking points for early-stage founder pitches.',
    category: 'Guides',
    file_url: 'https://www.sequoiacap.com/article/writing-a-business-plan/',
  },
  {
    title: 'Weekly Accountability Worksheet',
    description: 'Track goals, blockers, and mentor follow-ups for your TEN mentorship track.',
    category: 'Worksheets',
    file_url: null,
  },
]

for (const sample of SAMPLES) {
  const { data: existing } = await supabase
    .from('resources')
    .select('id, title')
    .eq('title', sample.title)
    .maybeSingle()

  if (existing?.id) {
    console.log(`Already exists: ${sample.title}`)
    continue
  }

  const { error } = await supabase.from('resources').insert({
    title: sample.title,
    description: sample.description,
    category: sample.category,
    bucket: 'public',
    file_url: sample.file_url,
  })
  if (error) {
    console.error(`Failed ${sample.title}:`, error.message)
    process.exit(1)
  }
  console.log(`Created: ${sample.title}`)
}

console.log('Done. Public page: http://localhost:5173/resources')
