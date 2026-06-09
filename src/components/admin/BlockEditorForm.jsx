import { ADMIN_FIELD_LABEL, ADMIN_INPUT_CLASS, ADMIN_TEXTAREA_CLASS } from '../dashboard/DashboardChrome'
import { ImageUrlField } from './ImageUrlField'
import { VideoUrlField } from './VideoUrlField'

function Field({ label, children }) {
  return (
    <div>
      <label className={ADMIN_FIELD_LABEL}>{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function updateListItem(list, index, patch) {
  const next = [...(list || [])]
  next[index] = { ...next[index], ...patch }
  return next
}

function updateNestedItem(list, outerIndex, innerKey, innerIndex, patch) {
  const next = [...(list || [])]
  const parent = { ...next[outerIndex] }
  const inner = [...(parent[innerKey] || [])]
  inner[innerIndex] = { ...inner[innerIndex], ...patch }
  parent[innerKey] = inner
  next[outerIndex] = parent
  return next
}

export function BlockEditorForm({ blockType, content, onChange, disabled, mediaUploadFolder = 'cms' }) {
  const mediaFolder = mediaUploadFolder
  const c = content || {}
  const set = (patch) => onChange({ ...c, ...patch })
  const ro = disabled

  switch (blockType) {
    case 'hero':
      return (
        <div className="mt-4 space-y-3">
          <Field label="Variant">
            <select
              className={ADMIN_INPUT_CLASS}
              value={c.variant || 'inner'}
              disabled={ro}
              onChange={(e) => set({ variant: e.target.value })}
            >
              <option value="gateway">Full-screen (home)</option>
              <option value="inner">Inner page hero</option>
            </select>
          </Field>
          <Field label="Badge">
            <input className={ADMIN_INPUT_CLASS} value={c.badge || ''} disabled={ro} onChange={(e) => set({ badge: e.target.value })} />
          </Field>
          <Field label="Headline (line 1)">
            <input
              className={ADMIN_INPUT_CLASS}
              value={c.headline_before || c.headline || ''}
              disabled={ro}
              onChange={(e) => set({ headline_before: e.target.value })}
            />
          </Field>
          <Field label="Headline emphasis (line 2)">
            <input
              className={ADMIN_INPUT_CLASS}
              value={c.headline_emphasis || ''}
              disabled={ro}
              onChange={(e) => set({ headline_emphasis: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className={ADMIN_TEXTAREA_CLASS}
              rows={3}
              value={c.description || c.subheadline || ''}
              disabled={ro}
              onChange={(e) => set({ description: e.target.value })}
            />
          </Field>
          <Field label="Background image">
            <ImageUrlField
              value={c.background_image || c.image || ''}
              disabled={ro}
              uploadFolder={mediaFolder}
              onChange={(url) => set({ background_image: url, image: url })}
            />
          </Field>
          <Field label="Background video URL (optional)">
            <VideoUrlField
              value={c.background_video || ''}
              disabled={ro}
              uploadFolder={mediaFolder}
              onChange={(url) => set({ background_video: url })}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary CTA label">
              <input
                className={ADMIN_INPUT_CLASS}
                value={c.cta_primary_label || c.primary_label || ''}
                disabled={ro}
                onChange={(e) => set({ cta_primary_label: e.target.value })}
              />
            </Field>
            <Field label="Primary CTA link">
              <input
                className={ADMIN_INPUT_CLASS}
                value={c.cta_primary_href || c.primary_href || '/'}
                disabled={ro}
                onChange={(e) => set({ cta_primary_href: e.target.value })}
              />
            </Field>
            <Field label="Secondary CTA label">
              <input
                className={ADMIN_INPUT_CLASS}
                value={c.cta_secondary_label || c.secondary_label || ''}
                disabled={ro}
                onChange={(e) => set({ cta_secondary_label: e.target.value })}
              />
            </Field>
            <Field label="Secondary CTA link">
              <input
                className={ADMIN_INPUT_CLASS}
                value={c.cta_secondary_href || c.secondary_href || '/'}
                disabled={ro}
                onChange={(e) => set({ cta_secondary_href: e.target.value })}
              />
            </Field>
          </div>
          {(c.variant || 'inner') === 'gateway' ? (
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={!!c.hide_legacy_sections}
                disabled={ro}
                onChange={(e) => set({ hide_legacy_sections: e.target.checked })}
              />
              Replace entire homepage (hide built-in sections below hero)
            </label>
          ) : null}
        </div>
      )

    case 'features':
    case 'faq':
    case 'stats': {
      const items = c.items || []
      const isFaq = blockType === 'faq'
      const isFeatures = blockType === 'features'
      const isTeam = isFeatures && c.variant === 'team'
      return (
        <div className="mt-4 space-y-3">
          {isFeatures ? (
            <Field label="Layout">
              <select
                className={ADMIN_INPUT_CLASS}
                value={c.variant || 'cards'}
                disabled={ro}
                onChange={(e) => set({ variant: e.target.value })}
              >
                <option value="cards">Card grid</option>
                <option value="team">Team cards (with images)</option>
                <option value="media_split">Image + text rows</option>
              </select>
            </Field>
          ) : null}
          <Field label="Eyebrow (optional)">
            <input className={ADMIN_INPUT_CLASS} value={c.eyebrow || ''} disabled={ro} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <Field label="Section title">
            <input className={ADMIN_INPUT_CLASS} value={c.title || ''} disabled={ro} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          {isFeatures ? (
            <Field label="Subtitle (optional)">
              <textarea
                className={ADMIN_TEXTAREA_CLASS}
                rows={2}
                value={c.subtitle || ''}
                disabled={ro}
                onChange={(e) => set({ subtitle: e.target.value })}
              />
            </Field>
          ) : null}
          {items.map((item, i) => (
            <div key={i} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
              {isFaq ? (
                <>
                  <input
                    className={`${ADMIN_INPUT_CLASS} mb-2`}
                    placeholder="Question"
                    value={item.question || ''}
                    disabled={ro}
                    onChange={(e) => set({ items: updateListItem(items, i, { question: e.target.value }) })}
                  />
                  <textarea
                    className={ADMIN_TEXTAREA_CLASS}
                    rows={2}
                    placeholder="Answer"
                    value={item.answer || ''}
                    disabled={ro}
                    onChange={(e) => set({ items: updateListItem(items, i, { answer: e.target.value }) })}
                  />
                </>
              ) : blockType === 'stats' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    placeholder="Value"
                    value={item.value || ''}
                    disabled={ro}
                    onChange={(e) => set({ items: updateListItem(items, i, { value: e.target.value }) })}
                  />
                  <input
                    className={ADMIN_INPUT_CLASS}
                    placeholder="Label"
                    value={item.label || ''}
                    disabled={ro}
                    onChange={(e) => set({ items: updateListItem(items, i, { label: e.target.value }) })}
                  />
                </div>
              ) : (
                <>
                  {isTeam ? (
                    <input
                      className={`${ADMIN_INPUT_CLASS} mb-2`}
                      placeholder="Name"
                      value={item.name || ''}
                      disabled={ro}
                      onChange={(e) => set({ items: updateListItem(items, i, { name: e.target.value }) })}
                    />
                  ) : null}
                  {isTeam ? (
                    <input
                      className={`${ADMIN_INPUT_CLASS} mb-2`}
                      placeholder="Position"
                      value={item.position || item.title || ''}
                      disabled={ro}
                      onChange={(e) =>
                        set({ items: updateListItem(items, i, { position: e.target.value, title: e.target.value }) })
                      }
                    />
                  ) : (
                  <input
                    className={`${ADMIN_INPUT_CLASS} mb-2`}
                    placeholder="Title"
                    value={item.title || ''}
                    disabled={ro}
                    onChange={(e) => set({ items: updateListItem(items, i, { title: e.target.value }) })}
                  />
                  )}
                  <input
                    className={`${ADMIN_INPUT_CLASS} mb-2`}
                    placeholder="Eyebrow (optional)"
                    value={item.eyebrow || ''}
                    disabled={ro}
                    onChange={(e) => set({ items: updateListItem(items, i, { eyebrow: e.target.value }) })}
                  />
                  <textarea
                    className={ADMIN_TEXTAREA_CLASS}
                    rows={3}
                    placeholder="Description"
                    value={item.description || ''}
                    disabled={ro}
                    onChange={(e) => set({ items: updateListItem(items, i, { description: e.target.value }) })}
                  />
                  <div className="mt-2">
                    <ImageUrlField
                      label="Image"
                      value={item.image || ''}
                      disabled={ro}
                      onChange={(url) => set({ items: updateListItem(items, i, { image: url }) })}
                    />
                  </div>
                  <input
                    className={`${ADMIN_INPUT_CLASS} mt-2`}
                    placeholder="Fallback image URL (optional)"
                    value={item.fallback_image || ''}
                    disabled={ro}
                    onChange={(e) => set({ items: updateListItem(items, i, { fallback_image: e.target.value }) })}
                  />
                </>
              )}
              {!ro && (
                <button
                  type="button"
                  className="mt-2 text-xs text-rose-600"
                  onClick={() => set({ items: items.filter((_, j) => j !== i) })}
                >
                  Remove item
                </button>
              )}
            </div>
          ))}
          {!ro && (
            <button
              type="button"
              className="text-sm font-medium text-zinc-600"
              onClick={() =>
                set({
                  items: [
                    ...items,
                    isFaq
                      ? { question: '', answer: '' }
                      : blockType === 'stats'
                        ? { label: '', value: '' }
                        : { title: '', description: '', image: '' },
                  ],
                })
              }
            >
              + Add item
            </button>
          )}
        </div>
      )
    }

    case 'cta':
      return (
        <div className="mt-4 space-y-3">
          <Field label="Style">
            <select
              className={ADMIN_INPUT_CLASS}
              value={c.variant || 'inline'}
              disabled={ro}
              onChange={(e) => set({ variant: e.target.value })}
            >
              <option value="inline">Inline</option>
              <option value="banner">Full-width banner</option>
            </select>
          </Field>
          <Field label="Eyebrow (optional)">
            <input className={ADMIN_INPUT_CLASS} value={c.eyebrow || ''} disabled={ro} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <Field label="Title">
            <input className={ADMIN_INPUT_CLASS} value={c.title || ''} disabled={ro} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Body">
            <textarea className={ADMIN_TEXTAREA_CLASS} rows={3} value={c.body || ''} disabled={ro} onChange={(e) => set({ body: e.target.value })} />
          </Field>
          <Field label="Primary button label">
            <input
              className={ADMIN_INPUT_CLASS}
              value={c.primary_label || ''}
              disabled={ro}
              onChange={(e) => set({ primary_label: e.target.value })}
            />
          </Field>
          <Field label="Primary button link">
            <input
              className={ADMIN_INPUT_CLASS}
              value={c.primary_href || '/'}
              disabled={ro}
              onChange={(e) => set({ primary_href: e.target.value })}
            />
          </Field>
          <Field label="Secondary button label (optional)">
            <input
              className={ADMIN_INPUT_CLASS}
              value={c.secondary_label || ''}
              disabled={ro}
              onChange={(e) => set({ secondary_label: e.target.value })}
            />
          </Field>
          <Field label="Secondary button link">
            <input
              className={ADMIN_INPUT_CLASS}
              value={c.secondary_href || ''}
              disabled={ro}
              onChange={(e) => set({ secondary_href: e.target.value })}
            />
          </Field>
        </div>
      )

    case 'rich_text':
      return (
        <div className="mt-4">
          <Field label="HTML content">
            <textarea
              className={`${ADMIN_TEXTAREA_CLASS} font-mono text-xs`}
              rows={12}
              value={c.html || ''}
              disabled={ro}
              onChange={(e) => set({ html: e.target.value })}
            />
          </Field>
        </div>
      )

    case 'video_gallery': {
      const items = c.items || []
      return (
        <div className="mt-4 space-y-3">
          <Field label="Eyebrow (optional)">
            <input className={ADMIN_INPUT_CLASS} value={c.eyebrow || ''} disabled={ro} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <Field label="Section title">
            <input className={ADMIN_INPUT_CLASS} value={c.title || ''} disabled={ro} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <textarea className={ADMIN_TEXTAREA_CLASS} rows={2} value={c.subtitle || ''} disabled={ro} onChange={(e) => set({ subtitle: e.target.value })} />
          </Field>
          {items.map((item, i) => (
            <div key={i} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
              <VideoUrlField
                label="Video URL"
                value={item.url || item.video || ''}
                disabled={ro}
                uploadFolder={mediaFolder}
                onChange={(url) => set({ items: updateListItem(items, i, { url }) })}
              />
              <input
                className={`${ADMIN_INPUT_CLASS} mt-2`}
                placeholder="Title"
                value={item.title || ''}
                disabled={ro}
                onChange={(e) => set({ items: updateListItem(items, i, { title: e.target.value }) })}
              />
              <input
                className={`${ADMIN_INPUT_CLASS} mt-2`}
                placeholder="Caption"
                value={item.caption || ''}
                disabled={ro}
                onChange={(e) => set({ items: updateListItem(items, i, { caption: e.target.value }) })}
              />
              <ImageUrlField
                label="Poster image (optional)"
                value={item.poster || item.poster_image || ''}
                disabled={ro}
                uploadFolder={mediaFolder}
                onChange={(url) => set({ items: updateListItem(items, i, { poster: url }) })}
              />
              {!ro ? (
                <button type="button" className="mt-2 text-xs text-rose-600" onClick={() => set({ items: items.filter((_, j) => j !== i) })}>
                  Remove video
                </button>
              ) : null}
            </div>
          ))}
          {!ro ? (
            <button
              type="button"
              className="text-sm font-medium text-zinc-600"
              onClick={() => set({ items: [...items, { url: '', title: '', caption: '' }] })}
            >
              + Add video
            </button>
          ) : null}
        </div>
      )
    }

    case 'gallery': {
      const albums = c.albums || []
      return (
        <div className="mt-4 space-y-4">
          <Field label="Eyebrow (optional)">
            <input className={ADMIN_INPUT_CLASS} value={c.eyebrow || ''} disabled={ro} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <Field label="Section title">
            <input className={ADMIN_INPUT_CLASS} value={c.title || 'Photos'} disabled={ro} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Section intro">
            <textarea className={ADMIN_TEXTAREA_CLASS} rows={2} value={c.subtitle || ''} disabled={ro} onChange={(e) => set({ subtitle: e.target.value })} />
          </Field>
          {albums.map((album, ai) => (
            <div key={ai} className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Album {ai + 1}</p>
              <input
                className={`${ADMIN_INPUT_CLASS} mt-2`}
                placeholder="Album title"
                value={album.title || ''}
                disabled={ro}
                onChange={(e) => set({ albums: updateListItem(albums, ai, { title: e.target.value }) })}
              />
              <input
                className={`${ADMIN_INPUT_CLASS} mt-2`}
                placeholder="Album caption (short tagline)"
                value={album.caption || ''}
                disabled={ro}
                onChange={(e) => set({ albums: updateListItem(albums, ai, { caption: e.target.value }) })}
              />
              <textarea
                className={`${ADMIN_TEXTAREA_CLASS} mt-2`}
                rows={3}
                placeholder="Album description"
                value={album.description || ''}
                disabled={ro}
                onChange={(e) => set({ albums: updateListItem(albums, ai, { description: e.target.value }) })}
              />
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Photos in this album</p>
                {(album.items || []).map((item, pi) => (
                  <div key={pi} className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                    <ImageUrlField
                      label="Image"
                      value={item.image || item.src || ''}
                      disabled={ro}
                      uploadFolder={mediaFolder}
                      onChange={(url) => set({ albums: updateNestedItem(albums, ai, 'items', pi, { image: url }) })}
                    />
                    <input
                      className={`${ADMIN_INPUT_CLASS} mt-2`}
                      placeholder="Photo caption"
                      value={item.caption || ''}
                      disabled={ro}
                      onChange={(e) => set({ albums: updateNestedItem(albums, ai, 'items', pi, { caption: e.target.value }) })}
                    />
                    <input
                      className={`${ADMIN_INPUT_CLASS} mt-2`}
                      placeholder="Alt text"
                      value={item.alt || ''}
                      disabled={ro}
                      onChange={(e) => set({ albums: updateNestedItem(albums, ai, 'items', pi, { alt: e.target.value }) })}
                    />
                    <Field label="Tile shape (optional)">
                      <select
                        className={ADMIN_INPUT_CLASS}
                        value={item.tile || ''}
                        disabled={ro}
                        onChange={(e) =>
                          set({
                            albums: updateNestedItem(albums, ai, 'items', pi, {
                              tile: e.target.value || undefined,
                            }),
                          })
                        }
                      >
                        <option value="">Auto (mixed)</option>
                        <option value="square">Square</option>
                        <option value="wide">Wide rectangle</option>
                        <option value="tall">Tall rectangle</option>
                        <option value="feature">Large square</option>
                      </select>
                    </Field>
                    {!ro ? (
                      <button
                        type="button"
                        className="mt-2 text-xs text-rose-600"
                        onClick={() => {
                          const nextAlbums = [...albums]
                          nextAlbums[ai] = {
                            ...nextAlbums[ai],
                            items: (nextAlbums[ai].items || []).filter((_, j) => j !== pi),
                          }
                          set({ albums: nextAlbums })
                        }}
                      >
                        Remove photo
                      </button>
                    ) : null}
                  </div>
                ))}
                {!ro ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-zinc-600"
                    onClick={() =>
                      set({
                        albums: updateListItem(albums, ai, {
                          items: [...(album.items || []), { image: '', caption: '', alt: '' }],
                        }),
                      })
                    }
                  >
                    + Add photo to album
                  </button>
                ) : null}
              </div>
              {!ro ? (
                <button type="button" className="mt-3 text-xs text-rose-600" onClick={() => set({ albums: albums.filter((_, j) => j !== ai) })}>
                  Remove album
                </button>
              ) : null}
            </div>
          ))}
          {!ro ? (
            <button
              type="button"
              className="text-sm font-medium text-zinc-600"
              onClick={() =>
                set({
                  albums: [...albums, { title: '', caption: '', description: '', items: [] }],
                })
              }
            >
              + Add album
            </button>
          ) : null}
        </div>
      )
    }

    default:
      return (
        <div className="mt-4 space-y-3">
          <Field label="Eyebrow (optional)">
            <input className={ADMIN_INPUT_CLASS} value={c.eyebrow || ''} disabled={ro} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <Field label="Title">
            <input className={ADMIN_INPUT_CLASS} value={c.title || ''} disabled={ro} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Body">
            <textarea className={ADMIN_TEXTAREA_CLASS} rows={6} value={c.body || ''} disabled={ro} onChange={(e) => set({ body: e.target.value })} />
          </Field>
        </div>
      )
  }
}
