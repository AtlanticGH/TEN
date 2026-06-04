/** Renders legacy cms_content section rows (page_key + section_key). */
export function CmsSectionsRenderer({ sections }) {
  if (!sections?.length) return null
  return (
    <div className="cms-sections space-y-16 py-16">
      {sections.map((row) => (
        <section
          key={row.id || `${row.page_key}-${row.section_key}`}
          id={row.section_key}
          data-section={row.section_key}
          className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10"
        >
          {row.title ? <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{row.title}</h2> : null}
          {row.media_url ? (
            <img src={row.media_url} alt="" className="mt-6 max-h-[420px] w-full rounded-2xl object-cover" loading="lazy" />
          ) : null}
          {row.body ? (
            <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">{row.body}</p>
            </div>
          ) : null}
        </section>
      ))}
    </div>
  )
}
