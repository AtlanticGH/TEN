import { useEffect, useMemo } from 'react'
import { DEFAULT_DOCUMENT_TITLE, META_DESCRIPTION, PRODUCT_NAME, pageTitle } from '../../config/branding'
import { useSiteSettings } from '../../hooks/useSiteSettings'

function formatDocumentTitle(title, siteDefault) {
  if (!title) return siteDefault || DEFAULT_DOCUMENT_TITLE
  if (title.includes(PRODUCT_NAME)) return title
  return pageTitle(title)
}

/** Sets document title and meta description; merges with global site_settings SEO when fields are empty. */
export function PageMeta({ title, description, robots }) {
  const { settings } = useSiteSettings()
  const siteSeo = settings?.seo || {}

  const resolvedTitle = useMemo(
    () => formatDocumentTitle(title, siteSeo.default_title || settings?.site_name),
    [title, siteSeo.default_title, settings?.site_name],
  )

  const resolvedDescription = description || siteSeo.default_description || META_DESCRIPTION

  useEffect(() => {
    document.title = resolvedTitle
    if (resolvedDescription) {
      let el = document.querySelector('meta[name="description"]')
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', 'description')
        document.head.appendChild(el)
      }
      el.setAttribute('content', resolvedDescription)
    }
    if (robots) {
      let el = document.querySelector('meta[name="robots"]')
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', 'robots')
        document.head.appendChild(el)
      }
      el.setAttribute('content', robots)
    }
  }, [resolvedTitle, resolvedDescription, robots])

  return null
}
