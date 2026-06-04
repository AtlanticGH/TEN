/**
 * Seed homepage page_blocks from site hero defaults + starter sections.
 * Run after migrations: node scripts/bootstrap-homepage-blocks.mjs
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_HOME_HERO } from '../src/config/siteContentDefaults.js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const { data: page, error: pageErr } = await supabase.from('pages').select('id').eq('slug', 'home').maybeSingle()
if (pageErr || !page) {
  console.error('Home page not found. Run supabase migrations first.')
  process.exit(1)
}

const fullSeed = process.argv.includes('--full')
const force = process.argv.includes('--force')

const { count } = await supabase.from('page_blocks').select('id', { count: 'exact', head: true }).eq('page_id', page.id)
if (count > 0 && !force) {
  console.log(`Home already has ${count} block(s). Skipping (use --force to replace, or delete blocks first).`)
  process.exit(0)
}

if (count > 0 && force) {
  const { error: delErr } = await supabase.from('page_blocks').delete().eq('page_id', page.id)
  if (delErr) {
    console.error('Failed to clear blocks:', delErr.message)
    process.exit(1)
  }
  console.log('Cleared existing home blocks.')
}

const heroBlock = {
  block_type: 'hero',
  sort_order: 0,
  content: {
    variant: 'gateway',
    hide_legacy_sections: false,
    badge: DEFAULT_HOME_HERO.badge,
    headline_before: DEFAULT_HOME_HERO.headline_before,
    headline_emphasis: DEFAULT_HOME_HERO.headline_emphasis,
    description: DEFAULT_HOME_HERO.description,
    background_image: DEFAULT_HOME_HERO.background_image,
    background_video: DEFAULT_HOME_HERO.background_video || '',
    cta_primary_label: DEFAULT_HOME_HERO.cta_primary_label,
    cta_primary_href: DEFAULT_HOME_HERO.cta_primary_href,
    cta_secondary_label: DEFAULT_HOME_HERO.cta_secondary_label,
    cta_secondary_href: DEFAULT_HOME_HERO.cta_secondary_href,
  },
}

const blocks = fullSeed
  ? [
      {
        ...heroBlock,
        content: { ...heroBlock.content, hide_legacy_sections: false },
      },
    ]
  : [heroBlock]

for (const b of blocks) {
  const { error } = await supabase.from('page_blocks').insert({
    page_id: page.id,
    block_type: b.block_type,
    content: b.content,
    sort_order: b.sort_order,
    enabled: true,
  })
  if (error) {
    console.error('Insert failed:', error.message)
    process.exit(1)
  }
  console.log(`Added block: ${b.block_type}`)
}

await supabase.from('pages').update({ status: 'published' }).eq('id', page.id)
const mode = fullSeed ? 'CMS hero only (built-in sections below hero)' : 'hybrid (CMS hero + built-in sections)'
console.log(`Home page published (${mode}). Edit hero in Admin → Pages → home → Edit blocks.`)
