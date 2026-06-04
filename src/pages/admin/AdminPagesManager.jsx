import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_INPUT_CLASS,
  DashboardAlert,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { useAuth } from '../../hooks/useAuth'
import { canEditContent } from '../../lib/rbac'
import { createPage, deletePage, duplicatePage, listAdminPages, updatePage } from '../../services/cms/pages'

export function AdminPagesManagerPage() {
  const { profile } = useAuth()
  const canEdit = canEditContent(profile?.role)
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [newTitle, setNewTitle] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setPages(await listAdminPages())
    } catch (err) {
      setError(err?.message || 'Unable to load pages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addPage = async () => {
    setNotice('')
    try {
      await createPage({ title: newTitle, slug: newTitle, status: 'draft' })
      setNewTitle('')
      setNotice('Page created.')
      await load()
    } catch (err) {
      setError(err?.message || 'Create failed.')
    }
  }

  if (loading) return <DashboardSkeleton className="h-48" />

  return (
    <DashboardPage>
      <DashboardPageIntro label="Pages" title="All pages" description="Create, publish, and build pages with content blocks." />
      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />

      <DashboardPanel>
        <div className="flex flex-wrap gap-2">
          <input
            className={`${ADMIN_INPUT_CLASS} max-w-xs`}
            placeholder="New page title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="button" className={ADMIN_BTN_PRIMARY} disabled={!canEdit || !newTitle.trim()} onClick={addPage}>
            Add page
          </button>
        </div>
        <ul className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-800">
          {pages.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{p.title}</p>
                <p className="text-xs text-zinc-500">
                  /{p.slug} · {p.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={
                    p.slug === 'gallery'
                      ? '/admin/gallery'
                      : p.slug === 'programs'
                        ? '/admin/programs'
                        : p.slug === 'home'
                          ? '/admin/home'
                          : `/admin/pages/${p.slug}/builder`
                  }
                  className={ADMIN_BTN_PRIMARY}
                >
                  {p.slug === 'gallery'
                    ? 'Edit gallery'
                    : p.slug === 'programs'
                      ? 'Edit programs'
                      : p.slug === 'home'
                        ? 'Edit homepage'
                        : 'Edit blocks'}
                </Link>
                <button
                  type="button"
                  className={ADMIN_BTN_SECONDARY}
                  disabled={!canEdit}
                  onClick={async () => {
                    await updatePage(p.id, { status: p.status === 'published' ? 'draft' : 'published' })
                    await load()
                  }}
                >
                  {p.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  className={ADMIN_BTN_SECONDARY}
                  disabled={!canEdit}
                  onClick={async () => {
                    try {
                      await duplicatePage(p.id)
                      setNotice(`Duplicated "${p.title}".`)
                      await load()
                    } catch (err) {
                      setError(err?.message || 'Duplicate failed.')
                    }
                  }}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className={ADMIN_BTN_SECONDARY}
                  disabled={!canEdit}
                  onClick={async () => {
                    if (!confirm(`Delete "${p.title}"?`)) return
                    await deletePage(p.id)
                    await load()
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </DashboardPanel>
    </DashboardPage>
  )
}
