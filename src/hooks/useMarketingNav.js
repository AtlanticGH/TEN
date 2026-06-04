import { useMemo } from 'react'
import { normalizeMarketingNavItems } from '../lib/marketingNav'
import { SITE_NAV_LINKS } from '../components/layout/headerTokens'
import { useNavigation } from './useNavigation'

/** CMS main menu with static fallback while loading or on error. */
export function useMarketingNav() {
  const { items, loading } = useNavigation('main')

  const links = useMemo(() => {
    if (items?.length) {
      return normalizeMarketingNavItems(items)
    }
    return SITE_NAV_LINKS
  }, [items])

  return { links, loading, fromCms: !!items?.length }
}
