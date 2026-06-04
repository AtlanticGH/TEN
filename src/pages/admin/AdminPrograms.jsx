import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ImageUrlField } from '../../components/admin/ImageUrlField'
import { VideoUrlField } from '../../components/admin/VideoUrlField'
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
  DEFAULT_PROGRAMS_PAGE_CONTENT,
  PROGRAMS_PAGE_CONTENT_KEY,
  PROGRAM_CARD_ICON_IDS,
  mergeProgramsPageContent,
} from '../../config/programsContentDefaults'
import { useAuth } from '../../hooks/useAuth'
import { canEditContent } from '../../lib/rbac'
import { extractSiteContentValue, getSiteContent, upsertSiteContent } from '../../services/siteContent'

const TABS = [
  { id: 'cards', label: 'Program cards' },
  { id: 'growth', label: 'Growth cycle' },
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

function SectionIntroFields({ section, disabled, onChange }) {
  return (
    <>
      <Field label="Eyebrow">
        <input
          className={ADMIN_INPUT_CLASS}
          value={section.eyebrow || ''}
          disabled={disabled}
          onChange={(e) => onChange({ ...section, eyebrow: e.target.value })}
        />
      </Field>
      <Field label="Section title">
        <input
          className={ADMIN_INPUT_CLASS}
          value={section.title || ''}
          disabled={disabled}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </Field>
      <Field label="Section description">
        <textarea
          className={ADMIN_TEXTAREA_CLASS}
          rows={3}
          value={section.body || ''}
          disabled={disabled}
          onChange={(e) => onChange({ ...section, body: e.target.value })}
        />
      </Field>
    </>
  )
}

export function AdminProgramsPage() {
  const { profile } = useAuth()
  const canEdit = canEditContent(profile?.role)
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('cards')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [value, setValue] = useState(() => structuredClone(DEFAULT_PROGRAMS_PAGE_CONTENT))

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const row = await getSiteContent(PROGRAMS_PAGE_CONTENT_KEY)
        if (!alive) return
        const cms = extractSiteContentValue(row)
        setValue(mergeProgramsPageContent(DEFAULT_PROGRAMS_PAGE_CONTENT, cms))
      } catch (err) {
        if (alive) setError(err?.message || 'Unable to load programs content.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const save = async (e) => {
    e.preventDefault()
    if (!canEdit) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await upsertSiteContent({ key: PROGRAMS_PAGE_CONTENT_KEY, value })
      await queryClient.invalidateQueries({ queryKey: ['site-content', PROGRAMS_PAGE_CONTENT_KEY] })
      setNotice('Programs page saved.')
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
        label="Programs"
        title="Program cards & growth cycle"
        description="Edit program card and growth-stage images, optional videos, and copy for the public /programs page. Page hero is edited under Page heroes."
        actions={
          <a
            href="/programs"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-orange-400 dark:border-zinc-600 dark:text-zinc-200"
          >
            View Programs
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

      <form onSubmit={save}>
        <DashboardPanel className="mt-6 space-y-6">
          {tab === 'cards' ? (
            <>
              <SectionIntroFields
                section={value.cards_section}
                disabled={!canEdit}
                onChange={(cards_section) => setValue((v) => ({ ...v, cards_section }))}
              />
              {(value.cards || []).map((card, i) => (
                <div key={card.id || i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                  <p className="text-xs font-semibold uppercase text-zinc-500">Program card {i + 1}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Field label="Icon">
                      <select
                        className={ADMIN_INPUT_CLASS}
                        value={card.icon || 'beaker'}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const cards = [...value.cards]
                          cards[i] = { ...cards[i], icon: e.target.value }
                          setValue((v) => ({ ...v, cards }))
                        }}
                      >
                        {PROGRAM_CARD_ICON_IDS.map((id) => (
                          <option key={id} value={id}>
                            {id}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Title">
                      <input
                        className={ADMIN_INPUT_CLASS}
                        value={card.title || ''}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const cards = [...value.cards]
                          cards[i] = { ...cards[i], title: e.target.value }
                          setValue((v) => ({ ...v, cards }))
                        }}
                      />
                    </Field>
                  </div>
                  <Field label="Tagline">
                    <input
                      className={ADMIN_INPUT_CLASS}
                      value={card.tagline || ''}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const cards = [...value.cards]
                        cards[i] = { ...cards[i], tagline: e.target.value }
                        setValue((v) => ({ ...v, cards }))
                      }}
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      className={ADMIN_TEXTAREA_CLASS}
                      rows={4}
                      value={card.description || ''}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const cards = [...value.cards]
                        cards[i] = { ...cards[i], description: e.target.value }
                        setValue((v) => ({ ...v, cards }))
                      }}
                    />
                  </Field>
                  <ImageUrlField
                    label="Cover image"
                    value={card.image || ''}
                    disabled={!canEdit}
                    uploadFolder="cms"
                    onChange={(url) => {
                      const cards = [...value.cards]
                      cards[i] = { ...cards[i], image: url }
                      setValue((v) => ({ ...v, cards }))
                    }}
                  />
                  <Field label="Image alt text">
                    <input
                      className={ADMIN_INPUT_CLASS}
                      value={card.image_alt || ''}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const cards = [...value.cards]
                        cards[i] = { ...cards[i], image_alt: e.target.value }
                        setValue((v) => ({ ...v, cards }))
                      }}
                    />
                  </Field>
                  <VideoUrlField
                    label="Video (optional)"
                    value={card.video || ''}
                    disabled={!canEdit}
                    uploadFolder="cms"
                    onChange={(url) => {
                      const cards = [...value.cards]
                      cards[i] = { ...cards[i], video: url }
                      setValue((v) => ({ ...v, cards }))
                    }}
                  />
                </div>
              ))}
            </>
          ) : null}

          {tab === 'growth' ? (
            <>
              <SectionIntroFields
                section={value.growth_section}
                disabled={!canEdit}
                onChange={(growth_section) => setValue((v) => ({ ...v, growth_section }))}
              />
              {(value.growth_stages || []).map((stage, i) => (
                <div key={stage.id || i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                  <p className="text-xs font-semibold uppercase text-zinc-500">Stage {stage.num || i + 1}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <Field label="Number">
                      <input
                        className={ADMIN_INPUT_CLASS}
                        value={stage.num || ''}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const growth_stages = [...value.growth_stages]
                          growth_stages[i] = { ...growth_stages[i], num: e.target.value }
                          setValue((v) => ({ ...v, growth_stages }))
                        }}
                      />
                    </Field>
                    <Field label="Stage label">
                      <input
                        className={ADMIN_INPUT_CLASS}
                        value={stage.stage || ''}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const growth_stages = [...value.growth_stages]
                          growth_stages[i] = { ...growth_stages[i], stage: e.target.value }
                          setValue((v) => ({ ...v, growth_stages }))
                        }}
                      />
                    </Field>
                    <Field label="Title">
                      <input
                        className={ADMIN_INPUT_CLASS}
                        value={stage.title || ''}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const growth_stages = [...value.growth_stages]
                          growth_stages[i] = { ...growth_stages[i], title: e.target.value }
                          setValue((v) => ({ ...v, growth_stages }))
                        }}
                      />
                    </Field>
                  </div>
                  <Field label="Tagline">
                    <input
                      className={ADMIN_INPUT_CLASS}
                      value={stage.tagline || ''}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const growth_stages = [...value.growth_stages]
                        growth_stages[i] = { ...growth_stages[i], tagline: e.target.value }
                        setValue((v) => ({ ...v, growth_stages }))
                      }}
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      className={ADMIN_TEXTAREA_CLASS}
                      rows={3}
                      value={stage.description || ''}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const growth_stages = [...value.growth_stages]
                        growth_stages[i] = { ...growth_stages[i], description: e.target.value }
                        setValue((v) => ({ ...v, growth_stages }))
                      }}
                    />
                  </Field>
                  <ImageUrlField
                    label="Image"
                    value={stage.image || ''}
                    disabled={!canEdit}
                    uploadFolder="cms"
                    onChange={(url) => {
                      const growth_stages = [...value.growth_stages]
                      growth_stages[i] = { ...growth_stages[i], image: url }
                      setValue((v) => ({ ...v, growth_stages }))
                    }}
                  />
                  <Field label="Image alt text">
                    <input
                      className={ADMIN_INPUT_CLASS}
                      value={stage.image_alt || ''}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const growth_stages = [...value.growth_stages]
                        growth_stages[i] = { ...growth_stages[i], image_alt: e.target.value }
                        setValue((v) => ({ ...v, growth_stages }))
                      }}
                    />
                  </Field>
                  <VideoUrlField
                    label="Video (optional)"
                    value={stage.video || ''}
                    disabled={!canEdit}
                    uploadFolder="cms"
                    onChange={(url) => {
                      const growth_stages = [...value.growth_stages]
                      growth_stages[i] = { ...growth_stages[i], video: url }
                      setValue((v) => ({ ...v, growth_stages }))
                    }}
                  />
                </div>
              ))}
            </>
          ) : null}

          {canEdit ? (
            <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
              {saving ? 'Saving…' : 'Save programs page'}
            </button>
          ) : null}
        </DashboardPanel>
      </form>
    </DashboardPage>
  )
}
