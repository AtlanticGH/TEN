import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyProfile } from '../services/db'
import { AuthContext } from './AuthContextBase'
import { getSupabase, supabaseIsConfigured } from '@/lib/supabaseClient'
import { RealtimeSync } from '@/components/system/RealtimeSync'

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(!supabaseIsConfigured)

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getMyProfile(),
    enabled: !!user && supabaseIsConfigured,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    let ignore = false

    const init = async () => {
      if (!supabaseIsConfigured) {
        if (!ignore) setAuthReady(true)
        return
      }

      const { data, error } = await getSupabase().auth.getSession()
      if (ignore) return
      if (!error) {
        setSession(data.session || null)
        setUser(data.session?.user || null)
      }
      setAuthReady(true)
    }

    init()

    if (!supabaseIsConfigured) {
      return () => {
        ignore = true
      }
    }

    const { data: sub } = getSupabase().auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user || null)
      if (!nextSession?.user) {
        queryClient.removeQueries({ queryKey: ['profile'] })
        queryClient.removeQueries({ queryKey: ['teams'] })
      }
    })

    return () => {
      ignore = true
      sub?.subscription?.unsubscribe?.()
    }
  }, [queryClient])

  const refreshProfile = useCallback(async () => {
    if (!user) return null
    const result = await profileQuery.refetch()
    return result.data ?? null
  }, [user, profileQuery])

  const loading = !authReady || (!!user && profileQuery.isPending && !profileQuery.isError)

  const value = useMemo(
    () => ({
      loading,
      session,
      user,
      profile: profileQuery.data ?? null,
      profileError: profileQuery.error?.message || null,
      refreshProfile,
      isAuthed: !!user,
      authMode: 'supabase',
    }),
    [loading, session, user, profileQuery.data, profileQuery.error, refreshProfile],
  )

  return (
    <AuthContext.Provider value={value}>
      {supabaseIsConfigured && user ? <RealtimeSync /> : null}
      {children}
    </AuthContext.Provider>
  )
}
