import {
  blockContentToPageHero,
  getDefaultPageHero,
  pageHeroKey,
  pageHeroToBlockContent,
} from '../config/pageHeroDefaults'
import { createPageBlock, listAdminPages, listPageBlocks, updatePageBlock } from './cms/pages'
import { extractSiteContentValue, getSiteContent, upsertSiteContent } from './siteContent'
import { mergeSiteContentDefaults } from '../utils/mergeSiteContent'

export async function loadPageHeroForAdmin(slug) {
  const key = pageHeroKey(slug)
  const defaults = getDefaultPageHero(slug)
  let row = null
  try {
    row = await getSiteContent(key)
  } catch {
    row = null
  }
  const fromSite = extractSiteContentValue(row)
  if (fromSite && (fromSite.heading || fromSite.image || fromSite.badge)) {
    return mergeSiteContentDefaults(defaults, fromSite)
  }

  const pages = await listAdminPages()
  const page = (pages || []).find((p) => p.slug === slug)
  if (!page?.id) return { ...defaults }

  const blocks = await listPageBlocks(page.id)
  const heroBlock = (blocks || []).find((b) => b.block_type === 'hero')
  if (heroBlock?.content) {
    return mergeSiteContentDefaults(defaults, blockContentToPageHero(heroBlock.content))
  }

  return { ...defaults }
}

export async function syncHeroBlockForSlug(slug, hero) {
  const pages = await listAdminPages()
  const page = (pages || []).find((p) => p.slug === slug)
  if (!page?.id) return null

  const blocks = await listPageBlocks(page.id)
  const heroBlock = (blocks || []).find((b) => b.block_type === 'hero')
  const content = pageHeroToBlockContent(hero)

  if (heroBlock?.id) {
    return updatePageBlock(heroBlock.id, { content })
  }
  return createPageBlock(page.id, {
    block_type: 'hero',
    content,
    sort_order: 0,
    enabled: true,
  })
}

export async function savePageHero(slug, hero) {
  const key = pageHeroKey(slug)
  await upsertSiteContent({ key, value: hero })
  try {
    await syncHeroBlockForSlug(slug, hero)
  } catch {
    // Page or blocks may not exist yet; site_content is still the public source of truth.
  }
  return hero
}
