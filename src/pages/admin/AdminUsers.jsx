import { useEffect, useState } from 'react'
import {
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  DashboardAlert,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { listAdminUsers, updateAdminUser } from '../../services/cms/users'

const ROLES = ['super_admin', 'admin', 'editor', 'viewer', 'staff']

export function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setUsers(await listAdminUsers())
    } catch (err) {
      setError(err?.message || 'Unable to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <DashboardSkeleton className="h-48" />

  return (
    <DashboardPage>
      <DashboardPageIntro label="Users" title="Team access" description="Assign roles for CMS access control." />
      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />

      <DashboardPanel>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {users.map((u) => (
            <li key={u.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{u.full_name || u.email}</p>
                <p className="text-xs text-zinc-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className={ADMIN_FIELD_LABEL}>Role</label>
                <select
                  className={ADMIN_INPUT_CLASS}
                  value={u.role}
                  onChange={async (e) => {
                    try {
                      await updateAdminUser(u.user_id, { role: e.target.value })
                      setNotice('Role updated.')
                      await load()
                    } catch (err) {
                      setError(err?.message || 'Update failed.')
                    }
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      </DashboardPanel>
    </DashboardPage>
  )
}
