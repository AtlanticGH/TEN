import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// In demo/unconfigured mode, return a stub that no-ops every call
// so the app renders and shows default content instead of crashing.
function createStubClient() {
  const noop = async () => ({ data: null, error: { message: 'Supabase not configured' } })
  const stub = new Proxy({}, {
    get(_, prop) {
      if (prop === 'auth') {
        return new Proxy({}, {
          get(_, authProp) {
            if (authProp === 'onAuthStateChange') return () => ({ data: { subscription: { unsubscribe: () => {} } } })
            if (authProp === 'getSession') return async () => ({ data: { session: null }, error: null })
            if (authProp === 'getUser') return async () => ({ data: { user: null }, error: null })
            return noop
          }
        })
      }
      // .from(...).select/insert/update/delete/etc. all resolve to { data: null, error: ... }
      return () => new Proxy({}, {
        get(_, chainProp) {
          if (['select','insert','update','delete','upsert','eq','neq','gt','gte','lt','lte',
               'in','is','order','limit','single','maybeSingle','range'].includes(chainProp)) {
            return () => new Proxy({}, { get: (o, p) => o[p] ?? noop })
          }
          return noop
        }
      })
    }
  })
  return stub
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createStubClient()

export { isConfigured as supabaseIsConfigured }
