import { useEffect, useState } from 'react'
import { DEFAULT_HOME_HERO, HOME_HERO_FIELD_KEYS } from '../config/siteContentDefaults'
import { getSiteContentValue } from '../services/siteContent'
import { mergeSiteContentDefaults, siteContentFieldsEqual } from '../utils/mergeSiteContent'

const HOME_HERO_KEY = 'home.hero.v1'

function mergeHero(override) {
  return mergeSiteContentDefaults(DEFAULT_HOME_HERO, override)
}

export function useHomeHero() {
  const [heroCopy, setHeroCopy] = useState(() => mergeHero(null))
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    let alive = true
    setStatus('loading')

    getSiteContentValue(HOME_HERO_KEY)
      .then((value) => {
        if (!alive) return
        const merged = mergeHero(value)
        setHeroCopy((prev) =>
          siteContentFieldsEqual(prev, merged, HOME_HERO_FIELD_KEYS) ? prev : merged,
        )
        setStatus('ready')
      })
      .catch((err) => {
        if (!alive) return
        setHeroCopy(mergeHero(null))
        setStatus('error')
        if (import.meta.env.DEV) {
          console.warn('[HomePage] Failed to load home hero CMS:', err?.message || err)
        }
      })

    return () => {
      alive = false
    }
  }, [])

  return { heroCopy, status, isLoading: status === 'loading', hasError: status === 'error' }
}
