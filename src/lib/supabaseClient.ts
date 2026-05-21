import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

/** Vite may inject empty strings from `.env`; treat those as unset. */
function envOrUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const supabaseUrl = envOrUndefined(import.meta.env.VITE_SUPABASE_URL as string | undefined)
const supabaseAnonKey = envOrUndefined(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)

export const supabaseIsConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseIsConfigured) {
  console.error(
    '[TEN] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to .env and restart the dev server.',
  )
}

/**
 * Live Supabase client. Only instantiated when credentials are present.
 */
export const supabase: SupabaseClient<Database> | null = supabaseIsConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : null

/** Returns the live client or throws when env vars are missing. */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.')
  }
  return supabase
}
