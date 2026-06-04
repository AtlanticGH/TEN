import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ImageUrlField } from '../../components/admin/ImageUrlField'
import { SocialLinksEditor } from '../../components/admin/SocialLinksEditor'
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
  ABOUT_FOUNDER_KEY,
  ABOUT_TEAM_KEY,
  DEFAULT_ABOUT_FOUNDER,
  DEFAULT_ABOUT_TEAM,
  DEFAULT_HOME_TORCHBEARER,
  HOME_TORCHBEARER_KEY,
} from '../../config/peopleContentDefaults'
import { useAuth } from '../../hooks/useAuth'
import { canEditContent } from '../../lib/rbac'
import { extractSiteContentValue, getSiteContent, upsertSiteContent } from '../../services/siteContent'
import { mergeSiteContentDefaults } from '../../utils/mergeSiteContent'

const TABS = [
  { id: 'founder', label: 'Meet Our Founder (About)' },
  { id: 'team', label: 'Meet The Team (About)' },
  { id: 'torchbearer', label: 'Meet the Torchbearer (Home)' },
]

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={ADMIN_FIELD_LABEL}>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

export function AdminPeoplePage() {
  const { profile } = useAuth()
  const canEdit = canEditContent(profile?.role)
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('founder')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [founder, setFounder] = useState({ ...DEFAULT_ABOUT_FOUNDER })
  const [team, setTeam] = useState({ ...DEFAULT_ABOUT_TEAM })
  const [torchbearer, setTorchbearer] = useState({ ...DEFAULT_HOME_TORCHBEARER })

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const [fRow, tRow, hRow] = await Promise.all([
          getSiteContent(ABOUT_FOUNDER_KEY),
          getSiteContent(ABOUT_TEAM_KEY),
          getSiteContent(HOME_TORCHBEARER_KEY),
        ])
        if (!alive) return
        setFounder(mergeSiteContentDefaults(DEFAULT_ABOUT_FOUNDER, extractSiteContentValue(fRow)))
        setTeam(mergeSiteContentDefaults(DEFAULT_ABOUT_TEAM, extractSiteContentValue(tRow)))
        setTorchbearer(mergeSiteContentDefaults(DEFAULT_HOME_TORCHBEARER, extractSiteContentValue(hRow)))
      } catch (err) {
        if (alive) setError(err?.message || 'Unable to load people content.')
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
        label="People"
        title="Founder, team & torchbearer"
        description="Edit profile images, bios, stats, and social links for the About page and homepage torchbearer section."
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
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DashboardPanel className="mt-6">
        {tab === 'founder' ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              save(ABOUT_FOUNDER_KEY, founder, 'Founder profile')
            }}
          >
            <Field label="Eyebrow">
              <input className={ADMIN_INPUT_CLASS} value={founder.eyebrow} disabled={!canEdit} onChange={(e) => setFounder((v) => ({ ...v, eyebrow: e.target.value }))} />
            </Field>
            <Field label="Name">
              <input className={ADMIN_INPUT_CLASS} value={founder.title} disabled={!canEdit} onChange={(e) => setFounder((v) => ({ ...v, title: e.target.value }))} />
            </Field>
            <Field label="Role / subtitle">
              <input className={ADMIN_INPUT_CLASS} value={founder.subtitle} disabled={!canEdit} onChange={(e) => setFounder((v) => ({ ...v, subtitle: e.target.value }))} />
            </Field>
            <ImageUrlField label="Portrait image" value={founder.image} disabled={!canEdit} uploadFolder="cms" onChange={(url) => setFounder((v) => ({ ...v, image: url }))} />
            <ImageUrlField label="Fallback image" value={founder.image_fallback} disabled={!canEdit} uploadFolder="cms" onChange={(url) => setFounder((v) => ({ ...v, image_fallback: url }))} />
            <Field label="Bio (blank line = new paragraph)">
              <textarea className={ADMIN_TEXTAREA_CLASS} rows={10} value={founder.body} disabled={!canEdit} onChange={(e) => setFounder((v) => ({ ...v, body: e.target.value }))} />
            </Field>
            <SocialLinksEditor links={founder.social_links} disabled={!canEdit} onChange={(social_links) => setFounder((v) => ({ ...v, social_links }))} />
            {canEdit ? (
              <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? 'Saving…' : 'Save founder section'}
              </button>
            ) : null}
          </form>
        ) : null}

        {tab === 'team' ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              save(ABOUT_TEAM_KEY, team, 'Team section')
            }}
          >
            <Field label="Eyebrow">
              <input className={ADMIN_INPUT_CLASS} value={team.eyebrow} disabled={!canEdit} onChange={(e) => setTeam((v) => ({ ...v, eyebrow: e.target.value }))} />
            </Field>
            <Field label="Section title">
              <input className={ADMIN_INPUT_CLASS} value={team.title} disabled={!canEdit} onChange={(e) => setTeam((v) => ({ ...v, title: e.target.value }))} />
            </Field>
            {(team.items || []).map((member, i) => (
              <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="text-xs font-semibold uppercase text-zinc-500">Member {i + 1}</p>
                <input
                  className={`${ADMIN_INPUT_CLASS} mt-2`}
                  placeholder="Title / role"
                  value={member.title || ''}
                  disabled={!canEdit}
                  onChange={(e) => {
                    const items = [...team.items]
                    items[i] = { ...items[i], title: e.target.value }
                    setTeam((v) => ({ ...v, items }))
                  }}
                />
                <textarea
                  className={`${ADMIN_TEXTAREA_CLASS} mt-2`}
                  rows={2}
                  placeholder="Description"
                  value={member.description || ''}
                  disabled={!canEdit}
                  onChange={(e) => {
                    const items = [...team.items]
                    items[i] = { ...items[i], description: e.target.value }
                    setTeam((v) => ({ ...v, items }))
                  }}
                />
                <div className="mt-2">
                  <ImageUrlField
                    label="Photo"
                    value={member.image || ''}
                    disabled={!canEdit}
                    uploadFolder="cms"
                    onChange={(url) => {
                      const items = [...team.items]
                      items[i] = { ...items[i], image: url }
                      setTeam((v) => ({ ...v, items }))
                    }}
                  />
                </div>
                <ImageUrlField
                  label="Fallback photo"
                  value={member.image_fallback || ''}
                  disabled={!canEdit}
                  uploadFolder="cms"
                  onChange={(url) => {
                    const items = [...team.items]
                    items[i] = { ...items[i], image_fallback: url }
                    setTeam((v) => ({ ...v, items }))
                  }}
                />
                <div className="mt-3">
                  <SocialLinksEditor
                    links={member.social_links || []}
                    disabled={!canEdit}
                    onChange={(social_links) => {
                      const items = [...team.items]
                      items[i] = { ...items[i], social_links }
                      setTeam((v) => ({ ...v, items }))
                    }}
                  />
                </div>
                {canEdit ? (
                  <button
                    type="button"
                    className="mt-2 text-xs text-rose-600"
                    onClick={() => setTeam((v) => ({ ...v, items: v.items.filter((_, j) => j !== i) }))}
                  >
                    Remove member
                  </button>
                ) : null}
              </div>
            ))}
            {canEdit ? (
              <button
                type="button"
                className="text-sm font-medium text-zinc-600"
                onClick={() =>
                  setTeam((v) => ({
                    ...v,
                    items: [...(v.items || []), { title: '', description: '', image: '', image_fallback: '', social_links: [] }],
                  }))
                }
              >
                + Add team member
              </button>
            ) : null}
            {canEdit ? (
              <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? 'Saving…' : 'Save team section'}
              </button>
            ) : null}
          </form>
        ) : null}

        {tab === 'torchbearer' ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              save(HOME_TORCHBEARER_KEY, torchbearer, 'Torchbearer section')
            }}
          >
            <Field label="Eyebrow">
              <input className={ADMIN_INPUT_CLASS} value={torchbearer.eyebrow} disabled={!canEdit} onChange={(e) => setTorchbearer((v) => ({ ...v, eyebrow: e.target.value }))} />
            </Field>
            <Field label="Heading">
              <input className={ADMIN_INPUT_CLASS} value={torchbearer.title} disabled={!canEdit} onChange={(e) => setTorchbearer((v) => ({ ...v, title: e.target.value }))} />
            </Field>
            <Field label="Name">
              <input className={ADMIN_INPUT_CLASS} value={torchbearer.name} disabled={!canEdit} onChange={(e) => setTorchbearer((v) => ({ ...v, name: e.target.value }))} />
            </Field>
            <Field label="Tagline">
              <input className={ADMIN_INPUT_CLASS} value={torchbearer.tagline} disabled={!canEdit} onChange={(e) => setTorchbearer((v) => ({ ...v, tagline: e.target.value }))} />
            </Field>
            <Field label="Subtitle">
              <input className={ADMIN_INPUT_CLASS} value={torchbearer.subtitle} disabled={!canEdit} onChange={(e) => setTorchbearer((v) => ({ ...v, subtitle: e.target.value }))} />
            </Field>
            <ImageUrlField label="Portrait image" value={torchbearer.image} disabled={!canEdit} uploadFolder="cms" onChange={(url) => setTorchbearer((v) => ({ ...v, image: url }))} />
            <ImageUrlField label="Fallback image" value={torchbearer.image_fallback} disabled={!canEdit} uploadFolder="cms" onChange={(url) => setTorchbearer((v) => ({ ...v, image_fallback: url }))} />
            <p className={ADMIN_FIELD_LABEL}>Stats</p>
            {(torchbearer.stats || []).map((stat, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <input
                  className={ADMIN_INPUT_CLASS}
                  placeholder="Value"
                  value={stat.value || ''}
                  disabled={!canEdit}
                  onChange={(e) => {
                    const stats = [...torchbearer.stats]
                    stats[i] = { ...stats[i], value: e.target.value }
                    setTorchbearer((v) => ({ ...v, stats }))
                  }}
                />
                <input
                  className={ADMIN_INPUT_CLASS}
                  placeholder="Label"
                  value={stat.label || ''}
                  disabled={!canEdit}
                  onChange={(e) => {
                    const stats = [...torchbearer.stats]
                    stats[i] = { ...stats[i], label: e.target.value }
                    setTorchbearer((v) => ({ ...v, stats }))
                  }}
                />
              </div>
            ))}
            {canEdit ? (
              <button
                type="button"
                className="text-sm text-zinc-600"
                onClick={() => setTorchbearer((v) => ({ ...v, stats: [...(v.stats || []), { value: '', label: '' }] }))}
              >
                + Add stat
              </button>
            ) : null}
            <SocialLinksEditor
              links={torchbearer.social_links}
              disabled={!canEdit}
              onChange={(social_links) => setTorchbearer((v) => ({ ...v, social_links }))}
            />
            {canEdit ? (
              <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? 'Saving…' : 'Save torchbearer section'}
              </button>
            ) : null}
          </form>
        ) : null}
      </DashboardPanel>
    </DashboardPage>
  )
}
