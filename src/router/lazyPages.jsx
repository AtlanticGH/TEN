import { Suspense } from 'react'

export function PageFallback({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
            <span className="text-sm text-zinc-500">Loading…</span>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
