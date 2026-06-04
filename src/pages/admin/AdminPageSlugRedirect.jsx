import { Navigate, useParams } from 'react-router-dom'

/** Legacy /admin/pages/:slug routes → overview or dedicated editors. */
export function AdminPageSlugRedirect() {
  const { pageSlug } = useParams()
  if (pageSlug === 'media') return <Navigate to="/admin/media" replace />
  if (pageSlug === 'gallery') return <Navigate to="/admin/gallery" replace />
  if (pageSlug === 'home') return <Navigate to="/admin/home" replace />
  if (pageSlug === 'programs') return <Navigate to="/admin/programs" replace />
  if (!pageSlug) return <Navigate to="/admin/overview" replace />
  return <Navigate to="/admin/overview" replace />
}
