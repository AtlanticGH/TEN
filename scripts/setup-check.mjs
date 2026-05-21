/**
 * Production readiness check — run: node scripts/setup-check.mjs
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const url = process.env.SUPABASE_URL?.trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const anon = process.env.VITE_SUPABASE_ANON_KEY?.trim()
const viteUrl = process.env.VITE_SUPABASE_URL?.trim()

let ok = true
function pass(msg) {
  console.log(`✓ ${msg}`)
}
function fail(msg) {
  console.log(`✗ ${msg}`)
  ok = false
}

console.log('\nThe Ember Network — setup check\n')

if (viteUrl && anon) pass('Client Supabase env configured')
else fail('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')

if (url && serviceKey) pass('Server Supabase env configured')
else fail('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')

if (!url || !serviceKey) {
  console.log('\nFix env vars then re-run.\n')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const tables = ['profiles', 'courses', 'teams', 'team_members', 'site_content', 'applications']
for (const t of tables) {
  const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true })
  if (error) fail(`Table ${t}: ${error.message}`)
  else pass(`Table ${t} reachable (${count ?? 0} rows)`)
}

const { data: hero } = await supabase
  .from('site_content')
  .select('key')
  .eq('key', 'home.hero.v1')
  .maybeSingle()
if (hero) pass('CMS home hero (home.hero.v1) present')
else fail('Run: npm run bootstrap:cms')

const { data: staff } = await supabase
  .from('profiles')
  .select('email,role')
  .in('role', ['admin', 'super_admin', 'staff'])
if (staff?.length) pass(`Staff accounts: ${staff.map((s) => s.email).join(', ')}`)
else fail('Run: npm run bootstrap:admin -- --email you@company.com --password "..." --name "Your Name"')

try {
  const res = await fetch('http://localhost:3000/healthz')
  if (res.ok) pass('API server responding on :3000')
  else fail('Start API: npm run dev:all (or npm start)')
} catch {
  fail('API not running — npm run dev:all')
}

console.log(ok ? '\nAll checks passed.\n' : '\nSome checks failed — see items above.\n')
process.exit(ok ? 0 : 1)
