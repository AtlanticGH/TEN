import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

export function RouterErrorBoundary() {
  const error = useRouteError()

  const is404 =
    !error ||
    (isRouteErrorResponse(error) && error.status === 404)

  const title = is404
    ? 'Page not found'
    : isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : 'Something went wrong'

  const message = is404
    ? "We couldn't find the page you were looking for."
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred. Please try again.'

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center dark:bg-zinc-950">
      <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
        {is404 ? '404' : 'Error'}
      </p>
      <h1 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-zinc-500 dark:text-zinc-400">
        {message}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
      >
        ← Back to home
      </Link>
    </div>
  )
}
