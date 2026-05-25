import { logActivity } from './activityLogs'
import { apiFetch } from '@/lib/apiClient'
import { getSupabase } from '@/lib/supabaseClient'

export async function listAdminSummary() {
  return await apiFetch('/api/admin/summary', { method: 'GET' })
}

export async function listApplications() {
  return await apiFetch('/api/admin/applications', { method: 'GET' })
}

export async function updateApplicationStatus(id, status) {
  const data = await apiFetch(`/api/admin/applications/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
  try {
    await logActivity({
      action: 'application_status_changed',
      entityType: 'application',
      entityId: id,
      metadata: { status },
    })
  } catch {
    // non-fatal if audit table not migrated yet
  }
  return data
}

export async function updateApplication(id, patch) {
  const data = await apiFetch(`/api/admin/applications/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
  try {
    await logActivity({
      action: 'application_updated',
      entityType: 'application',
      entityId: id,
      metadata: { keys: Object.keys(patch || {}) },
    })
  } catch {
    // ignore audit failures
  }
  return data
}

export async function inviteApprovedApplicant(applicationId, { role = 'student' } = {}) {
  return await apiFetch('/api/inviteApplicant', { method: 'POST', body: JSON.stringify({ applicationId, role }) })
}

export async function approveApplication(applicationId) {
  const { data: app, error: fetchErr } = await getSupabase()
    .from('applications')
    .select('id, full_name, email')
    .eq('id', applicationId)
    .single()
  if (fetchErr) throw fetchErr

  const { data, error } = await getSupabase().functions.invoke('application-decision', {
    body: {
      action: 'approve',
      applicationId: app.id,
      applicantName: app.full_name,
      applicantEmail: app.email,
    },
  })
  if (error) throw error
  if (!data?.ok) throw new Error(data?.error || 'Approval failed')
  return data
}

export async function rejectApplication(applicationId, { rejectionReason = '' } = {}) {
  const { data: app, error: fetchErr } = await getSupabase()
    .from('applications')
    .select('id, full_name, email')
    .eq('id', applicationId)
    .single()
  if (fetchErr) throw fetchErr

  const { data, error } = await getSupabase().functions.invoke('application-decision', {
    body: {
      action: 'reject',
      applicationId: app.id,
      applicantName: app.full_name,
      applicantEmail: app.email,
      rejectionReason: rejectionReason || null,
    },
  })
  if (error) throw error
  if (!data?.ok) throw new Error(data?.error || 'Rejection failed')
  return data
}

