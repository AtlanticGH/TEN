import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  ADMIN_TEXTAREA_CLASS,
  DashboardPanel,
} from '../dashboard/DashboardChrome'
import { HOME_PROGRAM_ICON_OPTIONS } from '../../lib/homeProgramIcons'
import { ImageUrlField } from './ImageUrlField'

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className={ADMIN_FIELD_LABEL}>{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
    </label>
  )
}

function ParagraphList({ label, values, onChange, canEdit }) {
  const list = values || []
  return (
    <div className="space-y-2">
      <p className={ADMIN_FIELD_LABEL}>{label}</p>
      {list.map((value, i) => (
        <div key={i} className="flex gap-2">
          <textarea
            className={ADMIN_TEXTAREA_CLASS}
            rows={3}
            value={value}
            disabled={!canEdit}
            onChange={(e) => onChange(list.map((item, idx) => (idx === i ? e.target.value : item)))}
          />
          {canEdit ? (
            <button
              type="button"
              className={`${ADMIN_BTN_SECONDARY} shrink-0 self-start`}
              onClick={() => onChange(list.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}
      {canEdit ? (
        <button type="button" className={ADMIN_BTN_SECONDARY} onClick={() => onChange([...list, ''])}>
          + Add paragraph
        </button>
      ) : null}
    </div>
  )
}

function StringList({ label, values, onChange, canEdit }) {
  const list = values || []
  return (
    <div className="space-y-2">
      <p className={ADMIN_FIELD_LABEL}>{label}</p>
      {list.map((value, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={ADMIN_INPUT_CLASS}
            value={value}
            disabled={!canEdit}
            onChange={(e) => onChange(list.map((item, idx) => (idx === i ? e.target.value : item)))}
          />
          {canEdit ? (
            <button
              type="button"
              className={`${ADMIN_BTN_SECONDARY} shrink-0`}
              onClick={() => onChange(list.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}
      {canEdit ? (
        <button type="button" className={ADMIN_BTN_SECONDARY} onClick={() => onChange([...list, ''])}>
          + Add item
        </button>
      ) : null}
    </div>
  )
}

export function HomePageSectionsEditor({ content, onChange, canEdit, onSave, saving }) {
  const patch = (path, value) => {
    const next = { ...content }
    let cursor = next
    const keys = path.split('.')
    for (let i = 0; i < keys.length - 1; i += 1) {
      cursor[keys[i]] = { ...cursor[keys[i]] }
      cursor = cursor[keys[i]]
    }
    cursor[keys[keys.length - 1]] = value
    onChange(next)
  }

  const who = content.who || {}
  const story = who.story || { sections: [], image: {} }
  const fire = who.fire || { items: [] }
  const programs = content.programs || { items: [], growth_cycle: { items: [] } }
  const growth = programs.growth_cycle || { items: [] }
  const community = content.community || { tiers: [], benefits: [] }
  const testimonials = content.testimonials || { items: [] }

  return (
    <div className="space-y-6">
      <DashboardPanel title="Our Purpose" description="Dark gradient section below the hero.">
        <div className="space-y-4">
          <Field label="Eyebrow">
            <input className={ADMIN_INPUT_CLASS} value={content.purpose?.eyebrow || ''} disabled={!canEdit} onChange={(e) => patch('purpose.eyebrow', e.target.value)} />
          </Field>
          <Field label="Headline">
            <input className={ADMIN_INPUT_CLASS} value={content.purpose?.title || ''} disabled={!canEdit} onChange={(e) => patch('purpose.title', e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={ADMIN_TEXTAREA_CLASS} rows={4} value={content.purpose?.description || ''} disabled={!canEdit} onChange={(e) => patch('purpose.description', e.target.value)} />
          </Field>
        </div>
      </DashboardPanel>

      <DashboardPanel title="Who We Are" description="Intro, story band, mission, vision, and FIRE philosophy.">
        <div className="space-y-6">
          <Field label="Eyebrow">
            <input className={ADMIN_INPUT_CLASS} value={who.eyebrow || ''} disabled={!canEdit} onChange={(e) => patch('who.eyebrow', e.target.value)} />
          </Field>
          <Field label="Headline">
            <input className={ADMIN_INPUT_CLASS} value={who.title || ''} disabled={!canEdit} onChange={(e) => patch('who.title', e.target.value)} />
          </Field>
          <ParagraphList
            label="Intro paragraphs"
            values={who.paragraphs}
            canEdit={canEdit}
            onChange={(paragraphs) => patch('who.paragraphs', paragraphs)}
          />

          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <p className={ADMIN_FIELD_LABEL}>Story band</p>
            {(story.sections || []).map((section, i) => (
              <div key={i} className="mt-4 space-y-3 border-t border-zinc-200 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-zinc-700">
                <Field label={`Block ${i + 1} eyebrow`}>
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={section.eyebrow || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const sections = story.sections.map((item, idx) => (idx === i ? { ...item, eyebrow: e.target.value } : item))
                      patch('who.story', { ...story, sections })
                    }}
                  />
                </Field>
                <Field label="Title">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={section.title || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const sections = story.sections.map((item, idx) => (idx === i ? { ...item, title: e.target.value } : item))
                      patch('who.story', { ...story, sections })
                    }}
                  />
                </Field>
                <ParagraphList
                  label="Paragraphs"
                  values={section.paragraphs}
                  canEdit={canEdit}
                  onChange={(paragraphs) => {
                    const sections = story.sections.map((item, idx) => (idx === i ? { ...item, paragraphs } : item))
                    patch('who.story', { ...story, sections })
                  }}
                />
              </div>
            ))}
            <ImageUrlField
              label="Story image"
              value={story.image?.src || ''}
              disabled={!canEdit}
              uploadFolder="cms"
              onChange={(url) => patch('who.story', { ...story, image: { ...story.image, src: url } })}
            />
            <Field label="Story image alt text" hint="Describes the image for screen readers.">
              <input
                className={ADMIN_INPUT_CLASS}
                value={story.image?.alt || ''}
                disabled={!canEdit}
                onChange={(e) => patch('who.story', { ...story, image: { ...story.image, alt: e.target.value } })}
              />
            </Field>
          </div>

          {['mission', 'vision'].map((key) => (
            <div key={key} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <p className={ADMIN_FIELD_LABEL}>{key === 'mission' ? 'Mission card' : 'Vision card'}</p>
              <div className="mt-3 space-y-3">
                <Field label="Eyebrow">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={who[key]?.eyebrow || ''}
                    disabled={!canEdit}
                    onChange={(e) => patch(`who.${key}`, { ...who[key], eyebrow: e.target.value })}
                  />
                </Field>
                <Field label="Body">
                  <textarea
                    className={ADMIN_TEXTAREA_CLASS}
                    rows={4}
                    value={who[key]?.body || ''}
                    disabled={!canEdit}
                    onChange={(e) => patch(`who.${key}`, { ...who[key], body: e.target.value })}
                  />
                </Field>
                <ImageUrlField
                  label="Image"
                  value={who[key]?.image || ''}
                  disabled={!canEdit}
                  uploadFolder="cms"
                  onChange={(url) => patch(`who.${key}`, { ...who[key], image: url })}
                />
                <Field label="Image alt text">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={who[key]?.image_alt || ''}
                    disabled={!canEdit}
                    onChange={(e) => patch(`who.${key}`, { ...who[key], image_alt: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          ))}

          <Field label="FIRE section eyebrow">
            <input className={ADMIN_INPUT_CLASS} value={fire.eyebrow || ''} disabled={!canEdit} onChange={(e) => patch('who.fire', { ...fire, eyebrow: e.target.value })} />
          </Field>
          <Field label="FIRE section title">
            <input className={ADMIN_INPUT_CLASS} value={fire.title || ''} disabled={!canEdit} onChange={(e) => patch('who.fire', { ...fire, title: e.target.value })} />
          </Field>
          <div className="space-y-3">
            <p className={ADMIN_FIELD_LABEL}>FIRE panels (letter sets color)</p>
            {(fire.items || []).map((item, i) => (
              <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <Field label="Letter">
                  <input
                    className={`${ADMIN_INPUT_CLASS} max-w-[4rem]`}
                    maxLength={1}
                    value={item.letter || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const items = fire.items.map((row, idx) => (idx === i ? { ...row, letter: e.target.value.toUpperCase() } : row))
                      patch('who.fire', { ...fire, items })
                    }}
                  />
                </Field>
                <Field label="Title">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={item.title || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const items = fire.items.map((row, idx) => (idx === i ? { ...row, title: e.target.value } : row))
                      patch('who.fire', { ...fire, items })
                    }}
                  />
                </Field>
                <Field label="Body">
                  <textarea
                    className={ADMIN_TEXTAREA_CLASS}
                    rows={3}
                    value={item.body || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const items = fire.items.map((row, idx) => (idx === i ? { ...row, body: e.target.value } : row))
                      patch('who.fire', { ...fire, items })
                    }}
                  />
                </Field>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className={ADMIN_FIELD_LABEL}>Stats bar (below FIRE)</p>
            {(who.stats || []).map((stat, i) => (
              <div key={i} className="grid gap-2 md:grid-cols-2">
                <input
                  className={ADMIN_INPUT_CLASS}
                  placeholder="Value"
                  value={stat.value || ''}
                  disabled={!canEdit}
                  onChange={(e) => {
                    const stats = who.stats.map((row, idx) => (idx === i ? { ...row, value: e.target.value } : row))
                    patch('who.stats', stats)
                  }}
                />
                <input
                  className={ADMIN_INPUT_CLASS}
                  placeholder="Label"
                  value={stat.label || ''}
                  disabled={!canEdit}
                  onChange={(e) => {
                    const stats = who.stats.map((row, idx) => (idx === i ? { ...row, label: e.target.value } : row))
                    patch('who.stats', stats)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel title="Founder quote" description="Quote band between stats and programs.">
        <div className="space-y-4">
          <Field label="Quote">
            <textarea className={ADMIN_TEXTAREA_CLASS} rows={4} value={content.quote?.text || ''} disabled={!canEdit} onChange={(e) => patch('quote.text', e.target.value)} />
          </Field>
          <Field label="Attribution">
            <input className={ADMIN_INPUT_CLASS} value={content.quote?.attribution || ''} disabled={!canEdit} onChange={(e) => patch('quote.attribution', e.target.value)} />
          </Field>
        </div>
      </DashboardPanel>

      <DashboardPanel title="Programs & growth cycle">
        <div className="space-y-6">
          <Field label="Eyebrow">
            <input className={ADMIN_INPUT_CLASS} value={programs.eyebrow || ''} disabled={!canEdit} onChange={(e) => patch('programs.eyebrow', e.target.value)} />
          </Field>
          <Field label="Headline">
            <input className={ADMIN_INPUT_CLASS} value={programs.title || ''} disabled={!canEdit} onChange={(e) => patch('programs.title', e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={ADMIN_TEXTAREA_CLASS} rows={3} value={programs.description || ''} disabled={!canEdit} onChange={(e) => patch('programs.description', e.target.value)} />
          </Field>

          <div className="space-y-3">
            <p className={ADMIN_FIELD_LABEL}>Program cards</p>
            {(programs.items || []).map((item, i) => (
              <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <Field label="Icon">
                  <select
                    className={ADMIN_INPUT_CLASS}
                    value={item.icon || 'beaker'}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const items = programs.items.map((row, idx) => (idx === i ? { ...row, icon: e.target.value } : row))
                      patch('programs.items', items)
                    }}
                  >
                    {HOME_PROGRAM_ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Title">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={item.title || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const items = programs.items.map((row, idx) => (idx === i ? { ...row, title: e.target.value } : row))
                      patch('programs.items', items)
                    }}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    className={ADMIN_TEXTAREA_CLASS}
                    rows={3}
                    value={item.desc || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const items = programs.items.map((row, idx) => (idx === i ? { ...row, desc: e.target.value } : row))
                      patch('programs.items', items)
                    }}
                  />
                </Field>
              </div>
            ))}
          </div>

          <Field label="Growth cycle eyebrow">
            <input className={ADMIN_INPUT_CLASS} value={growth.eyebrow || ''} disabled={!canEdit} onChange={(e) => patch('programs.growth_cycle', { ...growth, eyebrow: e.target.value })} />
          </Field>
          <Field label="Growth cycle title">
            <input className={ADMIN_INPUT_CLASS} value={growth.title || ''} disabled={!canEdit} onChange={(e) => patch('programs.growth_cycle', { ...growth, title: e.target.value })} />
          </Field>
          <div className="space-y-3">
            <p className={ADMIN_FIELD_LABEL}>Growth cycle steps</p>
            {(growth.items || []).map((item, i) => (
              <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Number">
                    <input
                      className={ADMIN_INPUT_CLASS}
                      value={item.num || ''}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const items = growth.items.map((row, idx) => (idx === i ? { ...row, num: e.target.value } : row))
                        patch('programs.growth_cycle', { ...growth, items })
                      }}
                    />
                  </Field>
                  <Field label="Title">
                    <input
                      className={ADMIN_INPUT_CLASS}
                      value={item.title || ''}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const items = growth.items.map((row, idx) => (idx === i ? { ...row, title: e.target.value } : row))
                        patch('programs.growth_cycle', { ...growth, items })
                      }}
                    />
                  </Field>
                </div>
                <Field label="Tagline">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={item.tagline || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const items = growth.items.map((row, idx) => (idx === i ? { ...row, tagline: e.target.value } : row))
                      patch('programs.growth_cycle', { ...growth, items })
                    }}
                  />
                </Field>
                <Field label="Body">
                  <textarea
                    className={ADMIN_TEXTAREA_CLASS}
                    rows={3}
                    value={item.body || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const items = growth.items.map((row, idx) => (idx === i ? { ...row, body: e.target.value } : row))
                      patch('programs.growth_cycle', { ...growth, items })
                    }}
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel title="Community & membership">
        <div className="space-y-6">
          <Field label="Eyebrow">
            <input className={ADMIN_INPUT_CLASS} value={community.eyebrow || ''} disabled={!canEdit} onChange={(e) => patch('community.eyebrow', e.target.value)} />
          </Field>
          <Field label="Headline">
            <input className={ADMIN_INPUT_CLASS} value={community.title || ''} disabled={!canEdit} onChange={(e) => patch('community.title', e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={ADMIN_TEXTAREA_CLASS} rows={3} value={community.description || ''} disabled={!canEdit} onChange={(e) => patch('community.description', e.target.value)} />
          </Field>

          <div className="space-y-3">
            <p className={ADMIN_FIELD_LABEL}>Membership tiers</p>
            {(community.tiers || []).map((tier, i) => (
              <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <Field label="Name">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={tier.name || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const tiers = community.tiers.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row))
                      patch('community.tiers', tiers)
                    }}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    className={ADMIN_TEXTAREA_CLASS}
                    rows={2}
                    value={tier.desc || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const tiers = community.tiers.map((row, idx) => (idx === i ? { ...row, desc: e.target.value } : row))
                      patch('community.tiers', tiers)
                    }}
                  />
                </Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Button label">
                    <input
                      className={ADMIN_INPUT_CLASS}
                      value={tier.cta || ''}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const tiers = community.tiers.map((row, idx) => (idx === i ? { ...row, cta: e.target.value } : row))
                        patch('community.tiers', tiers)
                      }}
                    />
                  </Field>
                  <Field label="Button link">
                    <input
                      className={ADMIN_INPUT_CLASS}
                      value={tier.to || ''}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const tiers = community.tiers.map((row, idx) => (idx === i ? { ...row, to: e.target.value } : row))
                        patch('community.tiers', tiers)
                      }}
                    />
                  </Field>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={Boolean(tier.featured)}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const tiers = community.tiers.map((row, idx) =>
                        idx === i ? { ...row, featured: e.target.checked } : { ...row, featured: false },
                      )
                      patch('community.tiers', tiers)
                    }}
                  />
                  Featured tier (Most Popular)
                </label>
              </div>
            ))}
          </div>

          <StringList
            label="Member benefits"
            values={community.benefits}
            canEdit={canEdit}
            onChange={(benefits) => patch('community.benefits', benefits)}
          />
        </div>
      </DashboardPanel>

      <DashboardPanel title="Impact stories & join CTA">
        <div className="space-y-6">
          <Field label="Stories eyebrow">
            <input className={ADMIN_INPUT_CLASS} value={testimonials.eyebrow || ''} disabled={!canEdit} onChange={(e) => patch('testimonials.eyebrow', e.target.value)} />
          </Field>
          <Field label="Stories headline">
            <input className={ADMIN_INPUT_CLASS} value={testimonials.title || ''} disabled={!canEdit} onChange={(e) => patch('testimonials.title', e.target.value)} />
          </Field>
          <Field label="Stories description">
            <textarea className={ADMIN_TEXTAREA_CLASS} rows={3} value={testimonials.description || ''} disabled={!canEdit} onChange={(e) => patch('testimonials.description', e.target.value)} />
          </Field>

          <div className="space-y-3">
            <p className={ADMIN_FIELD_LABEL}>Testimonial cards</p>
            {(testimonials.items || []).map((item, i) => (
              <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <Field label="Name">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={item.name || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const items = testimonials.items.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row))
                      patch('testimonials.items', items)
                    }}
                  />
                </Field>
                <Field label="Quote">
                  <textarea
                    className={ADMIN_TEXTAREA_CLASS}
                    rows={3}
                    value={item.quote || ''}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const items = testimonials.items.map((row, idx) => (idx === i ? { ...row, quote: e.target.value } : row))
                      patch('testimonials.items', items)
                    }}
                  />
                </Field>
                <ImageUrlField
                  label="Avatar (optional)"
                  value={item.avatar || ''}
                  disabled={!canEdit}
                  uploadFolder="cms"
                  onChange={(url) => {
                    const items = testimonials.items.map((row, idx) => (idx === i ? { ...row, avatar: url } : row))
                    patch('testimonials.items', items)
                  }}
                />
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
            <p className={ADMIN_FIELD_LABEL}>Join the movement CTA</p>
            <div className="mt-3 space-y-3">
              <Field label="Eyebrow">
                <input className={ADMIN_INPUT_CLASS} value={content.cta?.eyebrow || ''} disabled={!canEdit} onChange={(e) => patch('cta.eyebrow', e.target.value)} />
              </Field>
              <Field label="Headline">
                <input className={ADMIN_INPUT_CLASS} value={content.cta?.title || ''} disabled={!canEdit} onChange={(e) => patch('cta.title', e.target.value)} />
              </Field>
              <Field label="Body">
                <textarea className={ADMIN_TEXTAREA_CLASS} rows={3} value={content.cta?.body || ''} disabled={!canEdit} onChange={(e) => patch('cta.body', e.target.value)} />
              </Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Primary button label">
                  <input className={ADMIN_INPUT_CLASS} value={content.cta?.primary_label || ''} disabled={!canEdit} onChange={(e) => patch('cta.primary_label', e.target.value)} />
                </Field>
                <Field label="Primary button link">
                  <input className={ADMIN_INPUT_CLASS} value={content.cta?.primary_href || ''} disabled={!canEdit} onChange={(e) => patch('cta.primary_href', e.target.value)} />
                </Field>
                <Field label="Secondary button label">
                  <input className={ADMIN_INPUT_CLASS} value={content.cta?.secondary_label || ''} disabled={!canEdit} onChange={(e) => patch('cta.secondary_label', e.target.value)} />
                </Field>
                <Field label="Secondary button link">
                  <input className={ADMIN_INPUT_CLASS} value={content.cta?.secondary_href || ''} disabled={!canEdit} onChange={(e) => patch('cta.secondary_href', e.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        </div>
      </DashboardPanel>

      {canEdit && onSave ? (
        <button type="button" className={ADMIN_BTN_PRIMARY} disabled={saving} onClick={onSave}>
          {saving ? 'Saving…' : 'Save page sections'}
        </button>
      ) : null}
    </div>
  )
}
