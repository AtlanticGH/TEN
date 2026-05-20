import { apiFetch } from '@/lib/apiClient'

export type Team = {
  id: string
  name: string
  owner_user_id: string
  created_at: string
}

export async function listMyTeams(): Promise<Team[]> {
  // Prefer `useTeams()` for membership-aware data. Keep this for legacy callers.
  const memberships = (await apiFetch('/api/teams', { method: 'GET' })) as any[]
  return (memberships || []).map((m) => m?.teams).filter(Boolean) as Team[]
}

export async function createTeam(name: string): Promise<Team> {
  const trimmed = String(name || '').trim()
  if (!trimmed) throw new Error('Team name is required.')
  return (await apiFetch('/api/teams', { method: 'POST', body: JSON.stringify({ name: trimmed }) })) as Team
}

export async function listTeamMembers(teamId: string) {
  return await apiFetch(`/api/teams/${encodeURIComponent(teamId)}/members`, { method: 'GET' })
}

export async function addTeamMember({
  teamId,
  userId,
  role = 'member',
}: {
  teamId: string
  userId: string
  role?: 'member' | 'admin'
}) {
  await apiFetch(`/api/teams/${encodeURIComponent(teamId)}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId, role }),
  })
}

