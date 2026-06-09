import { useCallback, useEffect, useMemo, useState } from 'react'
import { MediaAssetThumb } from './MediaAssetThumb'
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  DashboardAlert,
  adminFilterPillClass,
} from '../dashboard/DashboardChrome'
import { Dialog } from '../ui/Dialog'
import { useAuth } from '../../hooks/useAuth'
import { MEDIA_LIBRARY_FOLDERS } from '../../lib/mediaAssetTypes'
import { canEditContent } from '../../lib/rbac'
import {
  confirmDeleteMediaAsset,
  deleteMediaAsset,
  getPublicAssetUrl,
  listMediaAssets,
  uploadMediaFiles,
} from '../../services/mediaAssets'

/**
 * Modal grid to pick or upload an image/video; returns a public URL.
 */
export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  accept = 'image/*',
  uploadFolder = 'cms',
  allowDelete = true,
}) {
  const { profile } = useAuth()
  const canEdit = canEditContent(profile?.role)
  const canDelete = allowDelete && canEdit

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [folder, setFolder] = useState(uploadFolder || 'cms')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  const videoMode = String(accept || '').includes('video')

  useEffect(() => {
    if (open) setFolder(uploadFolder || 'cms')
  }, [open, uploadFolder])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listMediaAssets({
        limit: 120,
        query,
        folder,
        type: videoMode ? 'video' : 'image',
      })
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Unable to load media.')
    } finally {
      setLoading(false)
    }
  }, [query, folder, videoMode])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => refresh(), query ? 240 : 0)
    return () => clearTimeout(t)
  }, [open, refresh, query])

  const removeAsset = async (asset) => {
    if (!canDelete || !asset?.id) return
    if (!confirmDeleteMediaAsset(asset)) return
    setDeletingId(asset.id)
    setError('')
    try {
      await deleteMediaAsset(asset)
      await refresh()
    } catch (err) {
      setError(err?.message || 'Delete failed.')
    } finally {
      setDeletingId('')
    }
  }

  const emptyHint = useMemo(() => {
    const folderLabel = MEDIA_LIBRARY_FOLDERS.find((f) => f.id === folder)?.label || folder
    return videoMode
      ? `No videos in “${folderLabel}”. Upload one or switch folder.`
      : `No images in “${folderLabel}”. Upload one or switch folder.`
  }, [folder, videoMode])

  return (
    <Dialog open={open} onClose={onClose} title={videoMode ? 'Choose video' : 'Choose image'} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[180px] flex-1">
            <span className={ADMIN_FIELD_LABEL}>Search</span>
            <input
              className={`${ADMIN_INPUT_CLASS} mt-2`}
              placeholder="Title or path…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="w-full sm:w-40">
            <span className={ADMIN_FIELD_LABEL}>Folder</span>
            <select className={`${ADMIN_INPUT_CLASS} mt-2`} value={folder} onChange={(e) => setFolder(e.target.value)}>
              {MEDIA_LIBRARY_FOLDERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={ADMIN_BTN_SECONDARY} onClick={refresh} disabled={loading}>
            Refresh
          </button>
          {canEdit ? (
            <label className={`${ADMIN_BTN_PRIMARY} cursor-pointer`}>
              {uploading ? 'Uploading…' : videoMode ? 'Upload new' : 'Upload images'}
              <input
                type="file"
                accept={accept}
                multiple={!videoMode}
                className="sr-only"
                disabled={uploading}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || [])
                  if (!files.length) return
                  setUploading(true)
                  setError('')
                  try {
                    if (files.length === 1 && videoMode) {
                      const { results } = await uploadMediaFiles({
                        files,
                        folder: folder || uploadFolder || 'cms',
                      })
                      const url = getPublicAssetUrl({ asset: results[0]?.asset })
                      if (url) onSelect(url)
                      onClose()
                    } else {
                      const { uploaded, failed, errors } = await uploadMediaFiles({
                        files,
                        folder: folder || uploadFolder || 'cms',
                      })
                      await refresh()
                      if (failed) {
                        setError(
                          `Uploaded ${uploaded}; ${failed} failed. ${errors.map((item) => item.file.name).join(', ')}`,
                        )
                      }
                    }
                  } catch (err) {
                    setError(err?.message || 'Upload failed.')
                  } finally {
                    setUploading(false)
                    e.target.value = ''
                  }
                }}
              />
            </label>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {MEDIA_LIBRARY_FOLDERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={adminFilterPillClass(folder === f.id)}
              onClick={() => setFolder(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {canDelete ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Click a thumbnail to select it, or use Delete to remove an uploaded file from the library.
          </p>
        ) : null}

        {error ? <DashboardAlert message={error} onRetry={refresh} /> : null}

        {loading ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
        ) : items.length ? (
          <div className="grid max-h-[55vh] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => {
              const url = a.public_url || getPublicAssetUrl({ asset: a })
              return (
                <div
                  key={a.id}
                  className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {canDelete ? (
                    <button
                      type="button"
                      title="Delete"
                      disabled={deletingId === a.id}
                      onClick={() => removeAsset(a)}
                      className="absolute right-2 top-2 z-10 rounded-md bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white shadow hover:bg-rose-500 disabled:opacity-60"
                    >
                      {deletingId === a.id ? '…' : 'Delete'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="block w-full text-left transition hover:border-orange-400"
                    onClick={() => {
                      onSelect(url)
                      onClose()
                    }}
                  >
                    <MediaAssetThumb asset={a} className="h-28 w-full" />
                    <p className="px-2 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {a.title || a.path?.split('/').pop()}
                    </p>
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-950/40 dark:text-zinc-300">
            {emptyHint}
          </p>
        )}
      </div>
    </Dialog>
  )
}
