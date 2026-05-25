import { FunctionsHttpError } from '@supabase/supabase-js'
import { logActivity } from './activityLogs'
import { apiFetch } from '@/lib/apiClient'
import { getSupabase } from '@/lib/supabaseClient'

async function invokeApplicationDecision(body) {
  const { data, error } = await getSupabase().functions.invoke('application-decision', { body })
  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const payload = await error.context.json()
        throw new Error(payload?.error || error.message)
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== error.message) throw parseErr
      }
    }
    throw error
  }
  if (!data?.ok) throw new Error(data?.error || 'Request failed')
  return data
}

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

  return invokeApplicationDecision({
    action: 'approve',
    applicationId: app.id,
    applicantName: app.full_name,
    applicantEmail: app.email,
  })
}

export async function rejectApplication(applicationId, { rejectionReason = '' } = {}) {
  const { data: app, error: fetchErr } = await getSupabase()
    .from('applications')
    .select('id, full_name, email')
    .eq('id', applicationId)
    .single()
  if (fetchErr) throw fetchErr

  return invokeApplicationDecision({
    action: 'reject',
    applicationId: app.id,
    applicantName: app.full_name,
    applicantEmail: app.email,
    rejectionReason: rejectionReason || null,
  })
}

