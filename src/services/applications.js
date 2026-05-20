import { publicApiFetch } from '@/lib/apiClient'

const QUEUE_KEY = 'ember-application-queue'

function readQueue() {
  try {
    const v = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function writeQueue(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(0, 50)))
}

export async function submitApplication(payload) {
  try {
    return await publicApiFetch('/api/public/applications', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload || {}),
    })
  } catch (err) {
    // Offline / network errors: queue for later sync.
    const q = readQueue()
    q.unshift({ row: payload, ts: Date.now() })
    writeQueue(q)
    return { ok: true, queued: true, error: err?.message }
  }
}

export async function flushQueuedApplications() {
  const q = readQueue()
  if (!q.length) return { ok: true, flushed: 0 }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: true, flushed: 0 }
  }

  let flushed = 0
  const remaining = []

  for (const item of q) {
    try {
      await publicApiFetch('/api/public/applications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(item.row || {}),
      })
      flushed += 1
    } catch {
      remaining.push(item)
    }
  }

  writeQueue(remaining)
  return { ok: true, flushed, remaining: remaining.length }
}

