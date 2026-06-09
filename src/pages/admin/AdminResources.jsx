import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FaqEditor } from '../../components/admin/FaqEditor'
import {
  ADMIN_FIELD_LABEL,
  DashboardAlert,
  DashboardEmpty,
  DashboardInsetCard,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardSkeleton,
  DashboardSplit,
} from '../../components/dashboard/DashboardChrome'
import { ADMIN_BTN_PRIMARY, ADMIN_BTN_SECONDARY } from '../../components/dashboard/DashboardChrome'
import { DEFAULT_RESOURCES_FAQ, RESOURCES_FAQ_KEY, mergeFaqContent } from '../../config/faqContentDefaults'
import { useAuth } from '../../hooks/useAuth'
import { canEditContent } from '../../lib/rbac'
import { extractSiteContentValue, getSiteContent, upsertSiteContent } from '../../services/siteContent'
import { createResource, deleteResource, listResources } from '../../services/resources'

export function AdminResourcesPage() {
  const nested = useLocation().pathname.includes('/admin/pages/')
  const { profile } = useAuth()
  const canEdit = canEditContent(profile?.role)
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [faqSaving, setFaqSaving] = useState(false)
  const [faq, setFaq] = useState(() => mergeFaqContent(DEFAULT_RESOURCES_FAQ, null))

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState(null)

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listResources({ limit: 200 })
      setItems(data)
    } catch (err) {
      setError(err?.message || 'Unable to load resources.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      await refresh()
      try {
        const row = await getSiteContent(RESOURCES_FAQ_KEY)
        if (alive) setFaq(mergeFaqContent(DEFAULT_RESOURCES_FAQ, extractSiteContentValue(row)))
      } catch {
        // defaults apply
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const saveFaq = async () => {
    if (!canEdit) return
    setFaqSaving(true)
    setError('')
    setNotice('')
    try {
      await upsertSiteContent({ key: RESOURCES_FAQ_KEY, value: faq })
      await queryClient.invalidateQueries({ queryKey: ['site-content', RESOURCES_FAQ_KEY] })
      setNotice('Resources FAQs saved.')
    } catch (err) {
      setError(err?.message || 'Unable to save FAQs.')
    } finally {
      setFaqSaving(false)
    }
  }

  const canCreate = useMemo(() => !!title.trim() && !!file && !busy, [title, file, busy])

  const body = (
    <>
      {!nested ? (
        <DashboardPageIntro
          label="Resources"
          title="Free downloads"
          description="Upload PDFs/templates for the public Resources page."
          actions={
            <button type="button" onClick={() => refresh()} className={`${ADMIN_BTN_SECONDARY} !py-2`}>
              Refresh
            </button>
          }
        />
      ) : null}

      {error ? <DashboardAlert message={error} onRetry={refresh} /> : null}
      {notice ? <DashboardNotice message={notice} /> : null}

      <DashboardSplit className="lg:grid-cols-[0.9fr_1.1fr]">
        <DashboardInsetCard>
          <p className={ADMIN_FIELD_LABEL}>Upload resource</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!canCreate) return
              setBusy(true)
              setError('')
              try {
                await createResource({ title, description, category, file })
                setTitle('')
                setDescription('')
                setCategory('')
                setFile(null)
                await refresh()
              } catch (err) {
                setError(err?.message || 'Unable to create resource.')
              } finally {
                setBusy(false)
              }
            }}
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Title *</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Resource title"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 min-h-24 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Short summary"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Category</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Templates / Funding / Pitching"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">File *</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-2 block w-full text-sm"
              />
              {file ? <p className="mt-2 text-xs text-zinc-500">Selected: {file.name}</p> : null}
            </label>
            <button type="submit" disabled={!canCreate} className={`w-full ${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
              {busy ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </DashboardInsetCard>

        <div>
          <p className={ADMIN_FIELD_LABEL}>Existing resources</p>
          {loading ? (
            <DashboardSkeleton className="mt-4 h-32" />
          ) : items.length ? (
            <div className="mt-4 space-y-3">
              {items.map((r) => (
                <DashboardInsetCard key={r.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{r.title}</p>
                      {r.category ? <p className="mt-1 text-xs text-zinc-500">{r.category}</p> : null}
                      {r.description ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{r.description}</p> : null}
                      {r.download_url ? (
                        <a
                          className="mt-3 inline-flex text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300"
                          href={r.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm('Delete this resource?')) return
                        setBusy(true)
                        setError('')
                        try {
                          await deleteResource(r)
                          await refresh()
                        } catch (err) {
                          setError(err?.message || 'Unable to delete resource.')
                        } finally {
                          setBusy(false)
                        }
                      }}
                      className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </DashboardInsetCard>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <DashboardEmpty>No resources yet.</DashboardEmpty>
            </div>
          )}
        </div>
      </DashboardSplit>

      {!nested ? (
        <div className="mt-10">
          <FaqEditor content={faq} onChange={setFaq} canEdit={canEdit} onSave={saveFaq} saving={faqSaving} />
        </div>
      ) : null}
    </>
  )

  return nested ? body : <DashboardPage>{body}</DashboardPage>
}

