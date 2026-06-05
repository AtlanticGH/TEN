/**
 * Bootstrap public site_content keys (safe to re-run — upserts).
 * node scripts/bootstrap-site-content.mjs
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_PAGE_HEROES, pageHeroKey } from '../src/config/pageHeroDefaults.js'
import { DEFAULT_ABOUT_PAGE_CONTENT, ABOUT_PAGE_CONTENT_KEY } from '../src/config/aboutContentDefaults.js'
import { DEFAULT_ABOUT_FOUNDER, DEFAULT_ABOUT_TEAM, ABOUT_FOUNDER_KEY, ABOUT_TEAM_KEY } from '../src/config/peopleContentDefaults.js'
import { DEFAULT_PROGRAMS_PAGE_CONTENT, PROGRAMS_PAGE_CONTENT_KEY } from '../src/config/programsContentDefaults.js'
import { DEFAULT_HOME_HERO, HOME_HERO_KEY } from '../src/config/siteContentDefaults.js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const rows = [
  { key: HOME_HERO_KEY, value: DEFAULT_HOME_HERO },
  { key: PROGRAMS_PAGE_CONTENT_KEY, value: DEFAULT_PROGRAMS_PAGE_CONTENT },
  { key: ABOUT_PAGE_CONTENT_KEY, value: DEFAULT_ABOUT_PAGE_CONTENT },
  { key: ABOUT_FOUNDER_KEY, value: DEFAULT_ABOUT_FOUNDER },
  { key: ABOUT_TEAM_KEY, value: DEFAULT_ABOUT_TEAM },
  ...Object.entries(DEFAULT_PAGE_HEROES).map(([slug, hero]) => ({
    key: pageHeroKey(slug),
    value: hero,
  })),
]

for (const row of rows) {
  const { error } = await supabase.from('site_content').upsert(
    { key: row.key, value: row.value, updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
  if (error) {
    console.error(`Failed ${row.key}:`, error.message)
    process.exit(1)
  }
  console.log(`Upserted ${row.key}`)
}

console.log('Done.')
