import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMyProfile } from '../services/db'
import { AuthContext } from './AuthContextBase'
import { getSupabase, supabaseIsConfigured } from '@/lib/supabaseClient'
import { isAdminRole, isSuperAdmin as checkSuperAdmin } from '../lib/rbac'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    try {
      if (!user) {
        setProfile(null)
        setProfileError(null)
        return null
      }
      const p = await getMyProfile()
      setProfile(p)
      setProfileError(null)
      return p
    } catch (err) {
      setProfile(null)
      setProfileError(err?.message || 'Could not load profile')
      return null
    }
  }, [user])

  useEffect(() => {
    let ignore = false

    const init = async () => {
      setLoading(true)

      if (!supabaseIsConfigured) {
        if (!ignore) setLoading(false)
        return
      }

      const { data, error } = await getSupabase().auth.getSession()
      if (ignore) return
      if (!error) {
        setSession(data.session || null)
        setUser(data.session?.user || null)
      }
      setLoading(false)
    }

    init()

    if (!supabaseIsConfigured) {
      return () => { ignore = true }
    }

    const { data: sub } = getSupabase().auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user || null)
    })

    return () => {
      ignore = true
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setProfileError(null)
      setProfileLoading(false)
      return
    }

    let cancelled = false
    setProfileLoading(true)
    refreshProfile().finally(() => {
      if (!cancelled) setProfileLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [user, refreshProfile])

  const value = useMemo(
    () => ({
      loading,
      session,
      user,
      profile,
      profileError,
      profileLoading,
      refreshProfile,
      isAuthed: !!user,
      isAdmin: isAdminRole(profile?.role),
      isSuperAdmin: checkSuperAdmin(profile?.role),
      authMode: 'supabase',
    }),
    [loading, session, user, profile, profileError, profileLoading, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

