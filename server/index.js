import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import { loadProjectEnv } from './loadEnv.js'
import { createSupabaseProxy, getSupabaseAdmin, hasSupabaseServerEnv, readSupabaseEnvStatus, readSupabaseServerEnv } from './supabaseEnv.js'
import { registerAdminRoutes } from './adminRoutes.js'
import { registerCmsRoutes } from './cmsRoutes.js'
import { registerGalleryEnsureRoute } from './galleryEnsureRoute.js'
import { registerResourcesRoutes } from './resourcesRoutes.js'

loadProjectEnv()

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
  return [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:4173',
    'http://localhost:3000',
  ]
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

const supabase = createSupabaseProxy(createClient)

if (!hasSupabaseServerEnv()) {
  // eslint-disable-next-line no-console
  console.warn(
    '[server] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — copy .env.example → .env.local, add keys from Supabase Dashboard → Settings → API, then restart (npm run dev:all)',
  )
}

function requireSupabase(res) {
  if (getSupabaseAdmin(createClient)) return true
  res.status(500).json({ error: 'Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' })
  return false
}

async function verifyUser(req, res, next) {
  try {
    const db = getSupabaseAdmin(createClient)
    if (!db) return res.status(500).json({ error: 'Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' })
    const h = req.headers?.authorization || req.headers?.Authorization || ''
    const m = String(h).match(/^Bearer\s+(.+)$/i)
    const token = m ? m[1] : ''
    if (!token) return res.status(401).json({ error: 'No token' })

    const { data, error } = await db.auth.getUser(token)
    if (error || !data?.user?.id) return res.status(401).json({ error: 'Invalid session' })

    req.user = data.user
    req.accessToken = token
    next()
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Auth error' })
  }
}

async function ensureProfileRow(user) {
  const db = getSupabaseAdmin(createClient)
  if (!db) throw new Error('Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
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
      role: 'viewer',
      status: 'active',
    })
    .select('*')
    .single()

  if (insErr) throw insErr
  return inserted
}

async function enrichProfileAvatar(row) {
  const db = getSupabaseAdmin(createClient)
  if (!row?.avatar_path || !db) return row
  try {
    const { data, error } = await db.storage.from('avatars').createSignedUrl(row.avatar_path, 60 * 60)
    if (error || !data?.signedUrl) return row
    return { ...row, avatar_url: data.signedUrl, profile_image_url: data.signedUrl }
  } catch {
    return row
  }
}

async function getMyProfileRow(userId, authUser = null) {
  const db = getSupabaseAdmin(createClient)
  if (!db) throw new Error('Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  const { data, error } = await db.from('profiles').select('*').eq('user_id', userId).maybeSingle()
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
  return ['admin', 'super_admin', 'staff', 'editor'].includes(String(role || ''))
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
  'skills',
  'interests',
  'profile_image_url',
  'avatar_path',
  'avatar_url',
]
const MEDIA_STAFF_UPDATABLE = ['title', 'alt', 'tags', 'folder']

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
    if (!getSupabaseAdmin(createClient)) {
      return res.status(500).json({ error: 'Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' })
    }
    const actor = await getMyProfileRow(req.user.id, req.user)
    if (!actor || actor.status !== 'active' || !isStaffRole(actor.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    req.actorProfile = actor
    next()
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Staff auth error' })
  }
}

async function healthzHandler(_req, res) {
  const db = getSupabaseAdmin(createClient)
  if (!db) {
    return res.status(503).json({ ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' })
  }
  const { error } = await db.from('site_content').select('key').limit(1)
  if (error) {
    return res.status(503).json({ ok: false, error: error.message })
  }
  return res.status(200).send('ok')
}

app.get('/healthz', healthzHandler)
app.get('/api/healthz', healthzHandler)
app.get('/api/env-status', (_req, res) => {
  res.json(readSupabaseEnvStatus())
})

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

app.post('/api/public/auth/resolve-login', async (req, res) => {
  try {
    if (!requireSupabase(res)) return
    const raw = String(req.body?.identifier ?? '').trim()
    if (!raw) {
      res.status(400).json({ error: 'Missing email or username' })
      return
    }
    if (raw.includes('@')) {
      res.json({ email: raw.toLowerCase() })
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', raw)
      .maybeSingle()
    if (error) throw error
    if (!data?.email) {
      res.status(404).json({ error: 'No account found for that username' })
      return
    }
    res.json({ email: String(data.email).trim().toLowerCase() })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Login lookup error' })
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
  const base = String(readSupabaseServerEnv().SUPABASE_URL || '').replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`
}

app.get('/api/public/gallery-media', async (req, res) => {
  try {
    if (!requireSupabase(res)) return
    const limit = Math.max(1, Math.min(120, Number(req.query?.limit || 48)))
    const folder = String(req.query?.folder || '').trim()
    const mediaType = String(req.query?.type || 'image').toLowerCase()
    let q = supabase
      .from('media_assets')
      .select('id,title,alt,path,bucket,mime_type,folder,created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (folder) q = q.eq('folder', folder)
    const { data, error } = await q
    if (error) throw error
    const rows = (data || [])
      .filter((row) => {
        const mime = String(row.mime_type || '')
        const isImage = mime.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg)$/i.test(row.path || '')
        const isVideo = mime.startsWith('video/') || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(row.path || '')
        if (mediaType === 'video') return isVideo
        if (mediaType === 'all') return isImage || isVideo
        return isImage
      })
      .map((row) => ({
        ...row,
        public_url: publicObjectUrl(row.bucket || 'public', row.path),
      }))
    res.json(rows)
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Gallery media error' })
  }
})

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
      .select('id, user_id, action, entity_type, entity_id, meta, created_at')
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
      user_id: req.user.id,
      action: payload.action || 'unknown',
      entity_type: payload.entityType || payload.entity_type || 'unknown',
      entity_id: payload.entityId ? String(payload.entityId) : null,
      meta: payload.metadata || payload.meta || {},
    })
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Log activity error' })
  }
})

// Media assets (admin)
app.get('/api/admin/media-assets', verifyUser, requireStaff, async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(500, Number(req.query?.limit || 100)))
    const query = String(req.query?.query || '').trim()
    const folder = String(req.query?.folder || '').trim()
    const mediaType = String(req.query?.type || 'all').toLowerCase()
    let q = supabase.from('media_assets').select('*').order('created_at', { ascending: false }).limit(limit)
    if (folder) q = q.eq('folder', folder)
    if (query) q = q.or(`title.ilike.%${query}%,path.ilike.%${query}%,mime_type.ilike.%${query}%`)
    const { data, error } = await q
    if (error) throw error
    const rows = (data || [])
      .filter((row) => {
        const mime = String(row.mime_type || '')
        const path = String(row.path || '')
        const isImage = mime.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(path)
        const isVideo = mime.startsWith('video/') || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(path)
        const isPdf = mime === 'application/pdf' || /\.pdf(\?|$)/i.test(path)
        if (mediaType === 'image') return isImage
        if (mediaType === 'video') return isVideo
        if (mediaType === 'pdf') return isPdf
        return true
      })
      .map((row) => ({
        ...row,
        folder: row.folder || String(row.path || '').split('/')[0] || 'general',
        public_url: publicObjectUrl(row.bucket || 'public', row.path),
      }))
    res.json(rows)
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
          folder: folder || 'general',
          mime_type: contentType || null,
          size_bytes: Buffer.isBuffer(req.body) ? req.body.length : null,
          title: title || filename,
          alt: alt || null,
          tags,
        })
        .select('*')
        .single()
      if (error) throw error
      res.json({
        ...data,
        public_url: publicObjectUrl(data.bucket || 'public', data.path),
      })
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

registerAdminRoutes(app, { supabase, verifyUser, requireStaff, pickFields, requireSupabase })
registerCmsRoutes(app, {
  supabase,
  verifyUser,
  requireStaff,
  pickFields,
  requireSupabase,
  getMyProfileRow,
})
registerGalleryEnsureRoute(app, { supabase, verifyUser, requireStaff })
registerResourcesRoutes(app, {
  supabase,
  verifyUser,
  requireStaff,
  requireSupabase,
  supabaseUrl: () => readSupabaseServerEnv().SUPABASE_URL,
})

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

// On Vercel this module is imported by api/index.js and the Express app
// is returned as a serverless handler — never call .listen there. The local
// dev server (npm start) is the only place we want a long-lived listener.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on :${PORT}`)
  })
}

export default app

