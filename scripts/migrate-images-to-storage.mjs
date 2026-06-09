/**
 * Upload public/assets/images to Supabase storage and replace /assets/ + external
 * image URLs in site_content and page_blocks with storage public URLs.
 *
 * node scripts/migrate-images-to-storage.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ASSETS_ROOT = path.join(ROOT, 'public', 'assets', 'images')

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const projectHost = new URL(url).host

function buildPublicUrl(bucket, storagePath) {
  const base = url.replace(/\/$/, '')
  const encoded = storagePath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encoded}`
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'image/jpeg'
}

function listImageFiles(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      out.push(...listImageFiles(full))
      continue
    }
    if (/\.(jpe?g|png|webp|gif)$/i.test(name)) out.push(full)
  }
  return out
}

function isExternalImageUrl(value) {
  const t = String(value || '').trim()
  if (!t || (t.startsWith('/') && !t.startsWith('//'))) return false
  if (t.includes(projectHost) && t.includes('/storage/v1/object/public/')) return false
  if (/unsplash|picsum|cloudinary|imgur|googleusercontent|drive\.google/i.test(t)) return true
  return /^https?:\/\//i.test(t) && /\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/i.test(t)
}

function normalizeKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** @type {Map<string, string>} */
const urlMap = new Map()

async function indexExistingMedia() {
  const { data, error } = await supabase.from('media_assets').select('*')
  if (error) throw error
  for (const asset of data || []) {
    const pub = buildPublicUrl(asset.bucket || 'public', asset.path)
    const base = normalizeKey(path.basename(asset.path))
    const title = normalizeKey(asset.title)
    urlMap.set(`basename:${base}`, pub)
    if (title) urlMap.set(`title:${title}`, pub)
    if (title.includes('ceo portrat') || title.includes('ceo-portrait')) {
      urlMap.set('/assets/images/profiles/ceo-portrait.jpg', pub)
      urlMap.set('/assets/images/profiles/ceo portrat 7.png', pub)
    }
  }
}

function resolveMappedUrl(value) {
  const t = String(value || '').trim()
  if (!t) return t
  if (urlMap.has(t)) return urlMap.get(t)
  if (t.startsWith('/assets/images/')) {
    const base = normalizeKey(path.basename(t))
    if (urlMap.has(`basename:${base}`)) return urlMap.get(`basename:${base}`)
  }
  return null
}

async function uploadStaticAssets() {
  const files = listImageFiles(ASSETS_ROOT)
  let uploaded = 0
  let skipped = 0

  for (const filePath of files) {
    const relFromPublic = path.relative(path.join(ROOT, 'public'), filePath).replace(/\\/g, '/')
    const publicPath = `/${relFromPublic}`
    const existing = resolveMappedUrl(publicPath)
    if (existing) {
      urlMap.set(publicPath, existing)
      skipped++
      continue
    }

    const storagePath = relFromPublic.replace(/^assets\/images\//, 'legacy/')
    const buf = fs.readFileSync(filePath)
    const { error: upErr } = await supabase.storage.from('public').upload(storagePath, buf, {
      contentType: mimeFor(filePath),
      upsert: true,
    })
    if (upErr) {
      console.error(`Upload failed ${storagePath}:`, upErr.message)
      continue
    }

    const pub = buildPublicUrl('public', storagePath)
    urlMap.set(publicPath, pub)
    urlMap.set(`basename:${normalizeKey(path.basename(filePath))}`, pub)

    await supabase.from('media_assets').upsert(
      {
        folder: 'uploads',
        bucket: 'public',
        path: storagePath,
        mime_type: mimeFor(filePath),
        size_bytes: buf.length,
        title: path.basename(filePath),
        alt: 'The Ember Network',
        tags: ['legacy-import'],
      },
      { onConflict: 'bucket,path' },
    )

    uploaded++
    console.log(`Uploaded ${publicPath} → ${storagePath}`)
  }

  console.log(`Static assets: ${uploaded} uploaded, ${skipped} already mapped`)
}

const IMAGE_FIELD_RE =
  /(^|\.)(image|images|background_image|featured_image_url|og_image_url|avatar|preview_image|fallback_image|image_fallback|poster|thumbnail|src)(_url)?$/i

function transformValue(keyPath, value) {
  if (typeof value !== 'string') return value
  const t = value.trim()
  if (!t) return ''

  if (IMAGE_FIELD_RE.test(keyPath) || /\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/i.test(t)) {
    if (isExternalImageUrl(t)) return ''
    if (/^image_fallback$/i.test(keyPath.split('.').pop() || '')) return ''
    const mapped = resolveMappedUrl(t)
    if (mapped) return mapped
    if (t.startsWith('/assets/')) return ''
    if (t.includes(projectHost) && t.includes('/storage/v1/object/public/')) return t
    if (/^https?:\/\//i.test(t)) return ''
  }

  return value
}

function transformObject(obj, keyPath = '') {
  if (typeof obj === 'string') return transformValue(keyPath, obj)
  if (Array.isArray(obj)) return obj.map((item, i) => transformObject(item, `${keyPath}[${i}]`))
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      const nextPath = keyPath ? `${keyPath}.${k}` : k
      if (k === 'image_fallback') {
        out[k] = ''
        continue
      }
      out[k] = transformObject(v, nextPath)
    }
    return out
  }
  return obj
}

async function migrateSiteContent() {
  const { data, error } = await supabase.from('site_content').select('key, value')
  if (error) throw error
  let updated = 0
  for (const row of data || []) {
    const next = transformObject(row.value, row.key)
    if (JSON.stringify(next) === JSON.stringify(row.value)) continue
    const { error: upErr } = await supabase
      .from('site_content')
      .update({ value: next, updated_at: new Date().toISOString() })
      .eq('key', row.key)
    if (upErr) throw upErr
    updated++
    console.log(`Updated site_content ${row.key}`)
  }
  console.log(`site_content rows updated: ${updated}`)
}

async function migratePageBlocks() {
  const { data, error } = await supabase.from('page_blocks').select('id, content')
  if (error) throw error
  let updated = 0
  for (const row of data || []) {
    const next = transformObject(row.content, row.id)
    if (JSON.stringify(next) === JSON.stringify(row.content)) continue
    const { error: upErr } = await supabase.from('page_blocks').update({ content: next }).eq('id', row.id)
    if (upErr) throw upErr
    updated++
    console.log(`Updated page_block ${row.id}`)
  }
  console.log(`page_blocks rows updated: ${updated}`)
}

async function migratePages() {
  const { data, error } = await supabase.from('pages').select('id, slug, featured_image_url, og_image_url')
  if (error) {
    console.warn('Skipping pages migration:', error.message)
    return
  }
  let updated = 0
  for (const row of data || []) {
    const featured = transformValue(`${row.slug}.featured_image_url`, row.featured_image_url || '')
    const og = transformValue(`${row.slug}.og_image_url`, row.og_image_url || '')
    if (featured === (row.featured_image_url || '') && og === (row.og_image_url || '')) continue
    const { error: upErr } = await supabase
      .from('pages')
      .update({ featured_image_url: featured || null, og_image_url: og || null })
      .eq('id', row.id)
    if (upErr) throw upErr
    updated++
    console.log(`Updated pages ${row.slug}`)
  }
  console.log(`pages rows updated: ${updated}`)
}

async function registerLegacyMediaAssets() {
  const files = listImageFiles(ASSETS_ROOT)
  let registered = 0
  for (const filePath of files) {
    const relFromPublic = path.relative(path.join(ROOT, 'public'), filePath).replace(/\\/g, '/')
    const storagePath = relFromPublic.replace(/^assets\/images\//, 'legacy/')
    const buf = fs.statSync(filePath)
    const { error } = await supabase.from('media_assets').upsert(
      {
        folder: 'uploads',
        bucket: 'public',
        path: storagePath,
        mime_type: mimeFor(filePath),
        size_bytes: buf.size,
        title: path.basename(filePath),
        alt: 'The Ember Network',
        tags: ['legacy-import'],
      },
      { onConflict: 'bucket,path' },
    )
    if (error) {
      console.error(`media_assets register failed ${storagePath}:`, error.message)
      continue
    }
    registered++
  }
  console.log(`media_assets registered: ${registered}`)
}

await indexExistingMedia()
await uploadStaticAssets()
await registerLegacyMediaAssets()
await migrateSiteContent()
await migratePageBlocks()
await migratePages()
console.log('Done.')
