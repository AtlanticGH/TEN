import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SharedProfileView } from '../../components/profile/SharedProfileView'
import { DashboardAlert, DashboardEmpty, DashboardPage, DashboardPageIntro } from '../../components/dashboard/DashboardChrome'
import { getMyMentorAssignment } from '../../services/mentorCommunication'

export function MemberMentorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assignment, setAssignment] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getMyMentorAssignment()
        if (!cancelled) setAssignment(data)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load mentor profile.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Mentor"
        title="Your mentor"
        description="Contact details and background for your assigned mentor."
      />

      {error ? <DashboardAlert message={error} /> : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : assignment?.mentor ? (
        <SharedProfileView profile={assignment.mentor} backTo="/member" backLabel="Dashboard" />
      ) : (
        <DashboardEmpty>
          No mentor is assigned yet.{' '}
          <Link to="/member" className="font-semibold text-orange-600 hover:underline dark:text-orange-400">
            Back to dashboard
          </Link>
        </DashboardEmpty>
      )}
    </DashboardPage>
  )
}
