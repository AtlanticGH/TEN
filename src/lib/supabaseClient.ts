import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * True only when real credentials are present.
 * Use this flag in UI to show "not configured" messages in demo/dev mode.
 */
export const supabaseIsConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Always a fully-typed SupabaseClient.
 * When credentials are absent (demo / local dev without a Supabase project),
 * placeholder values are used so createClient() succeeds and the module never
 * throws. All network calls will fail with a fetch error — already caught
 * throughout the app with .catch() / try-catch blocks.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl      ?? 'https://placeholder.supabase.co',
  supabaseAnonKey  ?? 'placeholder-anon-key',
)
