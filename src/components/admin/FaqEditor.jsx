import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  ADMIN_TEXTAREA_CLASS,
  DashboardPanel,
} from '../dashboard/DashboardChrome'

export function FaqEditor({ content, onChange, canEdit, onSave, saving }) {
  const items = content?.items || []

  const setItem = (index, patch) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    onChange({ ...content, items: next })
  }

  return (
    <DashboardPanel title="FAQ accordion" description="Questions and answers shown in the expandable list on the public page.">
      <div className="space-y-4">
        <label className="block">
          <span className={ADMIN_FIELD_LABEL}>Eyebrow</span>
          <input
            className={`${ADMIN_INPUT_CLASS} mt-2`}
            value={content.eyebrow || ''}
            disabled={!canEdit}
            onChange={(e) => onChange({ ...content, eyebrow: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={ADMIN_FIELD_LABEL}>Section title</span>
          <input
            className={`${ADMIN_INPUT_CLASS} mt-2`}
            value={content.title || ''}
            disabled={!canEdit}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
          />
        </label>

        <div className="space-y-3">
          <p className={ADMIN_FIELD_LABEL}>Questions</p>
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <input
                className={`${ADMIN_INPUT_CLASS} mb-2`}
                placeholder="Question"
                value={item.q || ''}
                disabled={!canEdit}
                onChange={(e) => setItem(i, { q: e.target.value })}
              />
              <textarea
                className={ADMIN_TEXTAREA_CLASS}
                rows={3}
                placeholder="Answer"
                value={item.a || ''}
                disabled={!canEdit}
                onChange={(e) => setItem(i, { a: e.target.value })}
              />
              {canEdit ? (
                <button
                  type="button"
                  className={`${ADMIN_BTN_SECONDARY} mt-2`}
                  onClick={() => onChange({ ...content, items: items.filter((_, idx) => idx !== i) })}
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          {canEdit ? (
            <button
              type="button"
              className={ADMIN_BTN_SECONDARY}
              onClick={() => onChange({ ...content, items: [...items, { q: '', a: '' }] })}
            >
              + Add question
            </button>
          ) : null}
        </div>

        {canEdit && onSave ? (
          <button type="button" className={ADMIN_BTN_PRIMARY} disabled={saving} onClick={onSave}>
            {saving ? 'Saving…' : 'Save FAQs'}
          </button>
        ) : null}
      </div>
    </DashboardPanel>
  )
}
