/**
 * Create the first super_admin (run once per environment).
 *
 *   node scripts/create-admin.mjs --email you@company.com --password 'YourSecurePass1' --name "Your Name"
 *
 * Or set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME in .env (gitignored).
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { devOrigin } from './dev-origin.mjs'

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
if (password.length < 8) {
  console.error('Password must be at least 8 characters.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: existing } = await supabase.from('profiles').select('user_id,email,role').eq('email', email).maybeSingle()
if (existing?.user_id) {
  let role = 'super_admin'
  let { error: upErr } = await supabase
    .from('profiles')
    .update({ role, status: 'active', full_name: fullName })
    .eq('user_id', existing.user_id)
  if (upErr?.message?.includes('profiles_role_check')) {
    role = 'admin'
    ;({ error: upErr } = await supabase
      .from('profiles')
      .update({ role, status: 'active', full_name: fullName })
      .eq('user_id', existing.user_id))
  }
  if (upErr) {
    console.error('Profile update failed:', upErr.message)
    process.exit(1)
  }
  const { error: pwdErr } = await supabase.auth.admin.updateUserById(existing.user_id, {
    password,
    email_confirm: true,
  })
  if (pwdErr) {
    console.error('Password update failed:', pwdErr.message)
    process.exit(1)
  }
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()
  const pubUrl = process.env.VITE_SUPABASE_URL?.trim() || url
  if (anonKey) {
    const pub = createClient(pubUrl, anonKey, { auth: { persistSession: false } })
    const { error: verifyErr } = await pub.auth.signInWithPassword({ email, password })
    if (verifyErr) {
      console.error('Login verification failed:', verifyErr.message)
      console.error('Check VITE_SUPABASE_ANON_KEY matches this project.')
      process.exit(1)
    }
  }
  const origin = devOrigin()
  console.log(`Updated ${role} password and profile: ${email}`)
  console.log(`Login at ${origin}/admin`)
  process.exit(0)
}

async function findAuthUserByEmail(targetEmail) {
  let page = 1
  const perPage = 200
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) return { user: null, error }
    const user = data.users.find((u) => u.email?.toLowerCase() === targetEmail)
    if (user) return { user, error: null }
    if (data.users.length < perPage) return { user: null, error: null }
    page += 1
  }
}

let userId

const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
})
if (createErr) {
  const alreadyRegistered =
    createErr.message?.includes('already been registered') ||
    createErr.message?.includes('already registered')
  if (!alreadyRegistered) {
    console.error('Create user failed:', createErr.message)
    process.exit(1)
  }
  const { user, error: findErr } = await findAuthUserByEmail(email)
  if (findErr || !user?.id) {
    console.error('User exists in Auth but could not be loaded:', findErr?.message || 'not found')
    process.exit(1)
  }
  userId = user.id
  const { error: pwdErr } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  })
  if (pwdErr) {
    console.error('Password update failed:', pwdErr.message)
    process.exit(1)
  }
  console.log(`Auth user already exists; linking profile for ${email}`)
} else {
  userId = created.user?.id
  if (!userId) {
    console.error('No user id returned')
    process.exit(1)
  }
}

const profileRow = {
  user_id: userId,
  email,
  full_name: fullName,
  status: 'active',
}

async function upsertProfile(role) {
  return supabase.from('profiles').upsert({ ...profileRow, role }, { onConflict: 'user_id' })
}

let { error: profErr } = await upsertProfile('super_admin')
if (profErr?.message?.includes('profiles_role_check')) {
  console.warn('Database role constraint is legacy — using admin. Run: supabase db push')
  ;({ error: profErr } = await upsertProfile('admin'))
}
if (profErr) {
  console.error('Profile upsert failed:', profErr.message)
  process.exit(1)
}

const { data: saved } = await supabase.from('profiles').select('role').eq('user_id', userId).single()

const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()
const pubUrl = process.env.VITE_SUPABASE_URL?.trim() || url
if (anonKey) {
  const pub = createClient(pubUrl, anonKey, { auth: { persistSession: false } })
  const { error: verifyErr } = await pub.auth.signInWithPassword({ email, password })
  if (verifyErr) {
    console.error('Login verification failed:', verifyErr.message)
    console.error('Check VITE_SUPABASE_ANON_KEY matches this project.')
    process.exit(1)
  }
}

const origin = devOrigin()
console.log(`Created ${saved?.role ?? 'admin'}: ${email}`)
console.log(`Login at ${origin}/admin`)
