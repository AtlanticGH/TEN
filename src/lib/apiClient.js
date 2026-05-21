import { getSupabase } from '@/lib/supabaseClient'
import { apiUrl } from '@/lib/apiBase'

export async function publicApiFetch(path, init = {}) {
  const url = apiUrl(path)
  const res = await fetch(url, init)
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = json?.error || json?.message || `Request failed: ${res.status}`
    throw new Error(msg)
  }
  return json
}

export async function apiFetch(path, init = {}) {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error

  const token = data?.session?.access_token || ''
  if (!token) throw new Error('Not authenticated')

  const headers = new Headers(init.headers || {})
  if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

  // Only set JSON header if caller didn’t provide one and body is not FormData/Blob/etc.
  const hasCT = headers.has('content-type')
  const body = init.body
  const isBodyPlainObject =
    body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof ArrayBuffer)

  if (!hasCT && (isBodyPlainObject || typeof body === 'string' || body == null)) {
    headers.set('content-type', 'application/json')
  }

  const url = apiUrl(path)
  const res = await fetch(url, { ...init, headers })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = json?.error || json?.message || `Request failed: ${res.status}`
    throw new Error(msg)
  }
  return json
}

