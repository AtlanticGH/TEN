import { getSupabase } from '@/lib/supabaseClient'
import { apiUrl, usesSameOriginApi } from '@/lib/apiBase'

const API_TIMEOUT_MS = 20_000
const UPLOAD_TIMEOUT_MS = 5 * 60_000
const TEN_DEV_URL = 'http://localhost:5190'

function isLocalDevHost() {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

function localDevApiHelp() {
  return `Run npm run dev (or npm run dev:all) and open ${TEN_DEV_URL}/admin — see .ten-dev-url in the project root.`
}

function isUploadBody(body) {
  return body instanceof ArrayBuffer || body instanceof Blob
}

function requestTimeoutMs(body) {
  return isUploadBody(body) ? UPLOAD_TIMEOUT_MS : API_TIMEOUT_MS
}

function apiFetchHeaders(init = {}) {
  const headers = new Headers(init.headers || {})
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  return headers
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController()
  const timeoutMs = requestTimeoutMs(init.body)
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    if (err?.name === 'AbortError') {
      const timeoutErr = new Error(
        isUploadBody(init.body)
          ? 'Upload timed out — try a smaller file (max 25 MB) or check your connection.'
          : isLocalDevHost()
            ? `Request timed out — ${localDevApiHelp()}`
            : 'Request timed out — is the API server running?',
      )
      timeoutErr.cause = err
      throw timeoutErr
    }
    if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
      throw new Error(
        isLocalDevHost()
          ? `API server is not reachable. ${localDevApiHelp()}`
          : 'API server is not reachable — check deployment env vars and /api routing.',
      )
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function readApiResponse(res) {
  const text = await res.text()
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('text/html') || text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
    return {
      json: null,
      html: true,
    }
  }
  if (!text) return { json: null, html: false }
  try {
    return { json: JSON.parse(text), html: false }
  } catch {
    return { json: null, html: false, raw: text }
  }
}

function formatApiError(status, json, { html = false, path = '' } = {}) {
  if (status === 502 || status === 503 || status === 504) {
    return isLocalDevHost()
      ? `API server is not running. ${localDevApiHelp()}`
      : 'API server is not running — redeploy with server env vars and same-origin /api.'
  }
  if (html) {
    if (isLocalDevHost()) {
      const port = window.location.port || '5190'
      const tenUrl = port === '5190' ? window.location.origin : TEN_DEV_URL
      return `Request failed: ${status}. Got HTML instead of JSON for ${path}. Port ${port} is not wired to the TEN API — ${localDevApiHelp()} Open ${tenUrl}/admin.`
    }
    return `Request failed: ${status}. The host returned HTML instead of JSON for ${path || 'the API'} — redeploy with server env vars and same-origin /api (leave VITE_API_URL empty on Vercel).`
  }
  if (status === 404) {
    const base = json?.error || json?.message || `Request failed: ${status}`
    if (usesSameOriginApi()) {
      return `${base} API routes may be misconfigured on the host — redeploy with server env vars and same-origin /api.`
    }
    return `${base} Check VITE_API_URL (use the site origin only, without a trailing /api).`
  }
  return json?.error || json?.message || `Request failed: ${status}`
}

export async function publicApiFetch(path, init = {}) {
  const url = apiUrl(path)
  const headers = apiFetchHeaders(init)
  const res = await fetchWithTimeout(url, { ...init, headers })
  const { json, html } = await readApiResponse(res)
  if (!res.ok) {
    throw new Error(formatApiError(res.status, json, { html, path }))
  }
  return json
}

export async function apiFetch(path, init = {}) {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error

  const token = data?.session?.access_token || ''
  if (!token) throw new Error('Not authenticated')

  const headers = apiFetchHeaders(init)
  if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

  const hasCT = headers.has('content-type')
  const body = init.body
  const isBodyPlainObject =
    body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof ArrayBuffer)

  if (!hasCT && (isBodyPlainObject || typeof body === 'string' || body == null)) {
    headers.set('content-type', 'application/json')
  }

  const url = apiUrl(path)
  const res = await fetchWithTimeout(url, { ...init, headers })
  const { json, html } = await readApiResponse(res)
  if (!res.ok) {
    throw new Error(formatApiError(res.status, json, { html, path }))
  }
  return json
}
