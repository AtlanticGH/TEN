import { apiFetch } from '@/lib/apiClient'
import { getSupabase } from '@/lib/supabaseClient'

/** Load profile via API; fall back to Supabase when the API is unreachable. */
export async function getMyProfile() {
  try {
    return await apiFetch('/api/profile', { method: 'GET' })
  } catch (apiErr) {
    const { data: userData, error: userErr } = await getSupabase().auth.getUser()
    if (userErr || !userData?.user?.id) throw apiErr

    const { data, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (error) {
      const err = new Error(error.message || apiErr.message)
      err.cause = apiErr
      throw err
    }
    if (!data) throw apiErr
    return data
  }
}

export async function updateMyProfile(patch) {
  return await apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(patch || {}) })
}
