/**
 * Seed page.{slug}.hero.v1 keys in site_content.
 * node scripts/bootstrap-page-heroes.mjs
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_PAGE_HEROES, PAGE_HERO_PAGES, pageHeroKey } from '../src/config/pageHeroDefaults.js'

// Keeps CMS hero copy in sync with programsPageContent / ProgramsPage.jsx

dotenv.config({ path: ['.env', '.env.local'], override: true })

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

for (const { slug } of PAGE_HERO_PAGES) {
  const hero = DEFAULT_PAGE_HEROES[slug]
  if (!hero) continue
  const rowKey = pageHeroKey(slug)
  const { error } = await supabase.from('site_content').upsert(
    { key: rowKey, value: hero, updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
  if (error) {
    console.error(`Failed ${rowKey}:`, error.message)
    process.exit(1)
  }
  console.log(`Upserted ${rowKey}`)
}

console.log('Done.')
