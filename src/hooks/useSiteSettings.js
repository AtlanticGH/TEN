import { useQuery } from '@tanstack/react-query'
import { getPublicSiteSettings } from '../services/cms/settings'

const DEFAULT_SETTINGS = {
  site_name: 'The Ember Network',
  tagline: '',
  contact_email: '',
  contact_phone: '',
  social: {},
  footer: {},
  seo: { default_title: 'The Ember Network', default_description: '' },
  analytics: {},
}

export function siteSettingsQueryOptions(key = 'global.v1') {
  return {
    queryKey: ['site-settings', key],
    queryFn: async () => {
      const row = await getPublicSiteSettings(key)
      return { ...(DEFAULT_SETTINGS), ...(row?.value || {}) }
    },
    staleTime: 1000 * 60 * 10,
  }
}

export function useSiteSettings(key = 'global.v1') {
  const { data, isLoading, isError } = useQuery(siteSettingsQueryOptions(key))
  return {
    settings: data || DEFAULT_SETTINGS,
    loading: isLoading,
    isError,
  }
}
