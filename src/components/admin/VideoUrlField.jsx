import { useState } from 'react'
import { ADMIN_BTN_SECONDARY, ADMIN_INPUT_CLASS } from '../dashboard/DashboardChrome'
import { MediaPickerModal } from './MediaPickerModal'

/** URL field for YouTube/Vimeo links or uploaded video files from the media library. */
export function VideoUrlField({ label, value = '', onChange, disabled, uploadFolder = 'cms' }) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div>
      {label ? <p className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</p> : null}
      <div className="flex gap-2">
        <input
          className={`${ADMIN_INPUT_CLASS} min-w-0 flex-1`}
          placeholder="YouTube/Vimeo URL or media library link"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className={ADMIN_BTN_SECONDARY} disabled={disabled} onClick={() => setPickerOpen(true)}>
          Pick file
        </button>
        {value ? (
          <button type="button" className={ADMIN_BTN_SECONDARY} disabled={disabled} onClick={() => onChange('')}>
            Clear
          </button>
        ) : null}
      </div>
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        accept="video/*"
        uploadFolder={uploadFolder}
        onSelect={(url) => onChange(url)}
      />
    </div>
  )
}
