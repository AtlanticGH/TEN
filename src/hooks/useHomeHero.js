import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_HOME_HERO, HOME_HERO_FIELD_KEYS, HOME_HERO_KEY } from '../config/siteContentDefaults'
import { getSiteContentValue } from '../services/siteContent'
import { mergeSiteContentDefaults } from '../utils/mergeSiteContent'

export { HOME_HERO_KEY }

function mergeHero(override) {
  return mergeSiteContentDefaults(DEFAULT_HOME_HERO, override)
}

export function homeHeroQueryOptions() {
  return {
    queryKey: ['site-content', HOME_HERO_KEY],
    queryFn: () => getSiteContentValue(HOME_HERO_KEY),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 3000),
    refetchOnMount: true,
  }
}

/** Home hero: show defaults immediately, refresh from CMS without a loading skeleton. */
export function useHomeHero() {
  const { data, isFetching, isFetched } = useQuery(homeHeroQueryOptions())

  const heroCopy = useMemo(() => mergeHero(data ?? null), [data])

  const [bgReady, setBgReady] = useState(false)
  const bg = heroCopy.background_image

  useEffect(() => {
    if (!bg) {
      setBgReady(true)
      return undefined
    }
    setBgReady(false)
    const img = new Image()
    img.onload = () => setBgReady(true)
    img.onerror = () => setBgReady(true)
    img.src = bg
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [bg])

  return {
    heroCopy,
    bg,
    bgReady,
    cmsLoaded: isFetched && data !== null,
    isRefreshing: isFetching && isFetched,
  }
}

export function homeHeroFieldsEqual(a, b) {
  return HOME_HERO_FIELD_KEYS.every((key) => a[key] === b[key])
}
