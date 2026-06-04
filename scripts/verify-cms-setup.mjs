/**
 * Phase A/G — verify CMS tables, seed data, and env for production push.
 * Usage: node scripts/verify-cms-setup.mjs
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!url || !key) {
  console.error('FAIL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const checks = []

async function check(name, fn) {
  try {
    await fn()
    checks.push({ name, ok: true })
    console.log(`OK  ${name}`)
  } catch (err) {
    checks.push({ name, ok: false, error: err?.message })
    console.error(`FAIL ${name}:`, err?.message)
  }
}

await check('pages table', async () => {
  const { error } = await supabase.from('pages').select('slug').limit(1)
  if (error) throw error
})

await check('layout_mode column', async () => {
  const { data, error } = await supabase.from('pages').select('slug, layout_mode').eq('slug', 'home').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('home page missing — run migrations + seed')
})

await check('block_types seeded', async () => {
  const { count, error } = await supabase.from('block_types').select('key', { count: 'exact', head: true })
  if (error) throw error
  if ((count || 0) < 5) throw new Error(`expected block types, got ${count}`)
})

await check('site_settings global.v1', async () => {
  const { data, error } = await supabase.from('site_settings').select('key').eq('key', 'global.v1').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('global.v1 missing')
})

await check('main navigation', async () => {
  const { data: nav } = await supabase.from('navigation').select('id').eq('key', 'main').maybeSingle()
  if (!nav) throw new Error('main nav missing')
  const { count } = await supabase.from('navigation_items').select('id', { count: 'exact', head: true }).eq('navigation_id', nav.id)
  if (!count) throw new Error('no navigation items')
})

const failed = checks.filter((c) => !c.ok)
if (failed.length) {
  console.error(`\n${failed.length} check(s) failed. Run: npm run supabase:push && npm run bootstrap:nav`)
  process.exit(1)
}

console.log('\nAll CMS setup checks passed.')
