/**
 * Ensure Gallery is in main navigation (replaces Blog).
 * node scripts/add-gallery-nav.mjs
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

const { data: nav } = await supabase.from('navigation').select('id').eq('key', 'main').maybeSingle()
if (!nav) {
  console.error('Main navigation not found.')
  process.exit(1)
}

await supabase.from('navigation_items').update({ label: 'Gallery', href: '/gallery' }).eq('navigation_id', nav.id).eq('href', '/blog')

const { data: existing } = await supabase
  .from('navigation_items')
  .select('id')
  .eq('navigation_id', nav.id)
  .eq('href', '/gallery')
  .maybeSingle()

if (existing) {
  console.log('Gallery already in main navigation.')
  process.exit(0)
}

const { error } = await supabase.from('navigation_items').insert({
  navigation_id: nav.id,
  label: 'Gallery',
  href: '/gallery',
  sort_order: 35,
  enabled: true,
})

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log('Added Gallery to main navigation (/gallery).')
