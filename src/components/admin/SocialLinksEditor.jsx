import { ADMIN_BTN_SECONDARY, ADMIN_FIELD_LABEL, ADMIN_INPUT_CLASS } from '../dashboard/DashboardChrome'

export function SocialLinksEditor({ links = [], onChange, disabled }) {
  const set = (next) => onChange(next)

  return (
    <div className="space-y-2">
      <p className={ADMIN_FIELD_LABEL}>Social links</p>
      {(links || []).map((link, i) => (
        <div key={i} className="flex flex-wrap gap-2">
          <input
            className={`${ADMIN_INPUT_CLASS} min-w-[120px] flex-1`}
            placeholder="Label (e.g. LinkedIn)"
            value={link.label || ''}
            disabled={disabled}
            onChange={(e) => {
              const next = [...links]
              next[i] = { ...next[i], label: e.target.value }
              set(next)
            }}
          />
          <input
            className={`${ADMIN_INPUT_CLASS} min-w-[200px] flex-[2]`}
            placeholder="https://…"
            value={link.href || ''}
            disabled={disabled}
            onChange={(e) => {
              const next = [...links]
              next[i] = { ...next[i], href: e.target.value }
              set(next)
            }}
          />
          {!disabled ? (
            <button
              type="button"
              className="text-xs text-rose-600"
              onClick={() => set(links.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}
      {!disabled ? (
        <button
          type="button"
          className={ADMIN_BTN_SECONDARY}
          onClick={() => set([...(links || []), { label: '', href: '' }])}
        >
          + Add link
        </button>
      ) : null}
    </div>
  )
}
