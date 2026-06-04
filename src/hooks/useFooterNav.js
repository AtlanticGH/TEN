import { useMemo } from 'react'
import { normalizeMarketingNavItems } from '../lib/marketingNav'
import { useNavigation } from './useNavigation'

/** Footer menu from CMS (`footer` key) with main-nav fallback handled in Footer. */
export function useFooterNav() {
  const { items, loading } = useNavigation('footer')
  const links = useMemo(() => {
    if (!items?.length) return []
    return normalizeMarketingNavItems(items)
  }, [items])
  return { links, loading, fromCms: !!items?.length }
}
