/** CMS domain types (Phase F — expand as modules migrate to TypeScript). */

export type PageLayoutMode = 'hybrid' | 'blocks_only' | 'legacy'

export type PageStatus = 'draft' | 'published'

export interface CmsPage {
  id: string
  slug: string
  title: string
  status: PageStatus
  sort_order: number
  layout_mode?: PageLayoutMode
  featured_image_url?: string | null
  seo_title?: string | null
  seo_description?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image_url?: string | null
  canonical_url?: string | null
  robots?: string
}

export interface PageBlock {
  id: string
  block_type: string
  content: Record<string, unknown>
  sort_order: number
  enabled?: boolean
}

export interface PublicPagePayload {
  page: CmsPage
  blocks: PageBlock[]
}

export interface SiteSettingsSeo {
  default_title?: string
  default_description?: string
}

export interface SiteSettingsFooter {
  copyright?: string
  program_links?: Array<{ label: string; href: string }>
  cta_label?: string
  cta_href?: string
}

export interface SiteSettingsValue {
  site_name?: string
  tagline?: string
  contact_email?: string
  contact_phone?: string
  logo_url?: string
  favicon_url?: string
  social?: Record<string, string>
  footer?: SiteSettingsFooter
  seo?: SiteSettingsSeo
  analytics?: { ga_id?: string; gtm_id?: string }
}

export interface NavigationItem {
  id?: string
  label: string
  href: string
  external?: boolean
  sort_order?: number
  enabled?: boolean
  parent_id?: string | null
}
