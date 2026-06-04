import { Link } from 'react-router-dom'
import { PageMeta } from '../components/cms/PageMeta'

export function NotFoundPage() {
  return (
    <>
      <PageMeta title="Page not found" />
      <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Page not found</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Back to home
        </Link>
      </main>
    </>
  )
}
