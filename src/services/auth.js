import { getSupabase } from '@/lib/supabaseClient'
import { publicApiFetch } from '@/lib/apiClient'

export async function signUpWithEmail({ email, password, fullName }) {
  // Public signup is intentionally disabled. Accounts are created only after an approved application.
  // Keep the signature for backwards-compatibility with any older UI that might still call it.
  void email
  void password
  void fullName
  throw new Error('Public sign up is disabled. Please apply for membership to join The Ember Network.')
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email: String(email || '').trim().toLowerCase(),
    password: String(password || ''),
  })
  if (error) {
    if (error.message?.toLowerCase().includes('invalid api key')) {
      throw new Error(
        'Supabase API key is invalid. Check VITE_SUPABASE_ANON_KEY in .env, then restart npm run dev:all.',
      )
    }
    throw error
  }
  return data
}

/** Accepts email or profiles.username (case-insensitive). */
export async function signInWithEmailOrUsername({ emailOrUsername, password }) {
  const identifier = String(emailOrUsername || '').trim()
  if (!identifier) throw new Error('Please enter your email or username.')
  let email = identifier
  if (!identifier.includes('@')) {
    const resolved = await publicApiFetch('/api/public/auth/resolve-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    })
    email = resolved.email
  } else {
    email = identifier.toLowerCase()
  }
  return signInWithEmail({ email, password })
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut()
  if (error) throw error
}

export async function sendPasswordReset(email) {
  const redirectTo = `${window.location.origin}/reset-password`
  const { data, error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
  return data
}

export async function updateMyPassword(newPassword) {
  const { data, error } = await getSupabase().auth.updateUser({
    password: newPassword,
    data: { force_password_reset: false },
  })
  if (error) throw error
  return data
}

