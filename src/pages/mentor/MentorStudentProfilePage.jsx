import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SharedProfileView } from '../../components/profile/SharedProfileView'
import { DashboardAlert, DashboardPage, DashboardPageIntro } from '../../components/dashboard/DashboardChrome'
import { getPeerProfile } from '../../services/mentorCommunication'

export function MentorStudentProfilePage() {
  const { userId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getPeerProfile(userId)
        if (!cancelled) setProfile(data)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load student profile.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  return (
    <DashboardPage>
      <DashboardPageIntro label="Student" title="Student profile" description="Shared profile fields for your assigned student." />
      {error ? <DashboardAlert message={error} /> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : profile ? (
        <SharedProfileView profile={profile} backTo="/mentor/students" backLabel="Students" />
      ) : null}
    </DashboardPage>
  )
}
