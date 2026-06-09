import { useEffect, useState } from 'react'
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  ADMIN_TEXTAREA_CLASS,
} from '../dashboard/DashboardChrome'
import { ImageUrlField } from './ImageUrlField'

export function ResourceEditorForm({ resource, canEdit, saving, onSave, onCancel }) {
  const [title, setTitle] = useState(resource?.title || '')
  const [description, setDescription] = useState(resource?.description || '')
  const [category, setCategory] = useState(resource?.category || '')
  const [coverImageUrl, setCoverImageUrl] = useState(resource?.cover_image_url || '')

  useEffect(() => {
    setTitle(resource?.title || '')
    setDescription(resource?.description || '')
    setCategory(resource?.category || '')
    setCoverImageUrl(resource?.cover_image_url || '')
  }, [resource?.id, resource?.title, resource?.description, resource?.category, resource?.cover_image_url])

  if (!resource) return null

  return (
    <form
      className="mt-4 space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-700"
      onSubmit={(e) => {
        e.preventDefault()
        if (!canEdit) return
        onSave({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          cover_image_url: coverImageUrl.trim() || null,
        })
      }}
    >
      <ImageUrlField
        label="Cover image"
        value={coverImageUrl}
        disabled={!canEdit}
        uploadFolder="resources"
        onChange={setCoverImageUrl}
      />
      <p className="-mt-2 text-xs text-zinc-500">Horizontal tile preview on the public Resources page.</p>

      <label className="block">
        <span className={ADMIN_FIELD_LABEL}>Title</span>
        <input
          className={`${ADMIN_INPUT_CLASS} mt-2`}
          value={title}
          disabled={!canEdit}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block">
        <span className={ADMIN_FIELD_LABEL}>Description</span>
        <textarea
          className={`${ADMIN_TEXTAREA_CLASS} mt-2`}
          rows={3}
          value={description}
          disabled={!canEdit}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="block">
        <span className={ADMIN_FIELD_LABEL}>Category</span>
        <input
          className={`${ADMIN_INPUT_CLASS} mt-2`}
          value={category}
          disabled={!canEdit}
          onChange={(e) => setCategory(e.target.value)}
        />
      </label>

      {canEdit ? (
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={saving || !title.trim()} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {onCancel ? (
            <button type="button" className={ADMIN_BTN_SECONDARY} disabled={saving} onClick={onCancel}>
              Cancel
            </button>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
