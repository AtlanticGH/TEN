/**
 * Remove "Home" from main + footer navigation (brand links to / instead).
 * node scripts/remove-home-nav.mjs
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

for (const navKey of ['main', 'footer']) {
  const { data: nav } = await supabase.from('navigation').select('id').eq('key', navKey).maybeSingle()
  if (!nav) continue
  const { error } = await supabase
    .from('navigation_items')
    .delete()
    .eq('navigation_id', nav.id)
    .or('href.eq./,href.eq.,label.ilike.Home')
  if (error) console.error(`[${navKey}]`, error.message)
  else console.log(`Removed Home link from ${navKey} navigation (if present).`)
}

console.log('Done. Brand "The Ember Network" should be the only path to /.')
