/**
 * Create the first super_admin (run once per environment).
 *
 *   node scripts/create-admin.mjs --email you@company.com --password 'YourSecurePass1' --name "Your Name"
 *
 * Or set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME in .env (gitignored).
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

function arg(name) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const email = (arg('--email') || process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const password = arg('--password') || process.env.ADMIN_PASSWORD || ''
const fullName = (arg('--name') || process.env.ADMIN_NAME || 'Site Administrator').trim()

const url = process.env.SUPABASE_URL?.trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs --email you@company.com --password "..." [--name "Full Name"]')
  process.exit(1)
}
if (password.length < 10) {
  console.error('Password must be at least 10 characters.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: existing } = await supabase.from('profiles').select('user_id,email,role').eq('email', email).maybeSingle()
if (existing?.user_id) {
  const { error: upErr } = await supabase
    .from('profiles')
    .update({ role: 'super_admin', status: 'active', full_name: fullName })
    .eq('user_id', existing.user_id)
  if (upErr) {
    console.error('Profile update failed:', upErr.message)
    process.exit(1)
  }
  console.log(`Promoted existing user to super_admin: ${email}`)
  console.log('Login at http://localhost:5173/login → http://localhost:5173/admin/dashboard')
  process.exit(0)
}

const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
})
if (createErr) {
  console.error('Create user failed:', createErr.message)
  process.exit(1)
}

const userId = created.user?.id
if (!userId) {
  console.error('No user id returned')
  process.exit(1)
}

const { error: profErr } = await supabase.from('profiles').upsert(
  {
    user_id: userId,
    email,
    full_name: fullName,
    role: 'super_admin',
    status: 'active',
  },
  { onConflict: 'user_id' },
)
if (profErr) {
  console.error('Profile upsert failed:', profErr.message)
  process.exit(1)
}

console.log(`Created super_admin: ${email}`)
console.log('Login at http://localhost:5173/login → http://localhost:5173/admin/dashboard')
