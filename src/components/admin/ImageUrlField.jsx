import { useState } from 'react'
import { ADMIN_BTN_SECONDARY, ADMIN_INPUT_CLASS } from '../dashboard/DashboardChrome'
import { isExternalImageUrl, isUploadedImageUrl, sanitizeImageUrl } from '../../lib/imageUrls'
import { MediaPickerModal } from './MediaPickerModal'

export function ImageUrlField({ label, value = '', onChange, disabled, uploadFolder = 'cms' }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [hint, setHint] = useState('')

  function applyUrl(next) {
    const clean = sanitizeImageUrl(next)
    if (next.trim() && !clean) {
      setHint('Use Pick to choose an uploaded image from the media library.')
      return
    }
    setHint('')
    onChange(clean)
  }

  function handleInputChange(raw) {
    const t = String(raw || '').trim()
    if (!t) {
      setHint('')
      onChange('')
      return
    }
    if (isUploadedImageUrl(t)) {
      setHint('')
      onChange(t)
      return
    }
    if (isExternalImageUrl(t) || t.startsWith('/')) {
      setHint('Paste external or /assets URLs are not allowed — pick from the media library.')
      return
    }
    setHint('Only uploaded media library URLs are allowed.')
  }

  return (
    <div>
      {label ? <p className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</p> : null}
      <div className="flex gap-2">
        <input
          className={`${ADMIN_INPUT_CLASS} min-w-0 flex-1`}
          placeholder="Pick from media library…"
          value={value}
          disabled={disabled}
          readOnly
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <button
          type="button"
          className={ADMIN_BTN_SECONDARY}
          disabled={disabled}
          onClick={() => setPickerOpen(true)}
        >
          Pick
        </button>
        {value ? (
          <button
            type="button"
            className={ADMIN_BTN_SECONDARY}
            disabled={disabled}
            onClick={() => applyUrl('')}
          >
            Clear
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{hint}</p> : null}
      {value ? (
        <img src={value} alt="" className="mt-2 h-20 max-w-full rounded-md border border-zinc-200 object-cover dark:border-zinc-700" />
      ) : null}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        uploadFolder={uploadFolder}
        onSelect={(url) => applyUrl(url)}
      />
    </div>
  )
}
