/**
 * Seed founder, team, and torchbearer CMS content (site_content).
 * node scripts/bootstrap-people-content.mjs [--force]
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

// Dynamic import of ESM defaults (eval from built-like export - use inline keys instead)
const {
  ABOUT_FOUNDER_KEY,
  ABOUT_TEAM_KEY,
  HOME_TORCHBEARER_KEY,
  DEFAULT_ABOUT_FOUNDER,
  DEFAULT_ABOUT_TEAM,
  DEFAULT_HOME_TORCHBEARER,
} = await import('../src/config/peopleContentDefaults.js')

const supabase = createClient(url, key, { auth: { persistSession: false } })
const force = process.argv.includes('--force')

const rows = [
  { key: ABOUT_FOUNDER_KEY, value: DEFAULT_ABOUT_FOUNDER },
  { key: ABOUT_TEAM_KEY, value: DEFAULT_ABOUT_TEAM },
  { key: HOME_TORCHBEARER_KEY, value: DEFAULT_HOME_TORCHBEARER },
]

for (const row of rows) {
  const { data: existing } = await supabase.from('site_content').select('key').eq('key', row.key).maybeSingle()
  if (existing && !force) {
    console.log(`Skip ${row.key} (exists). Use --force to overwrite.`)
    continue
  }
  const { error } = await supabase.from('site_content').upsert({ key: row.key, value: row.value }, { onConflict: 'key' })
  if (error) {
    console.error(row.key, error.message)
    process.exit(1)
  }
  console.log(`Upserted ${row.key}`)
}

const { data: aboutPage } = await supabase.from('pages').select('id').eq('slug', 'about').maybeSingle()
if (aboutPage?.id) {
  const { data: blocks } = await supabase.from('page_blocks').select('id, block_type, content').eq('page_id', aboutPage.id)
  const removeIds = (blocks || [])
    .filter((b) => {
      if (b.block_type === 'features' && b.content?.variant === 'team') return true
      if (b.block_type === 'rich_text' && /Meet Our Founder/i.test(String(b.content?.html || ''))) return true
      return false
    })
    .map((b) => b.id)
  if (removeIds.length) {
    await supabase.from('page_blocks').delete().in('id', removeIds)
    console.log(`Removed ${removeIds.length} duplicate about page block(s).`)
  }
}

console.log('People content ready.')
