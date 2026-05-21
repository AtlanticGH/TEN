import { useEffect } from 'react'
import { getSupabase } from '@/lib/supabaseClient'
import { queryClient } from '@/lib/queryClient'

export function useRealtime({ enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return undefined

    const client = getSupabase()
    const channel = client
      .channel('realtime-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        queryClient.invalidateQueries({ queryKey: ['teams'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        queryClient.invalidateQueries({ queryKey: ['teams'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        queryClient.invalidateQueries({ queryKey: ['member-dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['member-courses'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['member-dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['member-courses'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        queryClient.invalidateQueries({ queryKey: ['member-dashboard'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignment_submissions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['mentor-dashboard'] })
      })
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [enabled])
}
