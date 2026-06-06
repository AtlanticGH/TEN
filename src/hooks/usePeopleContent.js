import { useQuery } from '@tanstack/react-query'
import {
  ABOUT_FOUNDER_KEY,
  ABOUT_TEAM_KEY,
  DEFAULT_ABOUT_FOUNDER,
  DEFAULT_ABOUT_TEAM,
  DEFAULT_HOME_TORCHBEARER,
  HOME_TORCHBEARER_KEY,
} from '../config/peopleContentDefaults'
import { extractSiteContentValue, getSiteContent } from '../services/siteContent'
import { mergeSiteContentDefaults } from '../utils/mergeSiteContent'

async function loadPeopleContent(key, defaults) {
  try {
    const row = await getSiteContent(key)
    const cms = extractSiteContentValue(row)
    return mergeSiteContentDefaults(defaults, cms)
  } catch {
    return mergeSiteContentDefaults(defaults, null)
  }
}

export function useAboutFounder() {
  return useQuery({
    queryKey: ['site-content', ABOUT_FOUNDER_KEY],
    queryFn: () => loadPeopleContent(ABOUT_FOUNDER_KEY, DEFAULT_ABOUT_FOUNDER),
    initialData: DEFAULT_ABOUT_FOUNDER,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAboutTeam() {
  return useQuery({
    queryKey: ['site-content', ABOUT_TEAM_KEY],
    queryFn: () => loadPeopleContent(ABOUT_TEAM_KEY, DEFAULT_ABOUT_TEAM),
    initialData: DEFAULT_ABOUT_TEAM,
    staleTime: 1000 * 60 * 5,
  })
}

export function useHomeTorchbearer() {
  return useQuery({
    queryKey: ['site-content', HOME_TORCHBEARER_KEY],
    queryFn: () => loadPeopleContent(HOME_TORCHBEARER_KEY, DEFAULT_HOME_TORCHBEARER),
    initialData: DEFAULT_HOME_TORCHBEARER,
    staleTime: 1000 * 60 * 5,
  })
}
