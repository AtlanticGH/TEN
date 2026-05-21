/**
 * Create or promote a student account (local/staging).
 *
 *   node scripts/create-student.mjs --email student@company.com --password 'YourSecurePass1' --name "Student Name"
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { devOrigin } from './dev-origin.mjs'

dotenv.config({ path: ['.env', '.env.local'], override: true })

function arg(name) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const email = (arg('--email') || process.env.STUDENT_EMAIL || '').trim().toLowerCase()
const password = arg('--password') || process.env.STUDENT_PASSWORD || ''
const fullName = (arg('--name') || process.env.STUDENT_NAME || '').trim()

const url = process.env.SUPABASE_URL?.trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!email || !password) {
  console.error(
    'Usage: node scripts/create-student.mjs --email student@company.com --password "..." [--name "Full Name"]',
  )
  process.exit(1)
}
if (password.length < 10) {
  console.error('Password must be at least 10 characters.')
  process.exit(1)
}

const displayName =
  fullName ||
  email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const origin = devOrigin()

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

async function setStudentProfile(userId) {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        email,
        full_name: displayName,
        role: 'student',
        status: 'active',
      },
      { onConflict: 'user_id' },
    )
  if (error) throw error
}

const { data: existing } = await supabase.from('profiles').select('user_id,email,role').eq('email', email).maybeSingle()
if (existing?.user_id) {
  await setStudentProfile(existing.user_id)
  console.log(`Promoted existing user to student: ${email}`)
  console.log(`Login at ${origin}/login → ${origin}/dashboard`)
  process.exit(0)
}

let userId
const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: displayName },
})
if (createErr) {
  const { user, error: findErr } = await findAuthUserByEmail(email)
  if (findErr || !user) {
    console.error('Create user failed:', createErr.message)
    process.exit(1)
  }
  userId = user.id
  const { error: pwdErr } = await supabase.auth.admin.updateUserById(userId, { password })
  if (pwdErr) console.warn('Note: could not update password:', pwdErr.message)
  console.log(`Auth user already exists; linking profile for ${email}`)
} else {
  userId = created.user.id
}

await setStudentProfile(userId)
console.log(`Created student: ${email} (${displayName})`)
console.log(`Login at ${origin}/login → ${origin}/dashboard`)
