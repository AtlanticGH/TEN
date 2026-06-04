import { useEffect, useMemo, useState } from 'react'
import {
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  ADMIN_TEXTAREA_CLASS,
  DashboardAlert,
  DashboardNotice,
  DashboardPanel,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { ADMIN_BTN_PRIMARY, ADMIN_BTN_SECONDARY } from '../../components/dashboard/DashboardChrome'
import { getAdminSitePage } from '../../config/adminSitePages'
import { listCmsContentRows, upsertCmsContentRow } from '../../services/cmsContentRows'

function emptyDraft(pageKey, sectionKey = 'intro') {
  return {
    page_key: pageKey,
    section_key: sectionKey,
    title: '',
    body: '',
    media_url: '',
    published: true,
  }
}

export function AdminPageSections({ pageKey }) {
  const page = getAdminSitePage(pageKey)
  const [loading, setLoading] = useState(true)
  const [allRows, setAllRows] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState(() => emptyDraft(pageKey))

  const rows = useMemo(
    () => (allRows || []).filter((r) => r.page_key === pageKey).sort((a, b) => a.section_key.localeCompare(b.section_key)),
    [allRows, pageKey],
  )

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listCmsContentRows({ includeDrafts: true })
      setAllRows(data || [])
    } catch (err) {
      setError(err?.message || 'Unable to load sections.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setDraft(emptyDraft(pageKey, page?.suggestedSections?.[0] || 'intro'))
    load()
  }, [pageKey])

  if (loading) return <DashboardSkeleton className="h-64" />

  return (
    <div className="space-y-6">
      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />

      {page?.suggestedSections?.length ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Quick add:</span>
          {page.suggestedSections.map((sk) => (
            <button
              key={sk}
              type="button"
              className={ADMIN_BTN_SECONDARY}
              onClick={() => setDraft((d) => ({ ...d, section_key: sk }))}
            >
              {sk}
            </button>
          ))}
        </div>
      ) : null}

      <DashboardPanel>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add or update section</p>
        <form
          className="mt-4 grid gap-4 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            setError('')
            setNotice('')
            try {
              await upsertCmsContentRow({ ...draft, page_key: pageKey })
              setNotice('Section saved.')
              await load()
            } catch (err) {
              setError(err?.message || 'Save failed.')
            } finally {
              setSaving(false)
            }
          }}
        >
          <label className="block">
            <span className={ADMIN_FIELD_LABEL}>Section key</span>
            <input
              value={draft.section_key}
              onChange={(e) => setDraft((d) => ({ ...d, section_key: e.target.value }))}
              className={`mt-2 ${ADMIN_INPUT_CLASS}`}
              placeholder="intro"
              required
            />
          </label>
          <label className="flex items-end gap-2 pb-1 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
            />
            Published on live site
          </label>
          <label className="block md:col-span-2">
            <span className={ADMIN_FIELD_LABEL}>Title</span>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className={`mt-2 ${ADMIN_INPUT_CLASS}`}
            />
          </label>
          <label className="block md:col-span-2">
            <span className={ADMIN_FIELD_LABEL}>Body</span>
            <textarea
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              className={`mt-2 min-h-32 ${ADMIN_TEXTAREA_CLASS}`}
            />
          </label>
          <label className="block md:col-span-2">
            <span className={ADMIN_FIELD_LABEL}>Media URL</span>
            <input
              value={draft.media_url}
              onChange={(e) => setDraft((d) => ({ ...d, media_url: e.target.value }))}
              className={`mt-2 ${ADMIN_INPUT_CLASS}`}
              placeholder="Paste from Media library tab"
            />
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
              {saving ? 'Saving…' : 'Save section'}
            </button>
            <button
              type="button"
              className={ADMIN_BTN_SECONDARY}
              onClick={() => setDraft(emptyDraft(pageKey, page?.suggestedSections?.[0] || 'intro'))}
            >
              New section
            </button>
          </div>
        </form>
      </DashboardPanel>

      <DashboardPanel>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Sections on this page ({rows.length})
        </p>
        {rows.length ? (
          <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((r) => (
              <li
                key={`${r.page_key}-${r.section_key}`}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{r.section_key}</p>
                  {r.title ? <p className="truncate text-zinc-500">{r.title}</p> : null}
                  {!r.published ? <span className="text-xs text-amber-600">draft</span> : null}
                </div>
                <button
                  type="button"
                  className="text-orange-600 hover:underline"
                  onClick={() =>
                    setDraft({
                      page_key: pageKey,
                      section_key: r.section_key,
                      title: r.title || '',
                      body: r.body || '',
                      media_url: r.media_url || '',
                      published: !!r.published,
                    })
                  }
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">No sections yet for this page. Add one above.</p>
        )}
      </DashboardPanel>
    </div>
  )
}
