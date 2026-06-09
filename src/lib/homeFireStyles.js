/** Visual presets for FIRE letters — styling stays in code; CMS edits copy only. */
export const FIRE_LETTER_STYLES = {
  F: {
    panelClass: 'bg-orange-50 dark:bg-zinc-900',
    letterClass: 'text-orange-600 dark:text-orange-400',
    accentClass: 'bg-orange-500',
    titleClass: 'text-zinc-900 dark:text-white',
    bodyClass: 'text-zinc-700 dark:text-zinc-300',
  },
  I: {
    panelClass: 'bg-orange-100 dark:bg-zinc-800',
    letterClass: 'text-orange-600 dark:text-orange-400',
    accentClass: 'bg-orange-500',
    titleClass: 'text-zinc-900 dark:text-white',
    bodyClass: 'text-zinc-700 dark:text-zinc-300',
  },
  R: {
    panelClass: 'bg-zinc-900 dark:bg-zinc-950',
    letterClass: 'text-orange-400',
    accentClass: 'bg-orange-400',
    titleClass: 'text-white',
    bodyClass: 'text-zinc-300',
  },
  E: {
    panelClass: 'bg-orange-500 dark:bg-orange-600',
    letterClass: 'text-white',
    accentClass: 'bg-white',
    titleClass: 'text-white',
    bodyClass: 'text-orange-50',
  },
}

export function enrichFireItems(items) {
  return (items || []).map((item) => ({
    ...(FIRE_LETTER_STYLES[item.letter] || FIRE_LETTER_STYLES.F),
    ...item,
  }))
}
