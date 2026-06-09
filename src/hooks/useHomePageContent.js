import { useQuery } from '@tanstack/react-query'
import { DEFAULT_HOME_PAGE_CONTENT, HOME_PAGE_CONTENT_KEY, mergeHomePageContent } from '../config/homePageContentDefaults'
import { extractSiteContentValue, getSiteContent } from '../services/siteContent'

async function loadHomePageContent() {
  try {
    const row = await getSiteContent(HOME_PAGE_CONTENT_KEY)
    return mergeHomePageContent(DEFAULT_HOME_PAGE_CONTENT, extractSiteContentValue(row))
  } catch {
    return mergeHomePageContent(DEFAULT_HOME_PAGE_CONTENT, null)
  }
}

export function useHomePageContent() {
  return useQuery({
    queryKey: ['site-content', HOME_PAGE_CONTENT_KEY],
    queryFn: loadHomePageContent,
    placeholderData: DEFAULT_HOME_PAGE_CONTENT,
    staleTime: 1000 * 60 * 5,
  })
}
