/**
 * Seed gallery page blocks (hero + image grid).
 * node scripts/bootstrap-gallery.mjs [--force]
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const force = process.argv.includes('--force')

const { DEFAULT_GALLERY_BLOCK_ALBUMS } = await import('../src/lib/galleryDefaults.js')

let pageId
const { data: page, error: pageErr } = await supabase.from('pages').select('id').eq('slug', 'gallery').maybeSingle()
if (pageErr) {
  console.error(pageErr.message)
  process.exit(1)
}
if (!page) {
  const { data: created, error: insErr } = await supabase
    .from('pages')
    .insert({
      slug: 'gallery',
      title: 'Gallery',
      status: 'published',
      sort_order: 35,
      seo_title: 'Gallery',
      seo_description: 'Photos from The Ember Network',
      layout_mode: 'blocks_only',
    })
    .select('id')
    .single()
  if (insErr) {
    console.error('Could not create gallery page:', insErr.message)
    process.exit(1)
  }
  pageId = created.id
} else {
  pageId = page.id
}
const { count } = await supabase.from('page_blocks').select('id', { count: 'exact', head: true }).eq('page_id', pageId)
if (count > 0 && !force) {
  console.log(`Gallery already has ${count} block(s). Use --force to replace.`)
  process.exit(0)
}

if (count > 0 && force) {
  await supabase.from('page_blocks').delete().eq('page_id', pageId)
}

const blocks = [
  {
    block_type: 'hero',
    sort_order: 0,
    content: {
      variant: 'inner',
      badge: 'Gallery',
      headline_before: 'Moments from the network',
      description:
        'Watch program highlights and browse photos from events, mentorship sessions, and community gatherings.',
      background_image: '/assets/images/1531123897727-8f129e1688ce.jpg',
    },
  },
  {
    block_type: 'video_gallery',
    sort_order: 1,
    content: {
      eyebrow: 'Videos',
      title: 'Program highlights',
      subtitle: 'Add YouTube/Vimeo links or upload videos via the media library.',
      items: [],
    },
  },
  {
    block_type: 'gallery',
    sort_order: 2,
    content: {
      eyebrow: 'Photos',
      title: 'Photo albums',
      subtitle: 'Browse collections by theme — each album has a caption, description, and photo captions.',
      albums: DEFAULT_GALLERY_BLOCK_ALBUMS,
    },
  },
]

for (const b of blocks) {
  const { error } = await supabase.from('page_blocks').insert({
    page_id: pageId,
    block_type: b.block_type,
    content: b.content,
    sort_order: b.sort_order,
    enabled: true,
  })
  if (error) {
    console.error('Insert failed:', error.message)
    process.exit(1)
  }
}

await supabase.from('pages').update({ status: 'published', layout_mode: 'blocks_only' }).eq('id', pageId)
console.log('Gallery page seeded and published.')
