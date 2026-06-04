import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ImageUrlField } from '../../components/admin/ImageUrlField'
import { VideoUrlField } from '../../components/admin/VideoUrlField'
import { HomeLegacyHero } from '../../components/home/HomeLegacyHero'
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
  DashboardSplit,
} from '../../components/dashboard/DashboardChrome'
import { DEFAULT_HOME_HERO, EMPTY_HOME_HERO, HOME_HERO_KEY } from '../../config/siteContentDefaults'
import { useAuth } from '../../hooks/useAuth'
import { canEditContent } from '../../lib/rbac'
import { extractSiteContentValue, getSiteContent, upsertSiteContent } from '../../services/siteContent'
import { mergeSiteContentDefaults } from '../../utils/mergeSiteContent'

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className={ADMIN_FIELD_LABEL}>{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
    </label>
  )
}

export function AdminContentPage() {
  const { profile } = useAuth()
  const canEdit = canEditContent(profile?.role)
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [value, setValue] = useState(EMPTY_HOME_HERO)

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError('')
      setNotice('')
      try {
        const row = await getSiteContent(HOME_HERO_KEY)
        if (!alive) return
        const cms = extractSiteContentValue(row)
        setValue(cms ? mergeSiteContentDefaults(DEFAULT_HOME_HERO, cms) : { ...DEFAULT_HOME_HERO })
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load site content.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [])

  if (loading) {
    return (
      <DashboardPage>
        <DashboardSkeleton className="h-8 w-48" />
        <DashboardSkeleton className="h-96" />
      </DashboardPage>
    )
  }

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Home hero"
        title="Homepage hero"
        description="Edit the homepage hero copy, background image, and optional background video."
      />

      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />

      <DashboardSplit className="lg:grid-cols-[1fr_0.95fr]">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!canEdit) return
            setSaving(true)
            setError('')
            setNotice('')
            try {
              await upsertSiteContent({ key: HOME_HERO_KEY, value })
              await queryClient.invalidateQueries({ queryKey: ['site-content', HOME_HERO_KEY] })
              setNotice('Saved.')
            } catch (err) {
              setError(err?.message || 'Unable to save.')
            } finally {
              setSaving(false)
            }
          }}
        >
          <Field label="Home hero badge">
            <input
              value={value.badge}
              disabled={!canEdit}
              onChange={(e) => setValue((v) => ({ ...v, badge: e.target.value }))}
              className={ADMIN_INPUT_CLASS}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Headline (before emphasis)">
              <input
                value={value.headline_before}
                disabled={!canEdit}
                onChange={(e) => setValue((v) => ({ ...v, headline_before: e.target.value }))}
                className={ADMIN_INPUT_CLASS}
              />
            </Field>
            <Field label="Headline (emphasis)">
              <input
                value={value.headline_emphasis}
                disabled={!canEdit}
                onChange={(e) => setValue((v) => ({ ...v, headline_emphasis: e.target.value }))}
                className={ADMIN_INPUT_CLASS}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={value.description}
              disabled={!canEdit}
              onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))}
              className={ADMIN_TEXTAREA_CLASS}
              rows={4}
            />
          </Field>

          <ImageUrlField
            label="Background image"
            value={value.background_image}
            disabled={!canEdit}
            uploadFolder="cms"
            onChange={(url) => setValue((v) => ({ ...v, background_image: url }))}
          />
          <p className="text-xs text-zinc-500">Poster and fallback when no video is set. Prefer 1600–2400px wide.</p>

          <VideoUrlField
            label="Background video (optional)"
            value={value.background_video || ''}
            disabled={!canEdit}
            uploadFolder="cms"
            onChange={(url) => setValue((v) => ({ ...v, background_video: url }))}
          />
          <p className="text-xs text-zinc-500">Plays muted and looping over the image poster. Upload in Media library or paste a URL.</p>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary CTA label">
              <input
                value={value.cta_primary_label}
                disabled={!canEdit}
                onChange={(e) => setValue((v) => ({ ...v, cta_primary_label: e.target.value }))}
                className={ADMIN_INPUT_CLASS}
              />
            </Field>
            <Field label="Primary CTA link">
              <input
                value={value.cta_primary_href}
                disabled={!canEdit}
                onChange={(e) => setValue((v) => ({ ...v, cta_primary_href: e.target.value }))}
                className={ADMIN_INPUT_CLASS}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Secondary CTA label">
              <input
                value={value.cta_secondary_label}
                disabled={!canEdit}
                onChange={(e) => setValue((v) => ({ ...v, cta_secondary_label: e.target.value }))}
                className={ADMIN_INPUT_CLASS}
              />
            </Field>
            <Field label="Secondary CTA link">
              <input
                value={value.cta_secondary_href}
                disabled={!canEdit}
                onChange={(e) => setValue((v) => ({ ...v, cta_secondary_href: e.target.value }))}
                className={ADMIN_INPUT_CLASS}
              />
            </Field>
          </div>

          {canEdit ? (
            <button type="submit" disabled={saving} className={`w-full ${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          ) : null}
        </form>

        <DashboardPanel className="lg:sticky lg:top-24 lg:self-start">
          <p className={ADMIN_FIELD_LABEL}>Preview</p>
          <p className="mt-1 text-xs text-zinc-500">Matches the live homepage hero.</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <HomeLegacyHero heroCopy={value} preview />
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-medium text-orange-600 hover:text-orange-500"
          >
            View homepage →
          </a>
        </DashboardPanel>
      </DashboardSplit>
    </DashboardPage>
  )
}
