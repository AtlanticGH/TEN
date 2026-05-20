import { logActivity } from './activityLogs'
import { apiFetch } from '@/lib/apiClient'

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
  return await apiFetch('/api/applications/approve', { method: 'POST', body: JSON.stringify({ applicationId }) })
}

export async function rejectApplication(applicationId, { rejectionReason = '' } = {}) {
  return await apiFetch('/api/applications/reject', { method: 'POST', body: JSON.stringify({ applicationId, rejectionReason }) })
}

