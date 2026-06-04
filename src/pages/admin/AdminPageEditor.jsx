import { Navigate, useParams } from 'react-router-dom'
import { getAdminSitePage } from '../../config/adminSitePages'
import { AdminContentPage } from './AdminContent'
import { AdminPageSections } from './AdminPageSections'

export function AdminPageEditor() {
  const { pageSlug } = useParams()
  const page = getAdminSitePage(pageSlug)

  if (!page) {
    return <Navigate to="/admin/pages/home" replace />
  }

  if (page.hasHero) {
    return <AdminContentPage />
  }

  if (page.slug === 'resources') {
    return <Navigate to="/admin/resources" replace />
  }

  return (
    <div className="space-y-10">
      <AdminPageSections pageKey={page.slug} />
    </div>
  )
}
