import { useEffect, useState } from 'react'
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  ADMIN_TEXTAREA_CLASS,
  DashboardAlert,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { getAdminSiteSettings, updateSiteSettings } from '../../services/cms/settings'

export function AdminGlobalSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    site_name: '',
    tagline: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    favicon_url: '',
    footer_text: '',
    footer_cta_label: '',
    footer_cta_href: '',
    footer_program_links: '',
    seo_default_title: '',
    seo_default_description: '',
    analytics_ga: '',
  })

  useEffect(() => {
    ;(async () => {
      try {
        const row = await getAdminSiteSettings('global.v1')
        const v = row?.value || {}
        setForm({
          site_name: v.site_name || '',
          tagline: v.tagline || '',
          contact_email: v.contact_email || '',
          contact_phone: v.contact_phone || '',
          logo_url: v.logo_url || '',
          favicon_url: v.favicon_url || '',
          footer_text: v.footer?.copyright || v.footer_text || '',
          footer_cta_label: v.footer?.cta_label || '',
          footer_cta_href: v.footer?.cta_href || '',
          footer_program_links: (v.footer?.program_links || [])
            .map((p) => `${p.label}|${p.href}`)
            .join('\n'),
          seo_default_title: v.seo?.default_title || '',
          seo_default_description: v.seo?.default_description || '',
          analytics_ga: v.analytics?.ga_id || '',
        })
      } catch (err) {
        setError(err?.message || 'Unable to load settings.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      await updateSiteSettings('global.v1', {
        site_name: form.site_name,
        tagline: form.tagline,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        logo_url: form.logo_url,
        favicon_url: form.favicon_url,
        footer: {
          copyright: form.footer_text,
          cta_label: form.footer_cta_label,
          cta_href: form.footer_cta_href,
          program_links: String(form.footer_program_links || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [label, href] = line.split('|').map((s) => s.trim())
              return { label: label || line, href: href || '/programs' }
            }),
        },
        seo: { default_title: form.seo_default_title, default_description: form.seo_default_description },
        analytics: { ga_id: form.analytics_ga },
        social: {},
      })
      setNotice('Site settings saved.')
    } catch (err) {
      setError(err?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardSkeleton className="h-48" />

  const field = (key, label, multiline = false) => (
    <div key={key}>
      <label className={ADMIN_FIELD_LABEL}>{label}</label>
      {multiline ? (
        <textarea
          className={`${ADMIN_TEXTAREA_CLASS} mt-1`}
          rows={3}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      ) : (
        <input
          className={`${ADMIN_INPUT_CLASS} mt-1`}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      )}
    </div>
  )

  return (
    <DashboardPage>
      <DashboardPageIntro label="Settings" title="Global site settings" description="Branding, contact, SEO defaults, and analytics." />
      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />
      <DashboardPanel>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('site_name', 'Site name')}
          {field('tagline', 'Tagline')}
          {field('contact_email', 'Contact email')}
          {field('contact_phone', 'Contact phone')}
          {field('logo_url', 'Logo URL')}
          {field('favicon_url', 'Favicon URL')}
          {field('footer_text', 'Footer copyright')}
          {field('footer_cta_label', 'Footer CTA label')}
          {field('footer_cta_href', 'Footer CTA link')}
          {field(
            'footer_program_links',
            'Footer program links (one per line: Label|/href)',
            true,
          )}
          {field('seo_default_title', 'Default SEO title')}
          {field('seo_default_description', 'Default SEO description', true)}
          {field('analytics_ga', 'Google Analytics ID')}
        </div>
        <button type="button" disabled={saving} className={`mt-6 ${ADMIN_BTN_PRIMARY}`} onClick={save}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </DashboardPanel>
    </DashboardPage>
  )
}
