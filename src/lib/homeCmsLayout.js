/** How CMS blocks combine with legacy home sections (extended hybrid by default). */
export function resolveHomeCmsLayout(blocks, page) {
  const enabled = (blocks || []).filter((b) => b.enabled !== false)
  const hero = enabled.find((b) => b.block_type === 'hero')
  const layoutMode = page?.layout_mode || 'hybrid'
  const cmsOnly =
    layoutMode === 'blocks_only' || hero?.content?.hide_legacy_sections === true

  if (layoutMode === 'legacy') {
    return { mode: 'legacy', blocks: [], showLegacy: true, heroBlocks: [], middleBlocks: [] }
  }

  if (cmsOnly) {
    return { mode: 'full', blocks: enabled, showLegacy: false }
  }

  if (!hero) {
    return {
      mode: 'blocks_plus_legacy',
      heroBlocks: [],
      middleBlocks: enabled,
      showLegacy: true,
    }
  }

  return {
    mode: 'hybrid',
    heroBlocks: [hero],
    middleBlocks: enabled.filter((b) => b.id !== hero.id),
    showLegacy: true,
  }
}
