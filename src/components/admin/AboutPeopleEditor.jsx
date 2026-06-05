import { ImageUrlField } from './ImageUrlField'
import { SocialLinksEditor } from './SocialLinksEditor'
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  ADMIN_TEXTAREA_CLASS,
} from '../dashboard/DashboardChrome'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={ADMIN_FIELD_LABEL}>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

export function FounderEditor({ founder, setFounder, canEdit, saving, onSave }) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSave()
      }}
    >
      <Field label="Eyebrow">
        <input className={ADMIN_INPUT_CLASS} value={founder.eyebrow} disabled={!canEdit} onChange={(e) => setFounder((v) => ({ ...v, eyebrow: e.target.value }))} />
      </Field>
      <Field label="Name">
        <input className={ADMIN_INPUT_CLASS} value={founder.title} disabled={!canEdit} onChange={(e) => setFounder((v) => ({ ...v, title: e.target.value }))} />
      </Field>
      <Field label="Role / subtitle">
        <input className={ADMIN_INPUT_CLASS} value={founder.subtitle} disabled={!canEdit} onChange={(e) => setFounder((v) => ({ ...v, subtitle: e.target.value }))} />
      </Field>
      <ImageUrlField label="Portrait image" value={founder.image} disabled={!canEdit} uploadFolder="cms" onChange={(url) => setFounder((v) => ({ ...v, image: url }))} />
      <ImageUrlField label="Fallback image" value={founder.image_fallback} disabled={!canEdit} uploadFolder="cms" onChange={(url) => setFounder((v) => ({ ...v, image_fallback: url }))} />
      <Field label="Bio (blank line = new paragraph)">
        <textarea className={ADMIN_TEXTAREA_CLASS} rows={10} value={founder.body} disabled={!canEdit} onChange={(e) => setFounder((v) => ({ ...v, body: e.target.value }))} />
      </Field>
      <SocialLinksEditor links={founder.social_links} disabled={!canEdit} onChange={(social_links) => setFounder((v) => ({ ...v, social_links }))} />
      {canEdit ? (
        <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
          {saving ? 'Saving…' : 'Save founder'}
        </button>
      ) : null}
    </form>
  )
}

export function TeamEditor({ team, setTeam, canEdit, saving, onSave }) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSave()
      }}
    >
      <Field label="Eyebrow">
        <input className={ADMIN_INPUT_CLASS} value={team.eyebrow} disabled={!canEdit} onChange={(e) => setTeam((v) => ({ ...v, eyebrow: e.target.value }))} />
      </Field>
      <Field label="Section title">
        <input className={ADMIN_INPUT_CLASS} value={team.title} disabled={!canEdit} onChange={(e) => setTeam((v) => ({ ...v, title: e.target.value }))} />
      </Field>
      {(team.items || []).map((member, i) => (
        <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
          <p className="text-xs font-semibold uppercase text-zinc-500">Member {i + 1}</p>
          <input
            className={`${ADMIN_INPUT_CLASS} mt-2`}
            placeholder="Name / role"
            value={member.title || ''}
            disabled={!canEdit}
            onChange={(e) => {
              const items = [...team.items]
              items[i] = { ...items[i], title: e.target.value }
              setTeam((v) => ({ ...v, items }))
            }}
          />
          <textarea
            className={`${ADMIN_TEXTAREA_CLASS} mt-2`}
            rows={3}
            placeholder="Bio"
            value={member.description || ''}
            disabled={!canEdit}
            onChange={(e) => {
              const items = [...team.items]
              items[i] = { ...items[i], description: e.target.value }
              setTeam((v) => ({ ...v, items }))
            }}
          />
          <div className="mt-2">
            <ImageUrlField
              label="Photo"
              value={member.image || ''}
              disabled={!canEdit}
              uploadFolder="cms"
              onChange={(url) => {
                const items = [...team.items]
                items[i] = { ...items[i], image: url }
                setTeam((v) => ({ ...v, items }))
              }}
            />
          </div>
          <ImageUrlField
            label="Fallback photo"
            value={member.image_fallback || ''}
            disabled={!canEdit}
            uploadFolder="cms"
            onChange={(url) => {
              const items = [...team.items]
              items[i] = { ...items[i], image_fallback: url }
              setTeam((v) => ({ ...v, items }))
            }}
          />
          <div className="mt-3">
            <SocialLinksEditor
              links={member.social_links || []}
              disabled={!canEdit}
              onChange={(social_links) => {
                const items = [...team.items]
                items[i] = { ...items[i], social_links }
                setTeam((v) => ({ ...v, items }))
              }}
            />
          </div>
          {canEdit ? (
            <button type="button" className="mt-2 text-xs text-rose-600" onClick={() => setTeam((v) => ({ ...v, items: v.items.filter((_, j) => j !== i) }))}>
              Remove member
            </button>
          ) : null}
        </div>
      ))}
      {canEdit ? (
        <button
          type="button"
          className="text-sm font-medium text-zinc-600"
          onClick={() =>
            setTeam((v) => ({
              ...v,
              items: [...(v.items || []), { title: '', description: '', image: '', image_fallback: '', social_links: [] }],
            }))
          }
        >
          + Add team member
        </button>
      ) : null}
      {canEdit ? (
        <button type="submit" disabled={saving} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
          {saving ? 'Saving…' : 'Save team'}
        </button>
      ) : null}
    </form>
  )
}
