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

export function hasSupabaseServerEnv() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = readSupabaseServerEnv()
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
}

export function supabaseProjectRef(url = readSupabaseServerEnv().SUPABASE_URL) {
  const m = String(url || '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)
  return m ? m[1] : ''
}

let cachedSig = ''
/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let cachedClient = null

/** Read env on each call so Vercel runtime vars are picked up after cold start. */
export function getSupabaseAdmin(createClient) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = readSupabaseServerEnv()
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    cachedSig = ''
    cachedClient = null
    return null
  }

  const sig = `${SUPABASE_URL}|${SUPABASE_SERVICE_ROLE_KEY.length}`
  if (cachedSig === sig && cachedClient) return cachedClient

  cachedSig = sig
  cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return cachedClient
}

/** @deprecated use getSupabaseAdmin */
export function createSupabaseServiceClient(createClient) {
  return getSupabaseAdmin(createClient)
}

/** Proxy so existing route modules can keep using `supabase.from(...)` with lazy env reads. */
export function createSupabaseProxy(createClient) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        const client = getSupabaseAdmin(createClient)
        if (!client) return undefined
        const value = client[prop]
        return typeof value === 'function' ? value.bind(client) : value
      },
    },
  )
}

export function readSupabaseEnvStatus() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = readSupabaseServerEnv()
  return {
    ok: Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY),
    hasUrl: Boolean(SUPABASE_URL),
    hasServiceRoleKey: Boolean(SUPABASE_SERVICE_ROLE_KEY),
    projectRef: supabaseProjectRef(SUPABASE_URL),
    vercel: Boolean(process.env.VERCEL),
  }
}
