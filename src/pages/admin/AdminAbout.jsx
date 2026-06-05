import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { FounderEditor, TeamEditor } from '../../components/admin/AboutPeopleEditor'
import { ImageUrlField } from '../../components/admin/ImageUrlField'
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
import {
  ABOUT_PAGE_CONTENT_KEY,
  mergeAboutPageContent,
} from '../../config/aboutContentDefaults'
import {
  ABOUT_FOUNDER_KEY,
  ABOUT_TEAM_KEY,
  DEFAULT_ABOUT_FOUNDER,
  DEFAULT_ABOUT_TEAM,
} from '../../config/peopleContentDefaults'
import { useAuth } from '../../hooks/useAuth'
import { canEditContent } from '../../lib/rbac'
import { extractSiteContentValue, getSiteContent, upsertSiteContent } from '../../services/siteContent'
import { mergeSiteContentDefaults } from '../../utils/mergeSiteContent'

const TABS = [
  { id: 'mission', label: 'Mission & Vision' },
  { id: 'values', label: 'Core values' },
  { id: 'why-join', label: 'Why join us' },
  { id: 'social', label: 'Social & CTAs' },
  { id: 'founder', label: 'Founder' },
  { id: 'team', label: 'Team' },
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

export function AdminAboutPage() {
  const { profile } = useAuth()
  const canEdit = canEditContent(profile?.role)
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'mission'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [content, setContent] = useState(() => mergeAboutPageContent(null))
  const [founder, setFounder] = useState({ ...DEFAULT_ABOUT_FOUNDER })
  const [team, setTeam] = useState({ ...DEFAULT_ABOUT_TEAM })

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const [pageRow, founderRow, teamRow] = await Promise.all([
          getSiteContent(ABOUT_PAGE_CONTENT_KEY),
          getSiteContent(ABOUT_FOUNDER_KEY),
          getSiteContent(ABOUT_TEAM_KEY),
        ])
        if (!alive) return
        setContent(mergeAboutPageContent(extractSiteContentValue(pageRow)))
        setFounder(mergeSiteContentDefaults(DEFAULT_ABOUT_FOUNDER, extractSiteContentValue(founderRow)))
        setTeam(mergeSiteContentDefaults(DEFAULT_ABOUT_TEAM, extractSiteContentValue(teamRow)))
      } catch (err) {
        if (alive) setError(err?.message || 'Unable to load About page content.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
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
      setError(err?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardSkeleton className="h-64" />

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="About page"
        title="Mission, people & social"
        description="Edit vision, mission, team bios, founder profile, images, and social links shown on /about."
        actions={
          <a href="/about" target="_blank" rel="noreferrer" className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-orange-400 dark:border-zinc-600 dark:text-zinc-200">
            View About
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

      <DashboardPanel className="mt-6">
        {tab === 'mission' ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              save(ABOUT_PAGE_CONTENT_KEY, content, 'Mission & vision')
            }}
          >
            <Field label="Vision title">
              <input className={ADMIN_INPUT_CLASS} value={content.vision.title} disabled={!canEdit} onChange={(e) => setContent((v) => ({ ...v, vision: { ...v.vision, title: e.target.value } }))} />
            </Field>
            <Field label="Vision body" hint="Blank line = new paragraph">
              <textarea className={ADMIN_TEXTAREA_CLASS} rows={5} value={content.vision.body} disabled={!canEdit} onChange={(e) => setContent((v) => ({ ...v, vision: { ...v.vision, body: e.target.value } }))} />
            </Field>
            <Field label="Mission title">
              <input className={ADMIN_INPUT_CLASS} value={content.mission.title} disabled={!canEdit} onChange={(e) => setContent((v) => ({ ...v, mission: { ...v.mission, title: e.target.value } }))} />
            </Field>
            <Field label="Mission body" hint="Blank line = new paragraph">
              <textarea className={ADMIN_TEXTAREA_CLASS} rows={4} value={content.mission.body} disabled={!canEdit} onChange={(e) => setContent((v) => ({ ...v, mission: { ...v.mission, body: e.target.value } }))} />
            </Field>
            {canEdit ? (
              <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? 'Saving…' : 'Save mission & vision'}
              </button>
            ) : null}
          </form>
        ) : null}

        {tab === 'values' ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              save(ABOUT_PAGE_CONTENT_KEY, content, 'Core values')
            }}
          >
            <Field label="Eyebrow">
              <input className={ADMIN_INPUT_CLASS} value={content.fire_values.eyebrow} disabled={!canEdit} onChange={(e) => setContent((v) => ({ ...v, fire_values: { ...v.fire_values, eyebrow: e.target.value } }))} />
            </Field>
            <Field label="Section title">
              <input className={ADMIN_INPUT_CLASS} value={content.fire_values.title} disabled={!canEdit} onChange={(e) => setContent((v) => ({ ...v, fire_values: { ...v.fire_values, title: e.target.value } }))} />
            </Field>
            <Field label="Intro">
              <textarea className={ADMIN_TEXTAREA_CLASS} rows={2} value={content.fire_values.description} disabled={!canEdit} onChange={(e) => setContent((v) => ({ ...v, fire_values: { ...v.fire_values, description: e.target.value } }))} />
            </Field>
            {(content.fire_values.items || []).map((item, i) => (
              <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="text-xs font-semibold uppercase text-zinc-500">Value {i + 1}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-[4rem_1fr]">
                  <input className={ADMIN_INPUT_CLASS} placeholder="Letter" value={item.letter || ''} disabled={!canEdit} onChange={(e) => {
                    const items = [...content.fire_values.items]
                    items[i] = { ...items[i], letter: e.target.value }
                    setContent((v) => ({ ...v, fire_values: { ...v.fire_values, items } }))
                  }} />
                  <input className={ADMIN_INPUT_CLASS} placeholder="Title" value={item.title || ''} disabled={!canEdit} onChange={(e) => {
                    const items = [...content.fire_values.items]
                    items[i] = { ...items[i], title: e.target.value }
                    setContent((v) => ({ ...v, fire_values: { ...v.fire_values, items } }))
                  }} />
                </div>
                <textarea className={`${ADMIN_TEXTAREA_CLASS} mt-2`} rows={2} placeholder="Description" value={item.description || ''} disabled={!canEdit} onChange={(e) => {
                  const items = [...content.fire_values.items]
                  items[i] = { ...items[i], description: e.target.value }
                  setContent((v) => ({ ...v, fire_values: { ...v.fire_values, items } }))
                }} />
              </div>
            ))}
            {canEdit ? (
              <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? 'Saving…' : 'Save core values'}
              </button>
            ) : null}
          </form>
        ) : null}

        {tab === 'why-join' ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              save(ABOUT_PAGE_CONTENT_KEY, content, 'Why join section')
            }}
          >
            <Field label="Eyebrow">
              <input className={ADMIN_INPUT_CLASS} value={content.why_join.eyebrow} disabled={!canEdit} onChange={(e) => setContent((v) => ({ ...v, why_join: { ...v.why_join, eyebrow: e.target.value } }))} />
            </Field>
            <Field label="Section title">
              <input className={ADMIN_INPUT_CLASS} value={content.why_join.title} disabled={!canEdit} onChange={(e) => setContent((v) => ({ ...v, why_join: { ...v.why_join, title: e.target.value } }))} />
            </Field>
            <ImageUrlField label="Side image" value={content.why_join.image} disabled={!canEdit} uploadFolder="cms" onChange={(url) => setContent((v) => ({ ...v, why_join: { ...v.why_join, image: url } }))} />
            <Field label="Benefits (one per line)">
              <textarea
                className={ADMIN_TEXTAREA_CLASS}
                rows={8}
                value={(content.why_join.benefits || []).join('\n')}
                disabled={!canEdit}
                onChange={(e) =>
                  setContent((v) => ({
                    ...v,
                    why_join: {
                      ...v.why_join,
                      benefits: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                    },
                  }))
                }
              />
            </Field>
            {canEdit ? (
              <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? 'Saving…' : 'Save why join section'}
              </button>
            ) : null}
          </form>
        ) : null}

        {tab === 'social' ? (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              save(ABOUT_PAGE_CONTENT_KEY, content, 'Social links & CTAs')
            }}
          >
            <div>
              <p className={ADMIN_FIELD_LABEL}>Social links</p>
              {(content.social_links || []).map((link, i) => (
                <div key={i} className="mb-2 flex flex-wrap items-center gap-2">
                  <input className={`${ADMIN_INPUT_CLASS} min-w-[120px] flex-1`} placeholder="Label" value={link.label || ''} disabled={!canEdit} onChange={(e) => {
                    const social_links = [...content.social_links]
                    social_links[i] = { ...social_links[i], label: e.target.value }
                    setContent((v) => ({ ...v, social_links }))
                  }} />
                  <input className={`${ADMIN_INPUT_CLASS} min-w-[200px] flex-[2]`} placeholder="https://…" value={link.href || ''} disabled={!canEdit} onChange={(e) => {
                    const social_links = [...content.social_links]
                    social_links[i] = { ...social_links[i], href: e.target.value }
                    setContent((v) => ({ ...v, social_links }))
                  }} />
                  <label className="flex items-center gap-1 text-xs text-zinc-600">
                    <input type="checkbox" checked={Boolean(link.primary)} disabled={!canEdit} onChange={(e) => {
                      const social_links = [...content.social_links]
                      social_links[i] = { ...social_links[i], primary: e.target.checked }
                      setContent((v) => ({ ...v, social_links }))
                    }} />
                    Primary
                  </label>
                  {canEdit ? (
                    <button type="button" className="text-xs text-rose-600" onClick={() => setContent((v) => ({ ...v, social_links: v.social_links.filter((_, j) => j !== i) }))}>
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
              {canEdit ? (
                <button type="button" className="text-sm text-zinc-600" onClick={() => setContent((v) => ({ ...v, social_links: [...(v.social_links || []), { label: '', href: '' }] }))}>
                  + Add social link
                </button>
              ) : null}
            </div>

            <div>
              <p className={ADMIN_FIELD_LABEL}>Page buttons</p>
              {(content.cta_buttons || []).map((btn, i) => (
                <div key={i} className="mb-2 flex flex-wrap items-center gap-2">
                  <input className={`${ADMIN_INPUT_CLASS} flex-1`} placeholder="Label" value={btn.label || ''} disabled={!canEdit} onChange={(e) => {
                    const cta_buttons = [...content.cta_buttons]
                    cta_buttons[i] = { ...cta_buttons[i], label: e.target.value }
                    setContent((v) => ({ ...v, cta_buttons }))
                  }} />
                  <input className={`${ADMIN_INPUT_CLASS} flex-1`} placeholder="/programs" value={btn.href || ''} disabled={!canEdit} onChange={(e) => {
                    const cta_buttons = [...content.cta_buttons]
                    cta_buttons[i] = { ...cta_buttons[i], href: e.target.value }
                    setContent((v) => ({ ...v, cta_buttons }))
                  }} />
                  <label className="flex items-center gap-1 text-xs text-zinc-600">
                    <input type="checkbox" checked={Boolean(btn.primary)} disabled={!canEdit} onChange={(e) => {
                      const cta_buttons = [...content.cta_buttons]
                      cta_buttons[i] = { ...cta_buttons[i], primary: e.target.checked }
                      setContent((v) => ({ ...v, cta_buttons }))
                    }} />
                    Primary
                  </label>
                </div>
              ))}
            </div>

            <Field label="Marquee ticker (one item per line)">
              <textarea
                className={ADMIN_TEXTAREA_CLASS}
                rows={4}
                value={(content.marquee_items || []).join('\n')}
                disabled={!canEdit}
                onChange={(e) =>
                  setContent((v) => ({
                    ...v,
                    marquee_items: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                  }))
                }
              />
            </Field>

            {canEdit ? (
              <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? 'Saving…' : 'Save social & CTAs'}
              </button>
            ) : null}
          </form>
        ) : null}

        {tab === 'founder' ? (
          <FounderEditor founder={founder} setFounder={setFounder} canEdit={canEdit} saving={saving} onSave={() => save(ABOUT_FOUNDER_KEY, founder, 'Founder profile')} />
        ) : null}

        {tab === 'team' ? (
          <TeamEditor team={team} setTeam={setTeam} canEdit={canEdit} saving={saving} onSave={() => save(ABOUT_TEAM_KEY, team, 'Team section')} />
        ) : null}
      </DashboardPanel>
    </DashboardPage>
  )
}
