import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MediaAssetThumb } from '../../components/admin/MediaAssetThumb'
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  DashboardAlert,
  DashboardMetricTile,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSectionHeader,
  DashboardSkeleton,
  adminFilterPillClass,
} from '../../components/dashboard/DashboardChrome'
import { Dialog } from '../../components/ui/Dialog'
import {
  formatMediaBytes,
  MEDIA_LIBRARY_FOLDERS,
  MEDIA_TYPE_FILTERS,
  mediaAssetKind,
  resolveAssetFolder,
} from '../../lib/mediaAssetTypes'
import {
  deleteMediaAsset,
  getPublicAssetUrl,
  listMediaAssets,
  updateMediaAsset,
  uploadMediaFile,
} from '../../services/mediaAssets'

function parseTags(raw) {
  return String(raw || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export function AdminMediaPage() {
  const nested = useLocation().pathname.includes('/admin/pages/')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [folderFilter, setFolderFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [busy, setBusy] = useState('')

  const [openId, setOpenId] = useState('')
  const [uploadFolder, setUploadFolder] = useState('cms')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadAlt, setUploadAlt] = useState('')
  const [edit, setEdit] = useState({ title: '', alt: '', tags: '', folder: 'cms' })
  const selected = useMemo(() => items.find((x) => x.id === openId) || null, [items, openId])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listMediaAssets({
        limit: 300,
        query,
        folder: folderFilter,
        type: typeFilter,
      })
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Unable to load media assets.')
    } finally {
      setLoading(false)
    }
  }, [query, folderFilter, typeFilter])

  useEffect(() => {
    const t = setTimeout(() => refresh(), query ? 280 : 0)
    return () => clearTimeout(t)
  }, [refresh, query])

  const counts = useMemo(() => {
    const c = { all: items.length, image: 0, video: 0, pdf: 0 }
    for (const a of items) {
      const k = mediaAssetKind(a)
      if (k in c) c[k] += 1
    }
    return c
  }, [items])

  const uploadFile = async (file) => {
    if (!file) return
    setError('')
    setNotice('')
    setBusy('upload')
    try {
      await uploadMediaFile({
        file,
        folder: uploadFolder,
        title: uploadTitle.trim() || file.name,
        alt: uploadAlt.trim(),
      })
      setNotice(`Uploaded to ${uploadFolder}.`)
      setUploadTitle('')
      setUploadAlt('')
      await refresh()
    } catch (err) {
      setError(err?.message || 'Upload failed.')
    } finally {
      setBusy('')
    }
  }

  const body = (
    <>
      {!nested ? (
        <DashboardPageIntro
          label="Media"
          title="Media library"
          description="Upload and organize images, videos, and PDFs. Pick assets from here in Programs, Page heroes, Gallery, and Resources editors."
        />
      ) : null}

      {error ? <DashboardAlert message={error} onRetry={refresh} /> : null}
      <DashboardNotice message={notice} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricTile label="In view" value={items.length} />
        <DashboardMetricTile label="Images" value={counts.image} />
        <DashboardMetricTile label="Videos" value={counts.video} />
        <DashboardMetricTile label="PDFs" value={counts.pdf} />
      </div>

      <DashboardPanel>
        <DashboardSectionHeader
          bordered={false}
          label="Filters"
          title="Find assets"
          description="Search by title, path, or MIME type. Filter by folder and file type."
        />
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${ADMIN_INPUT_CLASS} min-w-[220px] flex-1`}
              placeholder="Search title, path, type…"
              aria-label="Search media"
            />
            <select
              className={`${ADMIN_INPUT_CLASS} w-full sm:w-44`}
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              aria-label="Folder"
            >
              <option value="">All folders</option>
              {MEDIA_LIBRARY_FOLDERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => refresh()} className={ADMIN_BTN_SECONDARY} disabled={loading}>
              Refresh
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {MEDIA_TYPE_FILTERS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={adminFilterPillClass(typeFilter === t.id)}
                onClick={() => setTypeFilter(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </DashboardPanel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <DashboardPanel>
          <DashboardSectionHeader
            bordered={false}
            label="Upload"
            title="Add new file"
            description="Max 25 MB. Images, videos, and PDFs go to the public bucket."
          />
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className={ADMIN_FIELD_LABEL}>Folder</span>
              <select
                className={`${ADMIN_INPUT_CLASS} mt-2`}
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
              >
                {MEDIA_LIBRARY_FOLDERS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {MEDIA_LIBRARY_FOLDERS.find((f) => f.id === uploadFolder)?.description}
              </p>
            </label>

            <label className="block">
              <span className={ADMIN_FIELD_LABEL}>Title (optional)</span>
              <input
                className={`${ADMIN_INPUT_CLASS} mt-2`}
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Defaults to filename"
              />
            </label>

            <label className="block">
              <span className={ADMIN_FIELD_LABEL}>Alt text (optional)</span>
              <input
                className={`${ADMIN_INPUT_CLASS} mt-2`}
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
                placeholder="Accessibility description for images"
              />
            </label>

            <div
              className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-center dark:border-zinc-600 dark:bg-zinc-950/40"
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('border-orange-400')
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove('border-orange-400')}
              onDrop={async (e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('border-orange-400')
                const file = e.dataTransfer.files?.[0]
                await uploadFile(file)
              }}
            >
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Drop a file here</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">or choose from your device</p>
              <label className={`${ADMIN_BTN_PRIMARY} mt-4 cursor-pointer`}>
                {busy === 'upload' ? 'Uploading…' : 'Choose file'}
                <input
                  type="file"
                  accept="image/*,video/*,application/pdf"
                  className="sr-only"
                  disabled={busy === 'upload'}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    await uploadFile(file)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardSectionHeader
            bordered={false}
            label="Library"
            title={`${items.length} asset${items.length === 1 ? '' : 's'}`}
            description="Click a card to edit metadata or copy the public URL."
          />

          {loading ? (
            <DashboardSkeleton className="mt-6 h-48" />
          ) : items.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((a) => {
                const folder = resolveAssetFolder(a)
                const kind = mediaAssetKind(a)
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setOpenId(a.id)
                      setEdit({
                        title: a.title || '',
                        alt: a.alt || '',
                        tags: (a.tags || []).join(', '),
                        folder,
                      })
                    }}
                    className="rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-sm transition hover:border-orange-400 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <MediaAssetThumb asset={a} className="h-32 w-full" />
                    <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {a.title || a.path?.split('/').pop() || 'Untitled'}
                    </p>
                    <p className="mt-1 break-all text-xs text-zinc-600 dark:text-zinc-400">{a.path}</p>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{folder}</span>
                      {' · '}
                      {kind}
                      {' · '}
                      {formatMediaBytes(a.size_bytes)}
                    </p>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-950/50 dark:text-zinc-300">
              No assets match your filters. Upload a file or clear filters to see more.
            </p>
          )}
        </DashboardPanel>
      </div>

      <Dialog
        open={!!selected}
        onClose={() => setOpenId('')}
        title={selected?.title || selected?.path || 'Asset'}
        wide
        footer={
          selected ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                disabled={busy === 'delete'}
                onClick={async () => {
                  if (!confirm('Delete this asset? This removes it from storage and the database.')) return
                  setBusy('delete')
                  setError('')
                  setNotice('')
                  try {
                    await deleteMediaAsset(selected)
                    setNotice('Deleted.')
                    setOpenId('')
                    await refresh()
                  } catch (err) {
                    setError(err?.message || 'Delete failed.')
                  } finally {
                    setBusy('')
                  }
                }}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-60"
              >
                {busy === 'delete' ? 'Deleting…' : 'Delete'}
              </button>
              <button
                type="button"
                disabled={busy === 'save'}
                onClick={async () => {
                  setBusy('save')
                  setError('')
                  setNotice('')
                  try {
                    await updateMediaAsset(selected.id, {
                      title: edit.title.trim() || null,
                      alt: edit.alt.trim() || null,
                      tags: parseTags(edit.tags),
                      folder: edit.folder || 'general',
                    })
                    setNotice('Saved.')
                    await refresh()
                  } catch (err) {
                    setError(err?.message || 'Save failed.')
                  } finally {
                    setBusy('')
                  }
                }}
                className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}
              >
                {busy === 'save' ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4 text-left">
            <MediaAssetThumb asset={selected} className="h-48 w-full" />

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
              <p className={ADMIN_FIELD_LABEL}>Public URL</p>
              <code className="mt-2 block break-all text-xs text-zinc-800 dark:text-zinc-200">
                {selected.public_url || getPublicAssetUrl({ asset: selected })}
              </code>
              <button
                type="button"
                className={`${ADMIN_BTN_SECONDARY} mt-3`}
                onClick={async () => {
                  const url = selected.public_url || getPublicAssetUrl({ asset: selected })
                  await navigator.clipboard.writeText(url)
                  setNotice('Copied URL.')
                }}
              >
                Copy URL
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={ADMIN_FIELD_LABEL}>Title</span>
                <input
                  value={edit.title}
                  onChange={(e) => setEdit((v) => ({ ...v, title: e.target.value }))}
                  className={`${ADMIN_INPUT_CLASS} mt-2`}
                />
              </label>
              <label className="block">
                <span className={ADMIN_FIELD_LABEL}>Alt text</span>
                <input
                  value={edit.alt}
                  onChange={(e) => setEdit((v) => ({ ...v, alt: e.target.value }))}
                  className={`${ADMIN_INPUT_CLASS} mt-2`}
                />
              </label>
            </div>

            <label className="block">
              <span className={ADMIN_FIELD_LABEL}>Folder</span>
              <select
                value={edit.folder}
                onChange={(e) => setEdit((v) => ({ ...v, folder: e.target.value }))}
                className={`${ADMIN_INPUT_CLASS} mt-2`}
              >
                {MEDIA_LIBRARY_FOLDERS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={ADMIN_FIELD_LABEL}>Tags (comma-separated)</span>
              <input
                value={edit.tags}
                onChange={(e) => setEdit((v) => ({ ...v, tags: e.target.value }))}
                className={`${ADMIN_INPUT_CLASS} mt-2`}
                placeholder="hero, programs, pdf"
              />
            </label>

            <dl className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-700 dark:bg-zinc-950/50">
              <div>
                <dt className="font-medium text-zinc-500">Type</dt>
                <dd className="mt-0.5 text-zinc-800 dark:text-zinc-200">{selected.mime_type || mediaAssetKind(selected)}</dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-500">Size</dt>
                <dd className="mt-0.5 text-zinc-800 dark:text-zinc-200">{formatMediaBytes(selected.size_bytes)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium text-zinc-500">Path</dt>
                <dd className="mt-0.5 break-all text-zinc-800 dark:text-zinc-200">{selected.path}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium text-zinc-500">Uploaded</dt>
                <dd className="mt-0.5 text-zinc-800 dark:text-zinc-200">
                  {selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Dialog>
    </>
  )

  return nested ? body : <DashboardPage>{body}</DashboardPage>
}
