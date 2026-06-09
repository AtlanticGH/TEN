import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { TorchbearerEditor } from '../../components/admin/AboutPeopleEditor'
import { HomePageSectionsEditor } from '../../components/admin/HomePageSectionsEditor'
import { ImageUrlField } from '../../components/admin/ImageUrlField'
import { VideoUrlField } from '../../components/admin/VideoUrlField'
import { HomeLegacyHero } from '../../components/home/HomeLegacyHero'
import { TorchbearerSection } from '../../components/marketing/TorchbearerSection'
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
import {
  DEFAULT_HOME_PAGE_CONTENT,
  HOME_PAGE_CONTENT_KEY,
  mergeHomePageContent,
} from '../../config/homePageContentDefaults'
import { DEFAULT_HOME_TORCHBEARER, HOME_TORCHBEARER_KEY } from '../../config/peopleContentDefaults'
import { DEFAULT_HOME_HERO, EMPTY_HOME_HERO, HOME_HERO_KEY } from '../../config/siteContentDefaults'
import { useAuth } from '../../hooks/useAuth'
import { canEditContent } from '../../lib/rbac'
import { extractSiteContentValue, getSiteContent, upsertSiteContent } from '../../services/siteContent'
import { mergeSiteContentDefaults } from '../../utils/mergeSiteContent'

const TABS = [
  { id: 'hero', label: 'Homepage hero' },
  { id: 'sections', label: 'Page sections' },
  { id: 'torchbearer', label: 'Meet the Torchbearer' },
]

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
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'hero'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [hero, setHero] = useState(EMPTY_HOME_HERO)
  const [pageSections, setPageSections] = useState(() => mergeHomePageContent(DEFAULT_HOME_PAGE_CONTENT, null))
  const [torchbearer, setTorchbearer] = useState({ ...DEFAULT_HOME_TORCHBEARER })

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError('')
      setNotice('')
      try {
        const [heroRow, sectionsRow, torchRow] = await Promise.all([
          getSiteContent(HOME_HERO_KEY),
          getSiteContent(HOME_PAGE_CONTENT_KEY),
          getSiteContent(HOME_TORCHBEARER_KEY),
        ])
        if (!alive) return
        const heroCms = extractSiteContentValue(heroRow)
        setHero(heroCms ? mergeSiteContentDefaults(DEFAULT_HOME_HERO, heroCms) : { ...DEFAULT_HOME_HERO })
        setPageSections(mergeHomePageContent(DEFAULT_HOME_PAGE_CONTENT, extractSiteContentValue(sectionsRow)))
        setTorchbearer(mergeSiteContentDefaults(DEFAULT_HOME_TORCHBEARER, extractSiteContentValue(torchRow)))
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load homepage content.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [])

  const save = async (key, value, label) => {
    if (!canEdit) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await upsertSiteContent({ key, value })
      await queryClient.invalidateQueries({ queryKey: ['site-content', key] })
      setNotice(`${label} saved.`)
    } catch (err) {
      setError(err?.message || 'Unable to save.')
    } finally {
      setSaving(false)
    }
  }

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
        label="Homepage"
        title="Homepage content"
        description="Edit the homepage hero, below-the-fold sections, and the Meet the Torchbearer leadership block."
        actions={
          <a href="/" target="_blank" rel="noreferrer" className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-orange-400 dark:border-zinc-600 dark:text-zinc-200">
            View homepage
          </a>
        }
      />

      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
            onClick={() => setSearchParams({ tab: t.id })}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hero' ? (
        <DashboardSplit className="mt-6 lg:grid-cols-[1fr_0.95fr]">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              save(HOME_HERO_KEY, hero, 'Homepage hero')
            }}
          >
            <Field label="Home hero badge">
              <input value={hero.badge} disabled={!canEdit} onChange={(e) => setHero((v) => ({ ...v, badge: e.target.value }))} className={ADMIN_INPUT_CLASS} />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Headline (before emphasis)">
                <textarea value={hero.headline_before} disabled={!canEdit} onChange={(e) => setHero((v) => ({ ...v, headline_before: e.target.value }))} className={ADMIN_TEXTAREA_CLASS} rows={2} placeholder="One line per row" />
              </Field>
              <Field label="Headline (emphasis)">
                <textarea value={hero.headline_emphasis} disabled={!canEdit} onChange={(e) => setHero((v) => ({ ...v, headline_emphasis: e.target.value }))} className={ADMIN_TEXTAREA_CLASS} rows={2} placeholder="One line per row" />
              </Field>
            </div>

            <Field label="Description">
              <textarea value={hero.description} disabled={!canEdit} onChange={(e) => setHero((v) => ({ ...v, description: e.target.value }))} className={ADMIN_TEXTAREA_CLASS} rows={4} />
            </Field>

            <ImageUrlField label="Background image" value={hero.background_image} disabled={!canEdit} uploadFolder="cms" onChange={(url) => setHero((v) => ({ ...v, background_image: url }))} />
            <p className="text-xs text-zinc-500">Poster and fallback when no video is set. Prefer 1600–2400px wide.</p>

            <VideoUrlField label="Background video (optional)" value={hero.background_video || ''} disabled={!canEdit} uploadFolder="cms" onChange={(url) => setHero((v) => ({ ...v, background_video: url }))} />
            <p className="text-xs text-zinc-500">Plays muted and looping over the image poster.</p>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Primary CTA label">
                <input value={hero.cta_primary_label} disabled={!canEdit} onChange={(e) => setHero((v) => ({ ...v, cta_primary_label: e.target.value }))} className={ADMIN_INPUT_CLASS} />
              </Field>
              <Field label="Primary CTA link">
                <input value={hero.cta_primary_href} disabled={!canEdit} onChange={(e) => setHero((v) => ({ ...v, cta_primary_href: e.target.value }))} className={ADMIN_INPUT_CLASS} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Secondary CTA label">
                <input value={hero.cta_secondary_label} disabled={!canEdit} onChange={(e) => setHero((v) => ({ ...v, cta_secondary_label: e.target.value }))} className={ADMIN_INPUT_CLASS} />
              </Field>
              <Field label="Secondary CTA link">
                <input value={hero.cta_secondary_href} disabled={!canEdit} onChange={(e) => setHero((v) => ({ ...v, cta_secondary_href: e.target.value }))} className={ADMIN_INPUT_CLASS} />
              </Field>
            </div>

            {canEdit ? (
              <button type="submit" disabled={saving} className={`w-full ${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? 'Saving…' : 'Save homepage hero'}
              </button>
            ) : null}
          </form>

          <DashboardPanel className="lg:sticky lg:top-24 lg:self-start">
            <p className={ADMIN_FIELD_LABEL}>Preview</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <HomeLegacyHero heroCopy={hero} preview />
            </div>
          </DashboardPanel>
        </DashboardSplit>
      ) : null}

      {tab === 'sections' ? (
        <div className="mt-6">
          <HomePageSectionsEditor
            content={pageSections}
            onChange={setPageSections}
            canEdit={canEdit}
            saving={saving}
            onSave={() => save(HOME_PAGE_CONTENT_KEY, pageSections, 'Page sections')}
          />
        </div>
      ) : null}

      {tab === 'torchbearer' ? (
        <DashboardSplit className="mt-6 lg:grid-cols-[1fr_0.95fr]">
          <DashboardPanel>
            <TorchbearerEditor
              torchbearer={torchbearer}
              setTorchbearer={setTorchbearer}
              canEdit={canEdit}
              saving={saving}
              onSave={() => save(HOME_TORCHBEARER_KEY, torchbearer, 'Torchbearer section')}
            />
          </DashboardPanel>
          <DashboardPanel className="lg:sticky lg:top-24 lg:self-start">
            <p className={ADMIN_FIELD_LABEL}>Preview</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <TorchbearerSection content={torchbearer} embedded />
            </div>
          </DashboardPanel>
        </DashboardSplit>
      ) : null}
    </DashboardPage>
  )
}
