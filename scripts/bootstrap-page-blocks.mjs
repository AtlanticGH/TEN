/**
 * Seed page_blocks for marketing pages.
 * Usage: node scripts/bootstrap-page-blocks.mjs about [home] [--force]
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { PAGE_BLOCK_SEEDS } from '../src/config/pageBlocksSeed.js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const args = process.argv.slice(2).filter((a) => a !== '--force')
const force = process.argv.includes('--force')
const slugs = args.length ? args : ['home']

const supabase = createClient(url, key, { auth: { persistSession: false } })

for (const slug of slugs) {
  const blocks = PAGE_BLOCK_SEEDS[slug]
  if (!blocks?.length) {
    console.error(`No block seed for slug "${slug}". Add to src/config/pageBlocksSeed.js`)
    process.exit(1)
  }

  const { data: page, error: pageErr } = await supabase.from('pages').select('id').eq('slug', slug).maybeSingle()
  if (pageErr || !page) {
    console.error(`Page "${slug}" not found. Run supabase migrations first.`)
    process.exit(1)
  }

  const { count } = await supabase.from('page_blocks').select('id', { count: 'exact', head: true }).eq('page_id', page.id)
  if (count > 0 && !force) {
    console.log(`[${slug}] Already has ${count} block(s). Use --force to replace.`)
    continue
  }

  if (count > 0 && force) {
    await supabase.from('page_blocks').delete().eq('page_id', page.id)
    console.log(`[${slug}] Cleared existing blocks.`)
  }

  for (const b of blocks) {
    const { error } = await supabase.from('page_blocks').insert({
      page_id: page.id,
      block_type: b.block_type,
      content: b.content,
      sort_order: b.sort_order,
      enabled: true,
    })
    if (error) {
      console.error(`[${slug}] Insert failed:`, error.message)
      process.exit(1)
    }
    console.log(`[${slug}] Added ${b.block_type} (${b.sort_order})`)
  }

  await supabase.from('pages').update({ status: 'published', layout_mode: 'blocks' }).eq('id', page.id)
  console.log(`[${slug}] Published with ${blocks.length} blocks.`)
}
