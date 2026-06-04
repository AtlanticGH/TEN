import { useQuery } from '@tanstack/react-query'
import { listCmsContentRows } from '../services/cmsContentRows'

export function cmsSectionsQueryOptions(pageKey) {
  return {
    queryKey: ['cms-sections', pageKey],
    queryFn: async () => {
      const rows = await listCmsContentRows({ includeDrafts: false })
      return (rows || []).filter((r) => r.page_key === pageKey && r.published !== false)
    },
    staleTime: 1000 * 60 * 5,
  }
}

export function useCmsSections(pageKey) {
  const { data, isLoading } = useQuery(cmsSectionsQueryOptions(pageKey))
  return { sections: data || [], loading: isLoading, hasSections: (data || []).length > 0 }
}
