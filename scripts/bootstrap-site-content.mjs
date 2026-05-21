/**
 * One-time CMS bootstrap for public site_content keys.
 * Run: node scripts/bootstrap-site-content.mjs
 * Safe to re-run (upserts on key conflict).
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
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

const rows = [{ key: HOME_HERO_KEY, value: DEFAULT_HOME_HERO }]

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

console.log('Done. Verify: curl http://localhost:3000/api/public/site-content/home.hero.v1')
