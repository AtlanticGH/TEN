import { useState } from 'react'

export function FaqAccordion({ content, sectionId = 'faqs', className = '' }) {
  const [open, setOpen] = useState(null)
  const eyebrow = content?.eyebrow || 'FAQs'
  const title = content?.title || 'Frequently asked questions'
  const items = content?.items || []

  if (!items.length) return null

  return (
    <section id={sectionId} className={`mx-auto max-w-7xl px-8 pb-20 md:px-12 lg:px-10 ${className}`.trim()}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="text-xs uppercase tracking-[0.18em] text-orange-400">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{title}</h2>
        <div className="mt-5 space-y-3">
          {items.map((f, idx) => {
            const isOpen = open === idx
            return (
              <div key={f.q || idx} className="rounded-xl border border-zinc-800 bg-zinc-900">
                <button
                  type="button"
                  aria-expanded={isOpen ? 'true' : 'false'}
                  onClick={() => setOpen((v) => (v === idx ? null : idx))}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-zinc-200"
                >
                  {f.q} <span>{isOpen ? '–' : '+'}</span>
                </button>
                {isOpen ? (
                  <div className="border-t border-zinc-800 px-4 py-3 text-sm text-zinc-300">{f.a}</div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
