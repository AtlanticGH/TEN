/**
 * Import photos from Google Drive "extras" folder (download locally first).
 *
 * 1. Open: https://drive.google.com/drive/folders/1PryBaaXF9Wdmf_5oJUwlSRwC9XZmcz_D
 * 2. Download all → unzip into: import/extras/
 * 3. Run: npm run import:extras
 *
 * Copies JPGs into public/assets/images/extras/ for static hosting.
 * Optional: npm run import:extras -- --upload  (also pushes to Supabase media library)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SOURCE = path.join(ROOT, 'import', 'extras')
const DEST = path.join(ROOT, 'public', 'assets', 'images', 'extras')

const upload = process.argv.includes('--upload')

function listJpegs(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      out.push(...listJpegs(full))
      continue
    }
    if (/\.(jpe?g|webp|png)$/i.test(name)) out.push(full)
  }
  return out
}

function normalizeName(filePath) {
  const base = path.basename(filePath)
  return base
    .replace(/^Copy of /i, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

const files = listJpegs(SOURCE)
if (!files.length) {
  console.error(`No images found in ${SOURCE}`)
  console.error('Download the Drive folder into import/extras/ then run again.')
  process.exit(1)
}

fs.mkdirSync(DEST, { recursive: true })

let copied = 0
const manifest = []

for (const src of files) {
  const name = normalizeName(src)
  const dest = path.join(DEST, name)
  if (!fs.existsSync(dest) || fs.statSync(src).mtimeMs > fs.statSync(dest).mtimeMs) {
    fs.copyFileSync(src, dest)
    copied++
  }
  manifest.push({ file: name, publicUrl: `/assets/images/extras/${name}` })
}

const manifestPath = path.join(DEST, 'manifest.json')
fs.writeFileSync(manifestPath, JSON.stringify({ imported_at: new Date().toISOString(), items: manifest }, null, 2))

console.log(`Copied ${copied} new/updated file(s) → public/assets/images/extras/ (${manifest.length} total)`)
console.log(`Manifest: ${manifestPath}`)

if (!upload) {
  console.log('\nUse in CMS: paste URLs like /assets/images/extras/DSC00247.jpg')
  console.log('To upload to Supabase media library: npm run import:extras -- --upload')
  process.exit(0)
}

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for --upload')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

for (const item of manifest) {
  const dest = path.join(DEST, item.file)
  const buf = fs.readFileSync(dest)
  const storagePath = `extras/${item.file}`
  const { error: upErr } = await supabase.storage.from('public').upload(storagePath, buf, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (upErr) {
    console.error(`Upload failed ${item.file}:`, upErr.message)
    continue
  }
  const { data: pub } = supabase.storage.from('public').getPublicUrl(storagePath)
  await supabase.from('media_assets').upsert(
    {
      folder: 'extras',
      bucket: 'public',
      path: storagePath,
      mime_type: 'image/jpeg',
      size_bytes: buf.length,
      title: item.file,
      alt: 'The Ember Network',
      tags: ['extras', 'drive-import'],
    },
    { onConflict: 'bucket,path' },
  )
  console.log(`Uploaded: ${pub?.publicUrl || storagePath}`)
}

console.log('Done. Open Admin → Media library to browse extras/')
