import { lazy } from 'react'

const CHUNK_RELOAD_KEY = 'ten-chunk-reload'

function isChunkLoadError(error) {
  const message = error instanceof Error ? error.message : String(error || '')
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module')
  )
}

/**
 * Lazy-load a route chunk and reload once if the browser has a stale bundle
 * after a new deployment (missing hashed asset file).
 */
export function lazyWithRetry(importFn) {
  return lazy(() =>
    importFn()
      .then((module) => {
        sessionStorage.removeItem(CHUNK_RELOAD_KEY)
        return module
      })
      .catch((error) => {
        if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
          window.location.reload()
          return new Promise(() => {})
        }
        sessionStorage.removeItem(CHUNK_RELOAD_KEY)
        throw error
      }),
  )
}
