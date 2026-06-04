import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDefaultPageHero, pageHeroKey } from '../config/pageHeroDefaults'
import { getSiteContentValue } from '../services/siteContent'
import { mergeSiteContentDefaults } from '../utils/mergeSiteContent'

export function pageHeroQueryOptions(slug) {
  const key = pageHeroKey(slug)
  return {
    queryKey: ['site-content', key],
    queryFn: () => getSiteContentValue(key),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    enabled: !!slug,
  }
}

export function usePageHero(slug) {
  const { data, isFetching, isFetched } = useQuery(pageHeroQueryOptions(slug))
  const hero = useMemo(() => mergeSiteContentDefaults(getDefaultPageHero(slug), data ?? null), [slug, data])
  return { hero, isRefreshing: isFetching && isFetched }
}
