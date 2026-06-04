/** Tile shape cycle for gallery grids (square / wide / tall / feature). */
const TILE_CYCLE = ['square', 'tall', 'wide', 'square', 'wide', 'square', 'tall', 'feature', 'square']

export function galleryTileVariant(index, item) {
  if (item?.tile && ['square', 'wide', 'tall', 'feature'].includes(item.tile)) return item.tile
  return TILE_CYCLE[index % TILE_CYCLE.length]
}

/** Tailwind grid placement — use with `grid-flow-dense` on the parent. */
export function galleryTileClass(variant) {
  switch (variant) {
    case 'wide':
      return 'col-span-2 row-span-1'
    case 'tall':
      return 'col-span-1 row-span-2'
    case 'feature':
      return 'col-span-2 row-span-2 max-sm:row-span-1'
    default:
      return 'col-span-1 row-span-1'
  }
}
