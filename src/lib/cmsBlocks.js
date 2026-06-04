/** Drop hero blocks — page heroes come from site_content (PageHeroSection). */
export function blocksWithoutHero(blocks) {
  return (blocks || []).filter((b) => b.enabled !== false && b.block_type !== 'hero')
}
