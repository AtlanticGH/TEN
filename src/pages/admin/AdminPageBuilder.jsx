import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ADMIN_BTN_SECONDARY,
  DashboardAlert,
  DashboardPage,
  DashboardPageIntro,
} from '../../components/dashboard/DashboardChrome'
import { BLOCK_BUILDER_DISABLED_MESSAGE } from '../../lib/cmsBlocksPolicy'

/** Block builder is disabled — redirect or show notice. */
export function AdminPageBuilderPage() {
  const { pageSlug } = useParams()

  if (pageSlug === 'gallery') return <Navigate to="/admin/gallery" replace />
  if (pageSlug === 'home') return <Navigate to="/admin/home" replace />
  if (pageSlug === 'programs') return <Navigate to="/admin/programs" replace />

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Page builder"
        title="Block editing disabled"
        description={BLOCK_BUILDER_DISABLED_MESSAGE}
        actions={
          <Link to="/admin/overview" className={ADMIN_BTN_SECONDARY}>
            Back to dashboard
          </Link>
        }
      />
      <DashboardAlert message={BLOCK_BUILDER_DISABLED_MESSAGE} />
    </DashboardPage>
  )
}
