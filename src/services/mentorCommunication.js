import { apiFetch } from '../lib/apiClient'
import { getSupabase } from '../lib/supabaseClient'

export const PEER_PROFILE_FIELDS =
  'user_id, full_name, email, role, status, profile_image_url, bio, phone, country, goals, skills, interests, joined_at'

const RECIPIENT_SELECT = `
  id,
  read,
  read_at,
  created_at,
  mentor_announcements (
    id,
    title,
    message,
    created_at,
    mentor_id
  )
`

export async function listMentorAnnouncements() {
  return apiFetch('/api/mentor/announcements', { method: 'GET' })
}

export async function sendMentorAnnouncement({ title, message }) {
  return apiFetch('/api/mentor/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, message }),
  })
}

export async function listMyMentorAnnouncementFeed() {
  const { data, error } = await getSupabase()
    .from('mentor_announcement_recipients')
    .select(RECIPIENT_SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function countUnreadMentorAnnouncements() {
  const { count, error } = await getSupabase()
    .from('mentor_announcement_recipients')
    .select('id', { count: 'exact', head: true })
    .eq('read', false)
  if (error) throw error
  return count || 0
}

export async function markMentorAnnouncementRead(recipientId) {
  const { data, error } = await getSupabase()
    .from('mentor_announcement_recipients')
    .update({ read: true })
    .eq('id', recipientId)
    .select('id, read, read_at')
    .single()
  if (error) throw error
  return data
}

export async function markAllMentorAnnouncementsRead() {
  const { error } = await getSupabase()
    .from('mentor_announcement_recipients')
    .update({ read: true })
    .eq('read', false)
  if (error) throw error
}

export async function getPeerProfile(userId) {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select(PEER_PROFILE_FIELDS)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Profile not found or access denied.')
  return data
}

export async function getMyMentorAssignment() {
  const { data: { user }, error: userErr } = await getSupabase().auth.getUser()
  if (userErr) throw userErr
  if (!user) return null

  const { data: link, error: linkErr } = await getSupabase()
    .from('mentor_students')
    .select('mentor_id')
    .eq('student_id', user.id)
    .maybeSingle()
  if (linkErr) throw linkErr
  if (!link?.mentor_id) return null

  const { data, error } = await getSupabase()
    .from('profiles')
    .select(PEER_PROFILE_FIELDS)
    .eq('user_id', link.mentor_id)
    .maybeSingle()
  if (error) throw error
  return { mentor_id: link.mentor_id, mentor: data }
}
