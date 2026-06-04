/** CMS blocks superseded by site_content people editor (about.founder.v1 / about.team.v1). */
export function isAboutPeopleCmsBlock(block) {
  if (!block?.block_type) return false
  if (block.block_type === 'features' && block.content?.variant === 'team') return true
  if (block.block_type === 'rich_text' && /Meet Our Founder/i.test(String(block.content?.html || ''))) return true
  return false
}
