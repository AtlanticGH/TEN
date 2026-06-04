import { useEffect } from 'react'
import { useSiteSettings } from '../../hooks/useSiteSettings'

/** Applies favicon (and optional theme-color) from CMS site settings. */
export function SiteBranding() {
  const { settings } = useSiteSettings()

  useEffect(() => {
    const favicon = settings?.favicon_url?.trim()
    if (!favicon) return

    let link = document.querySelector('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'icon')
      document.head.appendChild(link)
    }
    link.setAttribute('href', favicon)
  }, [settings?.favicon_url])

  return null
}
