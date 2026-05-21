import { useRealtime } from '@/hooks/useRealtime'
import { useAuth } from '@/hooks/useAuth'

/** Subscribes to Supabase realtime when the user is authenticated. */
export function RealtimeSync() {
  const { isAuthed } = useAuth()
  useRealtime({ enabled: isAuthed })
  return null
}
