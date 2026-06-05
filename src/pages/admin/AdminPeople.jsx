import { Navigate, useSearchParams } from 'react-router-dom'

/** Legacy route — redirects to unified About CMS (torchbearer → homepage). */
export function AdminPeoplePage() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  if (tab === 'torchbearer') return <Navigate to="/admin/home?tab=torchbearer" replace />
  const legacyTab = tab === 'team' ? 'team' : 'founder'
  return <Navigate to={`/admin/about?tab=${legacyTab}`} replace />
}
