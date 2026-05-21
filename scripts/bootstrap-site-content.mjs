/**
 * One-time CMS bootstrap for public site_content keys.
 * Run: node scripts/bootstrap-site-content.mjs
 * Safe to re-run (upserts on key conflict).
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

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
  {
    key: 'home.hero.v1',
    value: {
      badge: 'A COMMUNITY OF IGNITION & EMPOWERMENT',
      headline_before: 'Small sparks ignite',
      headline_emphasis: 'big dreams at The Ember Network',
      description:
        'We help aspiring entrepreneurs and early-stage founders transform bold ideas into lasting ventures through mentorship, structured learning, and meaningful connections.',
      cta_primary_label: 'Apply for Membership',
      cta_primary_href: '/apply',
      cta_secondary_label: 'Explore Our Story',
      cta_secondary_href: '/about',
      background_image:
        'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
    },
  },
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

console.log('Done. Verify: curl http://localhost:3000/api/public/site-content/home.hero.v1')
