import { uploadMyAvatar } from '@/lib/avatars'
import { apiFetch } from '@/lib/apiClient'

export async function updateProfile({
  username,
  avatarFile,
}: {
  username?: string
  avatarFile?: File | null
}) {
  let avatar_path: string | undefined
  if (avatarFile) {
    avatar_path = await uploadMyAvatar(avatarFile)
  }

  const patch: Record<string, any> = {}
  if (typeof username === 'string') patch.username = username.trim() || null
  if (avatar_path) patch.avatar_path = avatar_path

  await apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(patch) })
}

