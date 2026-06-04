import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ImageUrlField } from './ImageUrlField'
import { InnerPageHero } from '../shared/InnerPageHero'
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  ADMIN_TEXTAREA_CLASS,
  DashboardAlert,
  DashboardNotice,
  DashboardPanel,
  DashboardSkeleton,
  DashboardSplit,
} from '../dashboard/DashboardChrome'
import { EMPTY_PAGE_HERO, pageHeroKey } from '../../config/pageHeroDefaults'
import { loadPageHeroForAdmin, savePageHero } from '../../services/pageHeroAdmin'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={ADMIN_FIELD_LABEL}>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

/**
 * Edit inner-page hero (badge, heading, description, background image).
 */
export function PageHeroEditorPanel({ slug, label, path, uploadFolder = 'cms', canEdit, onSaved }) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [value, setValue] = useState({ ...EMPTY_PAGE_HERO })

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await loadPageHeroForAdmin(slug)
        if (alive) setValue(data)
      } catch (err) {
        if (alive) setError(err?.message || 'Unable to load hero.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [slug])

  if (loading) return <DashboardSkeleton className="h-64" />

  return (
    <>
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
              await savePageHero(slug, value)
              await queryClient.invalidateQueries({ queryKey: ['site-content', pageHeroKey(slug)] })
              setNotice(`${label} hero saved.`)
              onSaved?.(value)
            } catch (err) {
              setError(err?.message || 'Save failed.')
            } finally {
              setSaving(false)
            }
          }}
        >
          <Field label="Badge">
            <input
              className={ADMIN_INPUT_CLASS}
              value={value.badge}
              disabled={!canEdit}
              onChange={(e) => setValue((v) => ({ ...v, badge: e.target.value }))}
            />
          </Field>
          <Field label="Heading">
            <input
              className={ADMIN_INPUT_CLASS}
              value={value.heading}
              disabled={!canEdit}
              onChange={(e) => setValue((v) => ({ ...v, heading: e.target.value }))}
            />
          </Field>
          <Field label="Description">
            <textarea
              className={ADMIN_TEXTAREA_CLASS}
              rows={3}
              value={value.description}
              disabled={!canEdit}
              onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))}
            />
          </Field>
          <ImageUrlField
            label="Background image"
            value={value.image}
            disabled={!canEdit}
            uploadFolder={uploadFolder}
            onChange={(url) => setValue((v) => ({ ...v, image: url }))}
          />
          <p className="text-xs text-zinc-500">Prefer 1600–2400px wide. Upload or pick from the media library.</p>
          {canEdit ? (
            <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
              {saving ? 'Saving…' : `Save ${label} hero`}
            </button>
          ) : null}
        </form>

        <DashboardPanel className="lg:sticky lg:top-24 lg:self-start">
          <p className={ADMIN_FIELD_LABEL}>Preview</p>
          <p className="mt-1 text-xs text-zinc-500">Matches the live page hero.</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <InnerPageHero badge={value.badge} heading={value.heading} description={value.description} image={value.image} />
          </div>
          {path ? (
            <a
              href={path}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-medium text-orange-600 hover:text-orange-500"
            >
              View {label} page →
            </a>
          ) : null}
        </DashboardPanel>
      </DashboardSplit>
    </>
  )
}
