import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BlockEditorForm } from '../../components/admin/BlockEditorForm'
import { PageHeroEditorPanel } from '../../components/admin/PageHeroEditorPanel'
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_FIELD_LABEL,
  DashboardAlert,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { useAuth } from '../../hooks/useAuth'
import { canEditContent } from '../../lib/rbac'
import { updatePage, updatePageBlock } from '../../services/cms/pages'
import { ensureGalleryCms, loadGalleryEditor } from '../../services/galleryAdmin'
import { uploadMediaFiles } from '../../services/mediaAssets'

const TABS = [
  { id: 'photos', label: 'Photo albums' },
  { id: 'videos', label: 'Videos' },
  { id: 'hero', label: 'Page hero' },
]

export function AdminGalleryPage() {
  const { profile } = useAuth()
  const canEdit = canEditContent(profile?.role)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState('photos')
  const [page, setPage] = useState(null)
  const [heroBlock, setHeroBlock] = useState(null)
  const [videoBlock, setVideoBlock] = useState(null)
  const [galleryBlock, setGalleryBlock] = useState(null)
  const [heroDraft, setHeroDraft] = useState({})
  const [videoDraft, setVideoDraft] = useState({})
  const [galleryDraft, setGalleryDraft] = useState({})
  const [busy, setBusy] = useState('')
  const [uploadKind, setUploadKind] = useState('image')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await ensureGalleryCms()
      const data = await loadGalleryEditor()
      setPage(data.page)
      setHeroBlock(data.heroBlock)
      setVideoBlock(data.videoBlock)
      setGalleryBlock(data.galleryBlock)
      setHeroDraft(data.heroBlock?.content || {})
      setVideoDraft(data.videoBlock?.content || {})
      setGalleryDraft(data.galleryBlock?.content || {})
    } catch (err) {
      setError(err?.message || 'Unable to load gallery.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveBlock = async (block, content, label) => {
    if (!canEdit || !block?.id) return
    setBusy(label)
    setError('')
    setNotice('')
    try {
      const updated = await updatePageBlock(block.id, { content })
      if (block.block_type === 'hero') {
        setHeroBlock(updated)
        setHeroDraft(updated.content || {})
      } else if (block.block_type === 'video_gallery') {
        setVideoBlock(updated)
        setVideoDraft(updated.content || {})
      } else if (block.block_type === 'gallery') {
        setGalleryBlock(updated)
        setGalleryDraft(updated.content || {})
      }
      setNotice(`${label} saved.`)
    } catch (err) {
      setError(err?.message || 'Save failed.')
    } finally {
      setBusy('')
    }
  }

  if (loading) return <DashboardSkeleton className="h-64" />

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Gallery"
        title="Gallery manager"
        description="Upload images and videos, organize photo albums, and edit the public /gallery page. Page blocks cannot be added from the builder — manage content here."
        actions={
          <div className="flex flex-wrap gap-2">
            <a href="/gallery" target="_blank" rel="noreferrer" className={ADMIN_BTN_SECONDARY}>
              View gallery
            </a>
            <Link to="/admin/media" className={ADMIN_BTN_SECONDARY}>
              Media library
            </Link>
          </div>
        }
      />
      {error ? <DashboardAlert message={error} onRetry={load} /> : null}
      <DashboardNotice message={notice} />

      <DashboardPanel>
        <p className={ADMIN_FIELD_LABEL}>Quick upload</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Files go to the <strong>gallery</strong> folder. Uploaded photos appear on the public gallery automatically; add
          them to an album below for captions and grouping.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={uploadKind}
            disabled={!canEdit}
            onChange={(e) => setUploadKind(e.target.value)}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <label className={`${ADMIN_BTN_PRIMARY} cursor-pointer ${!canEdit ? 'pointer-events-none opacity-50' : ''}`}>
            {busy === 'upload' ? 'Uploading…' : 'Upload to gallery'}
            <input
              type="file"
              accept={uploadKind === 'video' ? 'video/*' : 'image/*'}
              multiple={uploadKind === 'image'}
              className="sr-only"
              disabled={!canEdit || busy === 'upload'}
              onChange={async (e) => {
                const files = Array.from(e.target.files || [])
                if (!files.length) return
                setBusy('upload')
                setError('')
                setNotice('')
                try {
                  const { uploaded, failed } = await uploadMediaFiles({
                    files,
                    folder: 'gallery',
                  })
                  setNotice(
                    uploaded
                      ? `Uploaded ${uploaded} file${uploaded === 1 ? '' : 's'} — ${failed ? `${failed} failed. ` : ''}they will show on /gallery. Use Pick below to add captions or group into an album.`
                      : 'Upload failed.',
                  )
                } catch (err) {
                  setError(err?.message || 'Upload failed.')
                } finally {
                  setBusy('')
                  e.target.value = ''
                }
              }}
            />
          </label>
        </div>
      </DashboardPanel>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
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
        {tab === 'photos' && galleryBlock ? (
          <>
            <BlockEditorForm
              blockType="gallery"
              content={galleryDraft}
              onChange={setGalleryDraft}
              disabled={!canEdit}
              mediaUploadFolder="gallery"
            />
            {canEdit ? (
              <button
                type="button"
                className={`mt-4 ${ADMIN_BTN_PRIMARY}`}
                disabled={busy === 'photos'}
                onClick={() => saveBlock(galleryBlock, galleryDraft, 'Photo albums')}
              >
                {busy === 'photos' ? 'Saving…' : 'Save photo albums'}
              </button>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">View-only access.</p>
            )}
          </>
        ) : null}

        {tab === 'videos' && videoBlock ? (
          <>
            <BlockEditorForm
              blockType="video_gallery"
              content={videoDraft}
              onChange={setVideoDraft}
              disabled={!canEdit}
              mediaUploadFolder="gallery"
            />
            {canEdit ? (
              <button
                type="button"
                className={`mt-4 ${ADMIN_BTN_PRIMARY}`}
                disabled={busy === 'videos'}
                onClick={() => saveBlock(videoBlock, videoDraft, 'Videos')}
              >
                {busy === 'videos' ? 'Saving…' : 'Save videos'}
              </button>
            ) : null}
          </>
        ) : null}

        {tab === 'hero' ? (
          <>
            <PageHeroEditorPanel slug="gallery" label="Gallery" path="/gallery" uploadFolder="gallery" canEdit={canEdit} />
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={ADMIN_FIELD_LABEL}>SEO title</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  value={page?.seo_title || ''}
                  disabled={!canEdit}
                  onChange={(e) => setPage((p) => ({ ...p, seo_title: e.target.value }))}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={ADMIN_FIELD_LABEL}>SEO description</span>
                <textarea
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  rows={2}
                  value={page?.seo_description || ''}
                  disabled={!canEdit}
                  onChange={(e) => setPage((p) => ({ ...p, seo_description: e.target.value }))}
                />
              </label>
            </div>
            {canEdit ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={ADMIN_BTN_SECONDARY}
                  disabled={busy === 'seo'}
                  onClick={async () => {
                    if (!page?.id) return
                    setBusy('seo')
                    try {
                      const updated = await updatePage(page.id, {
                        seo_title: page.seo_title,
                        seo_description: page.seo_description,
                      })
                      setPage(updated)
                      setNotice('SEO saved.')
                    } catch (err) {
                      setError(err?.message || 'SEO save failed.')
                    } finally {
                      setBusy('')
                    }
                  }}
                >
                  Save page SEO
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </DashboardPanel>
    </DashboardPage>
  )
}
