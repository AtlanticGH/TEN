import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DEFAULT_PROGRAMS_PAGE_CONTENT,
  PROGRAMS_PAGE_CONTENT_KEY,
  mergeProgramsPageContent,
} from '../config/programsContentDefaults'
import { programCardIcon } from '../lib/programCardIcons'
import { getSiteContentValue } from '../services/siteContent'
import { parseSiteContentValue } from '../utils/mergeSiteContent'

export function programsContentQueryOptions() {
  return {
    queryKey: ['site-content', PROGRAMS_PAGE_CONTENT_KEY],
    queryFn: () => getSiteContentValue(PROGRAMS_PAGE_CONTENT_KEY),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 2,
  }
}

export function useProgramsContent() {
  const { data, isFetching, isFetched } = useQuery(programsContentQueryOptions())

  const content = useMemo(() => {
    const parsed = parseSiteContentValue(data)
    return mergeProgramsPageContent(DEFAULT_PROGRAMS_PAGE_CONTENT, parsed)
  }, [data])

  const cards = useMemo(
    () =>
      content.cards.map((card) => ({
        ...card,
        Icon: programCardIcon(card.icon),
        imageAlt: card.image_alt || card.imageAlt || card.title,
      })),
    [content.cards],
  )

  const growthStages = useMemo(
    () =>
      content.growth_stages.map((stage) => ({
        ...stage,
        imageAlt: stage.image_alt || stage.imageAlt || stage.title,
      })),
    [content.growth_stages],
  )

  return {
    content,
    cards,
    growthStages,
    isRefreshing: isFetching && isFetched,
  }
}
