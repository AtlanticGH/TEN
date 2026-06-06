import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

function isChunkLoadError(error) {
  const message = error instanceof Error ? error.message : String(error || '')
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module')
  )
}

export function RouterErrorBoundary() {
  const error = useRouteError()

  const is404 = isRouteErrorResponse(error) && error.status === 404
  const isStaleChunk = isChunkLoadError(error)

  const title = is404
    ? 'Page not found'
    : isStaleChunk
      ? 'Update available'
      : isRouteErrorResponse(error)
        ? `${error.status} — ${error.statusText}`
        : 'Something went wrong'

  const message = is404
    ? "We couldn't find the page you were looking for."
    : isStaleChunk
      ? 'A new version of the site was deployed. Reload the page to continue.'
      : error instanceof Error
        ? error.message
        : 'An unexpected error occurred. Please try again.'

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center dark:bg-zinc-950">
      <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
        {is404 ? '404' : isStaleChunk ? 'Refresh needed' : 'Error'}
      </p>
      <h1 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-zinc-500 dark:text-zinc-400">
        {message}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {isStaleChunk ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            Reload page
          </button>
        ) : null}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
