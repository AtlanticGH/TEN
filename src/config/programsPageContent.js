/** @deprecated Use programsContentDefaults + useProgramsContent — kept for scripts/tests. */
import { DEFAULT_PROGRAMS_PAGE_CONTENT } from './programsContentDefaults'
import { programCardIcon } from '../lib/programCardIcons'

export const PROGRAM_CARDS = DEFAULT_PROGRAMS_PAGE_CONTENT.cards.map((card) => ({
  Icon: programCardIcon(card.icon),
  title: card.title,
  tagline: card.tagline,
  description: card.description,
  image: card.image,
  imageAlt: card.image_alt,
}))

export const PROGRAMS_GROWTH_CYCLE = DEFAULT_PROGRAMS_PAGE_CONTENT.growth_stages.map((stage) => ({
  num: stage.num,
  stage: stage.stage,
  title: stage.title,
  tagline: stage.tagline,
  description: stage.description,
  image: stage.image,
  imageAlt: stage.image_alt,
}))
