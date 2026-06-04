/**
 * Adds Blog to main navigation if missing (for DBs seeded before blog nav).
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

const { data: nav, error: navErr } = await supabase.from('navigation').select('id').eq('key', 'main').maybeSingle()
if (navErr || !nav) {
  console.error('Main navigation not found.')
  process.exit(1)
}

const { data: existing } = await supabase
  .from('navigation_items')
  .select('id')
  .eq('navigation_id', nav.id)
  .eq('href', '/blog')
  .maybeSingle()

if (existing) {
  console.log('Blog nav item already exists.')
  process.exit(0)
}

const { error } = await supabase.from('navigation_items').insert({
  navigation_id: nav.id,
  label: 'Blog',
  href: '/blog',
  sort_order: 35,
  enabled: true,
})

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log('Added Blog to main navigation (/blog).')
