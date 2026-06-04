import { useQuery } from '@tanstack/react-query'
import { getPublicNavigation } from '../services/cms/navigation'

export function navigationQueryOptions(key = 'main') {
  return {
    queryKey: ['navigation', key],
    queryFn: () => getPublicNavigation(key),
    staleTime: 1000 * 60 * 10,
  }
}

export function useNavigation(key = 'main') {
  const { data, isLoading } = useQuery(navigationQueryOptions(key))
  return {
    items: data?.items || [],
    label: data?.label || 'Menu',
    loading: isLoading,
  }
}
