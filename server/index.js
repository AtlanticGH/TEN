import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'

// Existing business endpoints (already implemented in /api/*)
import inviteApplicant from '../api/inviteApplicant.js'
import approveApplication from '../api/applications/approve.js'
import rejectApplication from '../api/applications/reject.js'
import markComplete from '../api/progress/mark-complete.js'
import markIncomplete from '../api/progress/mark-incomplete.js'

// Load .env then .env.local (Vite-style: local overrides base).
dotenv.config({ path: ['.env', '.env.local'], override: true })

const app = express()
const PORT = Number(process.env.PORT || '3000')

function trimOrigin(value) {
  const v = String(value || '').trim().replace(/\/$/, '')
  return v || null
}

function corsOrigins() {
  const origins = new Set()
  const configured = trimOrigin(process.env.FRONTEND_ORIGIN || process.env.SITE_URL)
  if (configured) origins.add(configured)
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`)
  if (process.env.VERCEL_BRANCH_URL) origins.add(`https://${process.env.VERCEL_BRANCH_URL}`)
  if (origins.size) return [...origins]
  if (process.env.NODE_ENV === 'production') return false
  return ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000']
}

app.set('trust proxy', true)

// Vercel serverless passes /api/foo as /foo to functions under api/ — restore prefix.
if (process.env.VERCEL) {
  app.use((req, _res, next) => {
    const raw = req.url || '/'
    const q = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''
    const pathOnly = q ? raw.slice(0, raw.indexOf('?')) : raw
    if (pathOnly && !pathOnly.startsWith('/api')) {
      req.url = `/api${pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`}${q}`
    }
    next()
  })
}

app.use(
  cors({
    origin: corsOrigins(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['content-type', 'authorization'],
  }),
)

// JSON for normal API routes
app.use(express.json({ limit: '2mb' }))

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : null

if (!supabase) {
  // eslint-disable-next-line no-console
  console.warn('[server] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
}

function requireSupabase(res) {
  if (supabase) return true
  res.status(500).json({ error: 'Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' })
  return false
}

async function verifyUser(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ error: 'Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' })
    const h = req.headers?.authorization || req.headers?.Authorization || ''
    const m = String(h).match(/^Bearer\s+(.+)$/i)
    const token = m ? m[1] : ''
    if (!token) return res.status(401).json({ error: 'No token' })

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user?.id) return res.status(401).json({ error: 'Invalid session' })

    req.user = data.user
    req.accessToken = token
    next()
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Auth error' })
  }
}

async function ensureProfileRow(user) {
  if (!supabase) throw new Error('Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  const userId = user?.id
  if (!userId) throw new Error('Missing user id')

  const { data: existing, error: readErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (readErr) throw readErr
  if (existing) return existing

  const { data: inserted, error: insErr } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      email: user.email || null,
      full_name: user.user_metadata?.full_name || '',
      role: 'student',
      status: 'active',
    })
    .select('*')
    .single()

  if (insErr) throw insErr
  return inserted
}

async function enrichProfileAvatar(row) {
  if (!row?.avatar_path || !supabase) return row
  try {
    const { data, error } = await supabase.storage.from('avatars').createSignedUrl(row.avatar_path, 60 * 60)
    if (error || !data?.signedUrl) return row
    return { ...row, avatar_url: data.signedUrl, profile_image_url: data.signedUrl }
  } catch {
    return row
  }
}

async function getMyProfileRow(userId, authUser = null) {
  if (!supabase) throw new Error('Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  let row = data
  if (!row && authUser?.id === userId) row = await ensureProfileRow(authUser)
  if (!row) {
    const err = new Error('Profile not found')
    err.code = 'PGRST116'
    throw err
  }
  return await enrichProfileAvatar(row)
}

function isStaffRole(role) {
  return ['admin', 'super_admin', 'staff'].includes(String(role || ''))
}

// Whitelist updatable fields per table — never trust raw req.body.
// The server uses the service-role key, which bypasses RLS, so the
// server is the only guard against role escalation and column tampering.
function pickFields(input, allowed) {
  const out = {}
  if (!input || typeof input !== 'object') return out
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(input, key)) out[key] = input[key]
  }
  return out
}

const PROFILE_SELF_UPDATABLE = [
  'full_name',
  'bio',
  'phone',
  'country',
  'goals',
  'profile_image_url',
  'avatar_path',
  'avatar_url',
]
const APPLICATION_STAFF_UPDATABLE = ['status', 'notes', 'invited_user_id', 'invited_at']
const APPLICATION_STATUSES = new Set(['submitted', 'waitlist', 'approved', 'rejected'])
const MODULE_STAFF_UPDATABLE = ['title', 'description', 'position', 'content']
const LESSON_STAFF_UPDATABLE = [
  'title',
  'description',
  'position',
  'content',
  'status',
  'published_at',
]
const LESSON_STATUSES = new Set(['draft', 'published'])
const MEDIA_STAFF_UPDATABLE = ['title', 'alt', 'tags']

// Upload validation: enforce content-type allowlist + per-type size limits.
const ALLOWED_UPLOAD_MIME = new Map([
  ['image/jpeg', { ext: ['jpg', 'jpeg'], maxBytes: 10 * 1024 * 1024 }],
  ['image/png', { ext: ['png'], maxBytes: 10 * 1024 * 1024 }],
  ['image/gif', { ext: ['gif'], maxBytes: 10 * 1024 * 1024 }],
  ['image/webp', { ext: ['webp'], maxBytes: 10 * 1024 * 1024 }],
  ['image/svg+xml', { ext: ['svg'], maxBytes: 1 * 1024 * 1024 }],
  ['application/pdf', { ext: ['pdf'], maxBytes: 25 * 1024 * 1024 }],
])

function validateUpload(req) {
  const rawType = String(req.headers['content-type'] || '').toLowerCase()
  const contentType = rawType.split(';')[0].trim()
  const spec = ALLOWED_UPLOAD_MIME.get(contentType)
  if (!spec) {
    return { error: `Unsupported content-type: ${contentType || 'unknown'}` }
  }
  const size = Buffer.isBuffer(req.body) ? req.body.length : 0
  if (size <= 0) return { error: 'Empty upload body' }
  if (size > spec.maxBytes) {
    const mb = Math.floor(spec.maxBytes / 1024 / 1024)
    return { error: `File exceeds ${mb}MB limit for ${contentType}` }
  }
  const filename = String(req.query?.filename || '')
  const ext = (filename.split('.').pop() || '').toLowerCase()
  if (filename && ext && !spec.ext.includes(ext)) {
    return { error: `Filename extension ".${ext}" does not match content-type ${contentType}` }
  }
  return { contentType, size }
}

async function requireStaff(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ error: 'Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' })
    const actor = await getMyProfileRow(req.user.id)
    if (!actor || actor.status !== 'active' || !isStaffRole(actor.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    req.actorProfile = actor
    next()
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Staff auth error' })
  }
}

app.get('/healthz', (_req, res) => res.status(200).send('ok'))
app.get('/api/healthz', (_req, res) => res.status(200).send('ok'))

// -------------------------
// Hybrid API (frontend → backend → Supabase DB)
// -------------------------

app.get('/api/profile', verifyUser, async (req, res) => {
  try {
    const row = await getMyProfileRow(req.user.id, req.user)
    res.json(row)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Profile error' })
  }
})

app.put('/api/profile', verifyUser, async (req, res) => {
  try {
    const patch = pickFields(req.body, PROFILE_SELF_UPDATABLE)
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' })
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('user_id', req.user.id)
      .select('*')
      .single()
    if (error) throw error
    res.json(await enrichProfileAvatar(data))
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Profile update error' })
  }
})

app.get('/api/teams', verifyUser, async (req, res) => {
  try {
    // Matches existing frontend expectations: [{ team_id, role, teams: {...} }]
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, role, teams(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Teams error' })
  }
})

app.post('/api/teams', verifyUser, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim()
    if (!name) return res.status(400).json({ error: 'Team name is required.' })

    const { data, error } = await supabase
      .from('teams')
      .insert({ name, owner_user_id: req.user.id })
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Create team error' })
  }
})

app.get('/api/teams/:teamId/members', verifyUser, async (req, res) => {
  try {
    const teamId = String(req.params.teamId || '')
    if (!teamId) return res.status(400).json({ error: 'Missing teamId' })
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, user_id, role, created_at, profiles:profiles(full_name,email,username,avatar_path)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Team members error' })
  }
})

app.post('/api/teams/:teamId/members', verifyUser, async (req, res) => {
  try {
    const teamId = String(req.params.teamId || '')
    const userId = String(req.body?.userId || '')
    const role = String(req.body?.role || 'member')
    if (!teamId || !userId) return res.status(400).json({ error: 'Missing teamId/userId' })

    const { error } = await supabase.from('team_members').insert({ team_id: teamId, user_id: userId, role })
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Add team member error' })
  }
})

app.get('/api/courses', verifyUser, async (req, res) => {
  try {
    const actor = await getMyProfileRow(req.user.id, req.user)
    let q = supabase.from('courses').select('*').order('created_at', { ascending: false })
    if (!isStaffRole(actor?.role)) {
      q = q.eq('published', true)
    }
    const { data, error } = await q
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Courses error' })
  }
})

// -------------------------
// Public endpoints (no Supabase client usage in browser)
// -------------------------

app.get('/api/public/site-content/:key', async (req, res) => {
  try {
    if (!requireSupabase(res)) return
    const key = String(req.params.key || '')
    const { data, error } = await supabase.from('site_content').select('key,value,updated_at').eq('key', key).maybeSingle()
    if (error) throw error
    res.json(data || null)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Site content error' })
  }
})

app.get('/api/public/cms-content', async (req, res) => {
  try {
    if (!requireSupabase(res)) return
    const includeDrafts = String(req.query?.includeDrafts || '') === 'true'
    let q = supabase.from('cms_content').select('*').order('page_key').order('section_key')
    if (!includeDrafts) q = q.eq('published', true)
    const { data, error } = await q
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'CMS content error' })
  }
})

app.get('/api/public/resources', async (req, res) => {
  try {
    if (!requireSupabase(res)) return
    const limit = Math.max(1, Math.min(500, Number(req.query?.limit || 200)))
    const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false }).limit(limit)
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Resources error' })
  }
})

app.post('/api/public/contact', async (req, res) => {
  try {
    if (!requireSupabase(res)) return
    const payload = req.body && typeof req.body === 'object' ? req.body : {}
    const row = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      subject: payload.subject,
      message: payload.message,
    }
    const { data, error } = await supabase.from('contact_submissions').insert(row).select('id, created_at').single()
    if (error) throw error
    res.json({ ok: true, data })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Contact submit error' })
  }
})

app.post('/api/public/applications', async (req, res) => {
  try {
    if (!requireSupabase(res)) return
    const payload = req.body && typeof req.body === 'object' ? req.body : {}
    const row = {
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone || null,
      address: payload.address || null,
      interest_role: payload.interest_role || null,
      message: payload.message || null,
    }
    const { data, error } = await supabase.from('applications').insert(row).select('id, created_at').single()
    if (error) throw error
    res.json({ ok: true, data })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Application submit error' })
  }
})

// -------------------------
// Staff/admin endpoints
// -------------------------

app.put('/api/admin/site-content', verifyUser, requireStaff, async (req, res) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {}
    const { data, error } = await supabase
      .from('site_content')
      .upsert({ key: payload.key, value: payload.value, updated_by: req.user.id }, { onConflict: 'key' })
      .select('key,value,updated_at')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Site content upsert error' })
  }
})

app.put('/api/admin/cms-content', verifyUser, requireStaff, async (req, res) => {
  try {
    const row = req.body && typeof req.body === 'object' ? req.body : {}
    const payload = {
      page_key: row.page_key,
      section_key: row.section_key,
      title: row.title ?? null,
      body: row.body ?? null,
      media_url: row.media_url ?? null,
      published: !!row.published,
      updated_by: req.user.id,
    }
    const { data, error } = await supabase
      .from('cms_content')
      .upsert(payload, { onConflict: 'page_key,section_key' })
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'CMS upsert error' })
  }
})

function encodeStoragePath(path) {
  return String(path || '')
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')
}

function publicObjectUrl(bucket, path) {
  const base = String(SUPABASE_URL || '').replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`
}

app.get('/api/public/storage/public-url', (req, res) => {
  try {
    const bucket = String(req.query?.bucket || 'public')
    const path = String(req.query?.path || '')
    if (!requireSupabase(res)) return
    if (!path) return res.status(400).json({ error: 'Missing path' })
    res.json({ publicUrl: publicObjectUrl(bucket, path) })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Public url error' })
  }
})

app.get('/api/storage/signed-url', verifyUser, async (req, res) => {
  try {
    const bucket = String(req.query?.bucket || 'public')
    const path = String(req.query?.path || '')
    const expiresIn = Math.max(1, Math.min(60 * 60 * 24, Number(req.query?.expiresIn || 120)))
    if (!path) return res.status(400).json({ error: 'Missing path' })
    if (bucket === 'public') return res.json({ signedUrl: publicObjectUrl(bucket, path) })
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
    if (error) throw error
    res.json({ signedUrl: data?.signedUrl || '' })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Signed url error' })
  }
})

app.post(
  '/api/admin/storage/upload',
  verifyUser,
  requireStaff,
  express.raw({ type: '*/*', limit: '25mb' }),
  async (req, res) => {
    try {
      const v = validateUpload(req)
      if (v.error) return res.status(400).json({ error: v.error })
      const { contentType } = v

      const bucket = String(req.query?.bucket || 'public')
      const folder = String(req.query?.folder || 'uploads').replace(/^\/+|\/+$/g, '')
      const filename = String(req.query?.filename || 'file').replace(/[^\w.\-]+/g, '-').slice(0, 120)
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      const path = `${folder}/${stamp}-${filename}`

      const { error } = await supabase.storage.from(bucket).upload(path, req.body, {
        upsert: false,
        contentType,
      })
      if (error) throw error

      res.json({
        bucket,
        path,
        mime_type: contentType || null,
        size_bytes: Buffer.isBuffer(req.body) ? req.body.length : null,
      })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Upload error' })
    }
  },
)

// Activity logs
app.get('/api/admin/activity-logs', verifyUser, requireStaff, async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(500, Number(req.query?.limit || 100)))
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, actor_user_id, action, entity_type, entity_id, metadata_json, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Activity logs error' })
  }
})

app.post('/api/activity-logs', verifyUser, async (req, res) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {}
    const { error } = await supabase.from('activity_logs').insert({
      actor_user_id: req.user.id,
      action: payload.action || 'unknown',
      entity_type: payload.entityType || payload.entity_type || 'unknown',
      entity_id: payload.entityId ? String(payload.entityId) : null,
      metadata_json: payload.metadata || {},
    })
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Log activity error' })
  }
})

// Resources (admin create/delete)
app.post('/api/admin/resources', verifyUser, requireStaff, async (req, res) => {
  try {
    const p = req.body && typeof req.body === 'object' ? req.body : {}
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: String(p.title || '').trim(),
        description: (p.description || '').trim() || null,
        category: (p.category || '').trim() || null,
        bucket: p.bucket || 'public',
        path: p.path || null,
        file_url: p.file_url ? String(p.file_url).trim() : null,
        mime_type: p.mime_type || null,
        size_bytes: p.size_bytes || null,
      })
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Create resource error' })
  }
})

app.delete('/api/admin/resources/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const { data: row, error: getErr } = await supabase.from('resources').select('*').eq('id', id).single()
    if (getErr) throw getErr
    if (row?.path) await supabase.storage.from(row.bucket || 'public').remove([row.path]).catch(() => {})
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Delete resource error' })
  }
})

// Media assets (admin)
app.get('/api/admin/media-assets', verifyUser, requireStaff, async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(500, Number(req.query?.limit || 100)))
    const query = String(req.query?.query || '').trim()
    let q = supabase.from('media_assets').select('*').order('created_at', { ascending: false }).limit(limit)
    if (query) q = q.or(`title.ilike.%${query}%,path.ilike.%${query}%`)
    const { data, error } = await q
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Media assets error' })
  }
})

app.post(
  '/api/admin/media-assets/upload',
  verifyUser,
  requireStaff,
  express.raw({ type: '*/*', limit: '25mb' }),
  async (req, res) => {
    try {
      const v = validateUpload(req)
      if (v.error) return res.status(400).json({ error: v.error })
      const { contentType } = v

      const folder = String(req.query?.folder || 'uploads').replace(/^\/+|\/+$/g, '')
      const filename = String(req.query?.filename || 'file').replace(/[^\w.\-]+/g, '-').slice(0, 120)
      const title = String(req.query?.title || '')
      const alt = String(req.query?.alt || '')
      const tags = String(req.query?.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      const path = `${folder}/${stamp}-${filename}`

      const { error: upErr } = await supabase.storage.from('public').upload(path, req.body, {
        contentType,
        upsert: false,
      })
      if (upErr) throw upErr

      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          bucket: 'public',
          path,
          mime_type: contentType || null,
          size_bytes: Buffer.isBuffer(req.body) ? req.body.length : null,
          title: title || filename,
          alt: alt || null,
          tags,
        })
        .select('*')
        .single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Upload media error' })
    }
  },
)

app.put('/api/admin/media-assets/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const patch = pickFields(req.body, MEDIA_STAFF_UPDATABLE)
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' })
    }
    const { data, error } = await supabase
      .from('media_assets')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Update media error' })
  }
})

app.delete('/api/admin/media-assets/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const { data: row, error: getErr } = await supabase.from('media_assets').select('*').eq('id', id).single()
    if (getErr) throw getErr
    await supabase.storage.from(row.bucket || 'public').remove([row.path]).catch(() => {})
    const { error } = await supabase.from('media_assets').delete().eq('id', id)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Delete media error' })
  }
})

// -------------------------
// Quizzes + attempts (member reads/writes; staff manages questions)
// -------------------------

app.get('/api/lessons/:lessonId/quizzes', verifyUser, async (req, res) => {
  try {
    const lessonId = String(req.params.lessonId || '')
    const { data, error } = await supabase.from('quizzes').select('*').eq('lesson_id', lessonId).order('created_at', { ascending: true })
    if (error) throw error
    res.json((data || []).map((q) => ({ ...q, options: Array.isArray(q.options_json) ? q.options_json : [] })))
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Quiz list error' })
  }
})

app.post('/api/admin/lessons/:lessonId/quizzes', verifyUser, requireStaff, async (req, res) => {
  try {
    const lessonId = String(req.params.lessonId || '')
    const q = String(req.body?.question || '').trim()
    const opts = Array.isArray(req.body?.options) ? req.body.options.map((x) => String(x || '').trim()).filter(Boolean) : []
    const ans = String(req.body?.correctAnswer || '').trim()
    if (!lessonId) return res.status(400).json({ error: 'Missing lessonId' })
    if (!q) return res.status(400).json({ error: 'Question is required' })
    if (opts.length < 2) return res.status(400).json({ error: 'Provide at least 2 options' })
    if (!ans) return res.status(400).json({ error: 'Correct answer is required' })
    if (!opts.includes(ans)) return res.status(400).json({ error: 'Correct answer must match one of the options' })

    const { data, error } = await supabase
      .from('quizzes')
      .insert({ lesson_id: lessonId, question: q, options_json: opts, correct_answer: ans })
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Quiz create error' })
  }
})

app.delete('/api/admin/quizzes/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const { error } = await supabase.from('quizzes').delete().eq('id', id)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Quiz delete error' })
  }
})

app.post('/api/lessons/:lessonId/quiz-attempts', verifyUser, async (req, res) => {
  try {
    const lessonId = String(req.params.lessonId || '')
    if (!lessonId) return res.status(400).json({ error: 'Missing lessonId' })

    const { data: questions, error: qErr } = await supabase.from('quizzes').select('*').eq('lesson_id', lessonId)
    if (qErr) throw qErr
    const total = (questions || []).length
    const answers = req.body?.answersByQuestionId && typeof req.body.answersByQuestionId === 'object' ? req.body.answersByQuestionId : {}
    let score = 0
    ;(questions || []).forEach((q) => {
      const picked = String(answers[q.id] || '')
      if (picked && picked === q.correct_answer) score += 1
    })

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({ user_id: req.user.id, lesson_id: lessonId, score, total, answers_json: answers })
      .select('*')
      .single()
    if (error) throw error
    res.json({ attempt: data, score, total })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Quiz attempt error' })
  }
})

app.get('/api/lessons/:lessonId/quiz-attempts', verifyUser, async (req, res) => {
  try {
    const lessonId = String(req.params.lessonId || '')
    const limit = Math.max(1, Math.min(50, Number(req.query?.limit || 10)))
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Quiz attempts list error' })
  }
})

// -------------------------
// Lesson files (member reads; staff manages)
// -------------------------

app.get('/api/lessons/:lessonId/files', verifyUser, async (req, res) => {
  try {
    const lessonId = String(req.params.lessonId || '')
    const { data, error } = await supabase
      .from('lesson_files')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    const rows = (data || []).map((f) => ({
      ...f,
      download_url: f.file_url || (f.path ? publicObjectUrl(f.bucket || 'public', f.path) : ''),
    }))
    res.json(rows)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Lesson files error' })
  }
})

app.post('/api/admin/lessons/:lessonId/files', verifyUser, requireStaff, async (req, res) => {
  try {
    const lessonId = String(req.params.lessonId || '')
    const p = req.body && typeof req.body === 'object' ? req.body : {}
    const { data, error } = await supabase
      .from('lesson_files')
      .insert({
        lesson_id: lessonId,
        title: p.title || null,
        bucket: p.bucket || 'public',
        path: p.path || null,
        file_url: p.file_url || null,
        mime_type: p.mime_type || null,
        size_bytes: p.size_bytes || null,
        file_type: p.file_type || null,
        position: 1,
      })
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Create lesson file error' })
  }
})

app.delete('/api/admin/lesson-files/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const { data: row, error: getErr } = await supabase.from('lesson_files').select('*').eq('id', id).single()
    if (getErr) throw getErr
    if (row?.path) await supabase.storage.from(row.bucket || 'public').remove([row.path]).catch(() => {})
    const { error } = await supabase.from('lesson_files').delete().eq('id', id)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Delete lesson file error' })
  }
})

// -------------------------
// Assignments (member reads; staff manages)
// -------------------------

app.get('/api/lessons/:lessonId/assignments', verifyUser, async (req, res) => {
  try {
    const lessonId = String(req.params.lessonId || '')
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false })
    if (error) throw error
    const rows = (data || []).map((a) => ({
      ...a,
      download_url: a.file_url || (a.path ? publicObjectUrl(a.bucket || 'public', a.path) : ''),
    }))
    res.json(rows)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Assignments list error' })
  }
})

app.post('/api/admin/lessons/:lessonId/assignments', verifyUser, requireStaff, async (req, res) => {
  try {
    const lessonId = String(req.params.lessonId || '')
    const p = req.body && typeof req.body === 'object' ? req.body : {}
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        lesson_id: lessonId,
        title: String(p.title || '').trim(),
        description: (p.description || '').trim() || null,
        bucket: p.bucket || 'public',
        path: p.path || null,
        file_url: p.file_url || null,
      })
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Create assignment error' })
  }
})

app.delete('/api/admin/assignments/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const { data: row, error: getErr } = await supabase.from('assignments').select('*').eq('id', id).single()
    if (getErr) throw getErr
    if (row?.path) await supabase.storage.from(row.bucket || 'public').remove([row.path]).catch(() => {})
    const { error } = await supabase.from('assignments').delete().eq('id', id)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Delete assignment error' })
  }
})

// -------------------------
// Admin: summary + applications
// -------------------------

app.get('/api/admin/summary', verifyUser, requireStaff, async (_req, res) => {
  try {
    const [{ count: applications_submitted, error: aErr }, { count: members, error: pErr }, { count: courses, error: cErr }] =
      await Promise.all([
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', true),
      ])
    if (aErr) throw aErr
    if (pErr) throw pErr
    if (cErr) throw cErr
    res.json({ applications_submitted: applications_submitted || 0, members: members || 0, courses: courses || 0 })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Summary error' })
  }
})

app.get('/api/admin/applications', verifyUser, requireStaff, async (_req, res) => {
  try {
    const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Applications list error' })
  }
})

app.put('/api/admin/applications/:id/status', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const status = String(req.body?.status || '')
    if (!APPLICATION_STATUSES.has(status)) {
      return res.status(400).json({ error: `Invalid status: ${status}` })
    }
    const { data, error } = await supabase
      .from('applications')
      .update({ status, reviewed_by: req.user.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Update application status error' })
  }
})

app.put('/api/admin/applications/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const patch = pickFields(req.body, APPLICATION_STAFF_UPDATABLE)
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' })
    }
    if (patch.status !== undefined && !APPLICATION_STATUSES.has(String(patch.status))) {
      return res.status(400).json({ error: `Invalid status: ${patch.status}` })
    }
    // Server uses service-role; auth.uid() is NULL inside triggers, so stamp explicitly.
    patch.reviewed_by = req.user.id
    patch.reviewed_at = new Date().toISOString()
    const { data, error } = await supabase
      .from('applications')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Update application error' })
  }
})

// -------------------------
// Admin course builder (courses/modules/lessons)
// -------------------------

app.get('/api/admin/courses/:courseId', verifyUser, requireStaff, async (req, res) => {
  try {
    const courseId = String(req.params.courseId || '')
    const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Get course error' })
  }
})

app.get('/api/admin/courses/:courseId/modules', verifyUser, requireStaff, async (req, res) => {
  try {
    const courseId = String(req.params.courseId || '')
    const { data, error } = await supabase.from('modules').select('*').eq('course_id', courseId).order('position', { ascending: true })
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'List modules error' })
  }
})

app.post('/api/admin/courses/:courseId/modules', verifyUser, requireStaff, async (req, res) => {
  try {
    const courseId = String(req.params.courseId || '')
    const { data: existing, error: countErr } = await supabase
      .from('modules')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)
    if (countErr) throw countErr
    const position = (existing?.length ? existing.length : 0) + 1
    const { data, error } = await supabase
      .from('modules')
      .insert({ course_id: courseId, title: req.body?.title, description: req.body?.description, position })
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Create module error' })
  }
})

app.put('/api/admin/modules/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const patch = pickFields(req.body, MODULE_STAFF_UPDATABLE)
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' })
    }
    if (patch.position !== undefined && !(Number.isInteger(patch.position) && patch.position > 0)) {
      return res.status(400).json({ error: 'position must be a positive integer' })
    }
    const { data, error } = await supabase
      .from('modules')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Update module error' })
  }
})

app.delete('/api/admin/modules/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const { error } = await supabase.from('modules').delete().eq('id', id)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Delete module error' })
  }
})

app.post('/api/admin/courses/:courseId/modules/reorder', verifyUser, requireStaff, async (req, res) => {
  try {
    const courseId = String(req.params.courseId || '')
    const ordered = Array.isArray(req.body?.orderedModuleIds) ? req.body.orderedModuleIds : []
    for (let i = 0; i < ordered.length; i += 1) {
      const id = ordered[i]
      const { error } = await supabase.from('modules').update({ position: 1000 + i + 1 }).eq('id', id).eq('course_id', courseId)
      if (error) throw error
    }
    for (let i = 0; i < ordered.length; i += 1) {
      const id = ordered[i]
      const { error } = await supabase.from('modules').update({ position: i + 1 }).eq('id', id).eq('course_id', courseId)
      if (error) throw error
    }
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Reorder modules error' })
  }
})

app.get('/api/admin/modules/:moduleId/lessons', verifyUser, requireStaff, async (req, res) => {
  try {
    const moduleId = String(req.params.moduleId || '')
    const { data, error } = await supabase.from('lessons').select('*').eq('module_id', moduleId).order('position', { ascending: true })
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    res.status(400).json({ error: err?.message || 'List lessons error' })
  }
})

app.post('/api/admin/modules/:moduleId/lessons', verifyUser, requireStaff, async (req, res) => {
  try {
    const moduleId = String(req.params.moduleId || '')
    const { data: existing, error: countErr } = await supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('module_id', moduleId)
    if (countErr) throw countErr
    const position = (existing?.length ? existing.length : 0) + 1
    const { data, error } = await supabase
      .from('lessons')
      .insert({ module_id: moduleId, title: req.body?.title, description: req.body?.description, position, status: 'draft' })
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Create lesson error' })
  }
})

app.put('/api/admin/lessons/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const patch = pickFields(req.body, LESSON_STAFF_UPDATABLE)
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' })
    }
    if (patch.status !== undefined && !LESSON_STATUSES.has(String(patch.status))) {
      return res.status(400).json({ error: `Invalid status: ${patch.status}` })
    }
    if (patch.position !== undefined && !(Number.isInteger(patch.position) && patch.position > 0)) {
      return res.status(400).json({ error: 'position must be a positive integer' })
    }
    const { data, error } = await supabase
      .from('lessons')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Update lesson error' })
  }
})

app.delete('/api/admin/lessons/:id', verifyUser, requireStaff, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const { error } = await supabase.from('lessons').delete().eq('id', id)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Delete lesson error' })
  }
})

app.post('/api/admin/modules/:moduleId/lessons/reorder', verifyUser, requireStaff, async (req, res) => {
  try {
    const moduleId = String(req.params.moduleId || '')
    const ordered = Array.isArray(req.body?.orderedLessonIds) ? req.body.orderedLessonIds : []
    for (let i = 0; i < ordered.length; i += 1) {
      const id = ordered[i]
      const { error } = await supabase.from('lessons').update({ position: 1000 + i + 1 }).eq('id', id).eq('module_id', moduleId)
      if (error) throw error
    }
    for (let i = 0; i < ordered.length; i += 1) {
      const id = ordered[i]
      const { error } = await supabase.from('lessons').update({ position: i + 1 }).eq('id', id).eq('module_id', moduleId)
      if (error) throw error
    }
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Reorder lessons error' })
  }
})

// -------------------------
// Admin: member progress lookup (single endpoint for the admin page)
// -------------------------

app.get('/api/admin/member-progress', verifyUser, requireStaff, async (req, res) => {
  try {
    const email = String(req.query?.email || '').trim()
    if (!email) return res.status(400).json({ error: 'Enter a member email.' })

    const { data: p, error: pErr } = await supabase
      .from('profiles')
      .select('user_id,email,full_name,role,status')
      .eq('email', email)
      .maybeSingle()
    if (pErr) throw pErr
    if (!p?.user_id) return res.status(404).json({ error: 'No member found for that email.' })

    const userId = p.user_id

    const [
      { data: enrollments, error: eErr },
      { data: courseCompletions, error: ccErr },
      { data: moduleCompletions, error: mcErr },
      { data: lessonCompletions, error: lcErr },
    ] = await Promise.all([
      supabase.from('enrollments').select('*').eq('user_id', userId).order('enrolled_at', { ascending: false }),
      supabase.from('course_completions').select('*').eq('user_id', userId),
      supabase.from('module_completions').select('*').eq('user_id', userId),
      supabase.from('lesson_completions').select('*').eq('user_id', userId),
    ])
    if (eErr) throw eErr
    if (ccErr) throw ccErr
    if (mcErr) throw mcErr
    if (lcErr) throw lcErr

    const courseIds = Array.from(new Set((enrollments || []).map((x) => x.course_id))).filter(Boolean)

    let courses = []
    let modules = []
    let lessons = []
    if (courseIds.length) {
      const [{ data: cs, error: cErr }, { data: ms, error: mErr }, { data: ls, error: lErr }] = await Promise.all([
        supabase.from('courses').select('*').in('id', courseIds),
        supabase.from('modules').select('*').in('course_id', courseIds).order('position', { ascending: true }),
        supabase.from('lessons').select('*, modules!inner(course_id)').in('modules.course_id', courseIds).order('position', { ascending: true }),
      ])
      if (cErr) throw cErr
      if (mErr) throw mErr
      if (lErr) throw lErr
      courses = cs || []
      modules = ms || []
      lessons = (ls || []).map((x) => ({ ...x, course_id: x.modules?.course_id }))
    }

    const actorIds = Array.from(
      new Set(
        []
          .concat((courseCompletions || []).map((x) => x.marked_by).filter(Boolean))
          .concat((moduleCompletions || []).map((x) => x.marked_by).filter(Boolean))
          .concat((lessonCompletions || []).map((x) => x.marked_by).filter(Boolean)),
      ),
    )
    let actorMap = {}
    if (actorIds.length) {
      const { data: actors, error: aErr } = await supabase.from('profiles').select('user_id,email,full_name').in('user_id', actorIds.slice(0, 50))
      if (aErr) throw aErr
      actorMap = {}
      ;(actors || []).forEach((pp) => {
        actorMap[pp.user_id] = pp.full_name || pp.email || pp.user_id
      })
    }

    res.json({
      profile: p,
      enrollments: enrollments || [],
      courses,
      modules,
      lessons,
      courseCompletions: courseCompletions || [],
      moduleCompletions: moduleCompletions || [],
      lessonCompletions: lessonCompletions || [],
      actorMap,
    })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Unable to load progress.' })
  }
})

// Avatar upload (no Supabase storage client in browser)
const AVATAR_ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
app.post(
  '/api/me/avatar',
  verifyUser,
  express.raw({ type: '*/*', limit: '8mb' }),
  async (req, res) => {
    try {
      const contentType = String(req.headers['content-type'] || '').toLowerCase().split(';')[0].trim()
      if (!AVATAR_ALLOWED_MIME.has(contentType)) {
        return res.status(400).json({ error: `Unsupported avatar content-type: ${contentType || 'unknown'}` })
      }
      const size = Buffer.isBuffer(req.body) ? req.body.length : 0
      if (size <= 0) return res.status(400).json({ error: 'Empty upload body' })
      if (size > 5 * 1024 * 1024) return res.status(400).json({ error: 'Avatar exceeds 5MB limit' })

      const fileName = String(req.query?.filename || 'avatar').replace(/[^\w.\-]+/g, '-').slice(0, 120)
      const path = `${req.user.id}/${Date.now()}-${fileName}`

      const { error } = await supabase.storage.from('avatars').upload(path, req.body, {
        upsert: false,
        contentType,
      })
      if (error) throw error

      await supabase
        .from('profiles')
        .update({ avatar_path: path })
        .eq('user_id', req.user.id)

      res.json({ path })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Avatar upload error' })
    }
  },
)

app.get('/api/me/avatar-url', verifyUser, async (req, res) => {
  try {
    const path = String(req.query?.path || '')
    const expiresIn = Number(req.query?.expiresIn || 60 * 60)
    if (!path) return res.status(400).json({ error: 'Missing path' })

    const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, expiresIn)
    if (error) throw error
    res.json({ signedUrl: data?.signedUrl || null })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Avatar url error' })
  }
})

// -------------------------
// Existing admin/business endpoints (kept as-is)
// -------------------------

app.post('/api/inviteApplicant', (req, res) => inviteApplicant(req, res))
app.post('/api/applications/approve', (req, res) => approveApplication(req, res))
app.post('/api/applications/reject', (req, res) => rejectApplication(req, res))
app.post('/api/progress/mark-complete', (req, res) => markComplete(req, res))
app.post('/api/progress/mark-incomplete', (req, res) => markIncomplete(req, res))

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')

// Serve built frontend assets if dist/ exists (production build present)
if (existsSync(distDir)) {
  app.use(express.static(distDir))

  // SPA fallback: any non-API GET request returns index.html so React Router
  // can handle client-side routing for /about, /member, /admin, etc.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
    const indexPath = join(distDir, 'index.html')
    if (existsSync(indexPath)) {
      res.sendFile(indexPath)
    } else {
      next()
    }
  })
}

// API 404 fallback (only reached for unknown /api/* routes)
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` })
})

// On Vercel this module is imported by api/[[...slug]].js and the Express app
// is returned as a serverless handler — never call .listen there. The local
// dev server (npm start) is the only place we want a long-lived listener.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on :${PORT}`)
  })
}

export default app

