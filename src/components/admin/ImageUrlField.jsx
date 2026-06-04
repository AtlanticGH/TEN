import { useState } from 'react'
import { ADMIN_BTN_SECONDARY, ADMIN_INPUT_CLASS } from '../dashboard/DashboardChrome'
import { MediaPickerModal } from './MediaPickerModal'

export function ImageUrlField({ label, value = '', onChange, disabled, uploadFolder = 'cms' }) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div>
      {label ? <p className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</p> : null}
      <div className="flex gap-2">
        <input
          className={`${ADMIN_INPUT_CLASS} min-w-0 flex-1`}
          placeholder="/assets/images/… or media library URL"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className={ADMIN_BTN_SECONDARY}
          disabled={disabled}
          onClick={() => setPickerOpen(true)}
        >
          Pick
        </button>
      </div>
      {value ? (
        <img src={value} alt="" className="mt-2 h-20 max-w-full rounded-md border border-zinc-200 object-cover dark:border-zinc-700" />
      ) : null}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        uploadFolder={uploadFolder}
        onSelect={(url) => onChange(url)}
      />
    </div>
  )
}
