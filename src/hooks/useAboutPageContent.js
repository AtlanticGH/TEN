import { useQuery } from '@tanstack/react-query'
import {
  ABOUT_PAGE_CONTENT_KEY,
  DEFAULT_ABOUT_PAGE_CONTENT,
  mergeAboutPageContent,
} from '../config/aboutContentDefaults'
import { extractSiteContentValue, getSiteContent } from '../services/siteContent'

export function useAboutPageContent() {
  return useQuery({
    queryKey: ['site-content', ABOUT_PAGE_CONTENT_KEY],
    queryFn: async () => {
      try {
        const row = await getSiteContent(ABOUT_PAGE_CONTENT_KEY)
        return mergeAboutPageContent(extractSiteContentValue(row))
      } catch {
        return mergeAboutPageContent(null)
      }
    },
    placeholderData: DEFAULT_ABOUT_PAGE_CONTENT,
    staleTime: 1000 * 60 * 5,
  })
}
