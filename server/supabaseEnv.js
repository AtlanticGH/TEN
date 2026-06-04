/** Server-side Supabase credentials (Vercel, Express, legacy /api handlers). */
export function readSupabaseServerEnv() {
  const SUPABASE_URL = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  ).trim()

  const SUPABASE_SERVICE_ROLE_KEY = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ''
  )
    .trim()
    .replace(/^['"]|['"]$/g, '')

  return { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY }
}

export function createSupabaseServiceClient(createClient) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = readSupabaseServerEnv()
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
