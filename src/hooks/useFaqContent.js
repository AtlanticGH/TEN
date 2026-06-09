import { useQuery } from '@tanstack/react-query'
import { mergeFaqContent } from '../config/faqContentDefaults'
import { extractSiteContentValue, getSiteContent } from '../services/siteContent'

async function loadFaqContent(key, defaults) {
  try {
    const row = await getSiteContent(key)
    return mergeFaqContent(defaults, extractSiteContentValue(row))
  } catch {
    return mergeFaqContent(defaults, null)
  }
}

export function useFaqContent(key, defaults) {
  return useQuery({
    queryKey: ['site-content', key],
    queryFn: () => loadFaqContent(key, defaults),
    placeholderData: defaults,
    staleTime: 1000 * 60 * 5,
  })
}
