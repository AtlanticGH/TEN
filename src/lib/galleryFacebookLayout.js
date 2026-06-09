/** Facebook-style album preview — gapless collage with varied tile sizes. */

/** Collage shows at most this many photos before "+N / View more". */
export const FB_ALBUM_VIEW_MORE_THRESHOLD = 4

/** Photos rendered in the collage (excluding the "+more" tile). */
export const FB_ALBUM_PREVIEW_COUNT = 4

/** @typedef {{ className: string }} CollageTileSlot */

/** How many photos are hidden behind the "+N" tile when total > threshold. */
export function facebookHiddenCount(total) {
  if (total <= FB_ALBUM_VIEW_MORE_THRESHOLD) return 0
  return total - FB_ALBUM_PREVIEW_COUNT
}

/** Whether the collage ends with a "+N more" tile instead of a fifth photo. */
export function facebookShowsMoreTile(total) {
  return total > FB_ALBUM_VIEW_MORE_THRESHOLD
}

/**
 * Grid shell + per-tile spans. Uses uneven row/column spans so photos are not uniform.
 * @returns {{ gridClass: string, tiles: CollageTileSlot[] }}
 */
export function facebookCollageLayout(total) {
  const layout = total > FB_ALBUM_VIEW_MORE_THRESHOLD ? 5 : Math.max(1, Math.min(5, total))

  switch (layout) {
    case 1:
      return {
        gridClass: 'grid-cols-1 grid-rows-1',
        tiles: [{ className: 'col-span-1 row-span-1' }],
      }

    case 2:
      return {
        gridClass: 'grid-cols-5 grid-rows-2',
        tiles: [
          { className: 'col-span-3 row-span-2' },
          { className: 'col-span-2 row-span-2' },
        ],
      }

    case 3:
      return {
        gridClass: 'grid-cols-4 grid-rows-2',
        tiles: [
          { className: 'col-span-2 row-span-2' },
          { className: 'col-span-2 row-span-1' },
          { className: 'col-span-2 row-span-1' },
        ],
      }

    case 4:
      return {
        gridClass: 'grid-cols-6 grid-rows-3',
        tiles: [
          { className: 'col-span-4 row-span-3' },
          { className: 'col-span-2 row-span-1' },
          { className: 'col-span-1 row-span-2' },
          { className: 'col-span-1 row-span-2' },
        ],
      }

    case 5:
    default:
      return {
        gridClass: 'grid-cols-4 grid-rows-3',
        tiles: [
          { className: 'col-span-2 row-span-3' },
          { className: 'col-span-2 row-span-1' },
          { className: 'col-span-1 row-span-1' },
          { className: 'col-span-1 row-span-1' },
          { className: 'col-span-2 row-span-1' },
        ],
      }
  }
}

export function facebookTileClass(index, total) {
  const { tiles } = facebookCollageLayout(total)
  return tiles[index]?.className || 'col-span-1 row-span-1'
}

export function facebookCollageGridClass(total) {
  return facebookCollageLayout(total).gridClass
}
