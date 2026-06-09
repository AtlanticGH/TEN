import { useEffect, useState } from 'react'

function isLocalDev() {
  if (!import.meta.env.DEV) return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

async function apiHealthOk() {
  const res = await fetch('/api/healthz', { headers: { Accept: 'application/json' } })
  const text = await res.text()
  return res.ok && text.trim() === 'ok'
}

export function DevApiGuard({ children }) {
  const [apiDown, setApiDown] = useState(false)

  useEffect(() => {
    if (!isLocalDev()) return

    let cancelled = false

    ;(async () => {
      try {
        if (await apiHealthOk()) return
      } catch {
        // proxy down or dev server stopped
      }

      if (!cancelled) setApiDown(true)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (!apiDown) return children

  const devUrl = `${window.location.protocol}//${window.location.hostname}:5190`

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[9999] border-b border-orange-500/40 bg-zinc-950 px-4 py-3 text-center text-sm text-zinc-200 shadow-lg">
        <p>
          TEN API is not running on this port. Stop other dev servers (Ctrl+C), run{' '}
          <code className="text-orange-300">npm run dev</code>, then open{' '}
          <a href={`${devUrl}/admin`} className="font-semibold text-orange-400 underline">
            {devUrl}/admin
          </a>{' '}
          (see <code className="text-orange-300">.ten-dev-url</code>).
        </p>
      </div>
      <div className="pt-14">{children}</div>
    </>
  )
}
