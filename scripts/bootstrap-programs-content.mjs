/**
 * Seed page.programs.content.v1 in site_content.
 * node scripts/bootstrap-programs-content.mjs
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_PROGRAMS_PAGE_CONTENT, PROGRAMS_PAGE_CONTENT_KEY } from '../src/config/programsContentDefaults.js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const { error } = await supabase.from('site_content').upsert(
  { key: PROGRAMS_PAGE_CONTENT_KEY, value: DEFAULT_PROGRAMS_PAGE_CONTENT, updated_at: new Date().toISOString() },
  { onConflict: 'key' },
)

if (error) {
  console.error('Failed:', error.message)
  process.exit(1)
}

console.log(`Upserted ${PROGRAMS_PAGE_CONTENT_KEY}`)
console.log('Done.')
