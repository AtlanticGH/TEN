import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%&*'
  const all = upper + lower + digits + symbols
  let pwd = ''
  pwd += upper[Math.floor(Math.random() * upper.length)]
  pwd += lower[Math.floor(Math.random() * lower.length)]
  pwd += digits[Math.floor(Math.random() * digits.length)]
  pwd += symbols[Math.floor(Math.random() * symbols.length)]
  for (let i = 0; i < 8; i++) {
    pwd += all[Math.floor(Math.random() * all.length)]
  }
  return pwd.split('').sort(() => Math.random() - 0.5).join('')
}

function firstName(fullName: string): string {
  const trimmed = String(fullName || '').trim()
  if (!trimmed) return 'there'
  return trimmed.split(/\s+/)[0]
}

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function emailShell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Ember Network</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          ${bodyHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function headerBlock(): string {
  return `<tr>
    <td style="background:#18181B;padding:32px 28px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
        The <span style="color:#F97316;">Ember Network</span>
      </p>
    </td>
  </tr>`
}

function footerBlock(): string {
  return `<tr>
    <td style="padding:24px 28px 32px;background:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#71717a;">
        <a href="mailto:info@theembernetwork.com" style="color:#71717a;text-decoration:none;">info@theembernetwork.com</a>
        &nbsp;·&nbsp; +233 50 940 4673
      </p>
      <p style="margin:0 0 8px;font-size:11px;color:#a1a1aa;">You received this email because of your application to The Ember Network.</p>
      <p style="margin:0;font-size:13px;font-style:italic;color:#F97316;font-weight:600;">Small Sparks Ignite Big Dreams</p>
    </td>
  </tr>`
}

function acceptanceEmailHtml(params: {
  first: string
  applicantEmail: string
  tempPassword: string
  siteUrl: string
}): string {
  const loginUrl = `${params.siteUrl.replace(/\/$/, '')}/login`
  const body = `
  ${headerBlock()}
  <tr>
    <td style="padding:32px 28px 8px;">
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#18181B;line-height:1.25;">
        Congratulations, ${escapeHtml(params.first)}! 🔥
      </h1>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#3f3f46;">
        We are thrilled to welcome you into The Ember Network. Your application stood out, and we cannot wait to see what you build with mentorship, structure, and a community that shows up for founders.
      </p>
      <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#3f3f46;">
        Your member account is ready. Use the credentials below to sign in and explore your dashboard.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#fafafa;border:1px solid #e4e4e7;border-radius:12px;">
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#71717a;">Login credentials</p>
            <p style="margin:0 0 8px;font-size:14px;color:#18181B;"><strong>Email:</strong> ${escapeHtml(params.applicantEmail)}</p>
            <p style="margin:0;font-size:14px;color:#18181B;"><strong>Temporary password:</strong>
              <code style="font-family:ui-monospace,Menlo,monospace;font-size:15px;color:#18181B;background:#fff;padding:4px 8px;border-radius:6px;border:1px solid #e4e4e7;">${escapeHtml(params.tempPassword)}</code>
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 24px;font-size:14px;font-weight:700;color:#b45309;">
        ⚠ Please change your password immediately after your first login.
      </p>
      <p style="margin:0 0 28px;text-align:center;">
        <a href="${loginUrl}" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:999px;">
          Access Your Dashboard →
        </a>
      </p>
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#F97316;">What is waiting for you</p>
      <ul style="margin:0;padding:0 0 0 20px;color:#3f3f46;font-size:14px;line-height:1.7;">
        <li>Access to all mentorship programs and learning paths</li>
        <li>Exclusive founder community and peer accountability groups</li>
        <li>Direct connection to mentors and industry experts</li>
      </ul>
    </td>
  </tr>
  ${footerBlock()}`
  return emailShell(body)
}

function rejectionEmailHtml(params: {
  first: string
  rejectionReason: string | null
}): string {
  const reasonBlock =
    params.rejectionReason && params.rejectionReason.trim()
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;background:#fafafa;border-left:4px solid #F97316;border-radius:8px;">
          <tr>
            <td style="padding:16px 18px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#71717a;">A note from our team</p>
              <p style="margin:0;font-size:14px;line-height:1.65;color:#3f3f46;font-style:italic;">${escapeHtml(params.rejectionReason.trim())}</p>
            </td>
          </tr>
        </table>`
      : ''

  const body = `
  ${headerBlock()}
  <tr>
    <td style="padding:32px 28px 8px;">
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#18181B;line-height:1.25;">
        Thank you, ${escapeHtml(params.first)}
      </h1>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#3f3f46;">
        Thank you sincerely for applying to The Ember Network and for sharing your vision with us. We know how much care goes into every application, and we appreciate the time you invested.
      </p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#3f3f46;">
        After careful review, we are not able to offer membership at this time.
      </p>
      ${reasonBlock}
      <p style="margin:20px 0 0;font-size:15px;line-height:1.65;color:#3f3f46;">
        We encourage you to reapply in three to six months as your venture evolves. You are always welcome to follow TEN on social media and join our public events to stay connected with the community.
      </p>
    </td>
  </tr>
  ${footerBlock()}`
  return emailShell(body)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Method not allowed' })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendKey = Deno.env.get('RESEND_API_KEY') ?? ''
    const emailFrom = Deno.env.get('EMAIL_FROM') ?? ''
    const siteUrl = (Deno.env.get('VITE_SITE_URL') || Deno.env.get('SITE_URL') || 'http://localhost:5173').replace(
      /\/$/,
      '',
    )

    if (!supabaseUrl || !serviceKey) {
      return jsonResponse(500, { ok: false, error: 'Server configuration error' })
    }
    if (!resendKey || !emailFrom) {
      return jsonResponse(500, { ok: false, error: 'Email service is not configured (RESEND_API_KEY / EMAIL_FROM)' })
    }

    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    if (!token) {
      return jsonResponse(401, { ok: false, error: 'Missing authorization token' })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: userData, error: userErr } = await supabaseUser.auth.getUser(token)
    if (userErr || !userData?.user?.id) {
      return jsonResponse(401, { ok: false, error: 'Invalid session' })
    }

    const { data: staffProfile, error: staffErr } = await supabaseAdmin
      .from('profiles')
      .select('role, status')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (staffErr) {
      return jsonResponse(500, { ok: false, error: staffErr.message })
    }
    if (
      !staffProfile ||
      staffProfile.status !== 'active' ||
      !['admin', 'super_admin'].includes(String(staffProfile.role))
    ) {
      return jsonResponse(403, { ok: false, error: 'Forbidden' })
    }

    const body = await req.json()
    const action = String(body?.action ?? '')
    const applicationId = String(body?.applicationId ?? '')
    const applicantName = String(body?.applicantName ?? '')
    const applicantEmail = String(body?.applicantEmail ?? '').trim().toLowerCase()
    const rejectionReason = body?.rejectionReason != null ? String(body.rejectionReason).trim().slice(0, 800) : null

    if (!['approve', 'reject'].includes(action)) {
      return jsonResponse(400, { ok: false, error: 'Invalid action' })
    }
    if (!applicationId || !applicantEmail) {
      return jsonResponse(400, { ok: false, error: 'Missing applicationId or applicantEmail' })
    }

    const { data: app, error: appErr } = await supabaseAdmin
      .from('applications')
      .select('id, status, email, full_name, invited_user_id')
      .eq('id', applicationId)
      .single()

    if (appErr || !app) {
      return jsonResponse(404, { ok: false, error: 'Application not found' })
    }

    const resend = new Resend(resendKey)
    const nowIso = new Date().toISOString()
    const first = firstName(applicantName || app.full_name || '')

    if (action === 'approve') {
      if (app.status === 'rejected') {
        return jsonResponse(409, { ok: false, error: 'Application already rejected' })
      }
      if (app.invited_user_id) {
        return jsonResponse(409, { ok: false, error: 'Account already created for this application' })
      }

      const tempPassword = generateTempPassword()

      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: applicantEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: applicantName || app.full_name || '',
          force_password_reset: true,
        },
      })

      if (createErr) {
        const already =
          createErr.message?.includes('already been registered') ||
          createErr.message?.includes('already registered')
        if (!already) {
          return jsonResponse(500, { ok: false, error: createErr.message })
        }
        return jsonResponse(500, {
          ok: false,
          error: 'A user with this email already exists. Link or promote them manually.',
        })
      }

      const userId = created?.user?.id
      if (!userId) {
        return jsonResponse(500, { ok: false, error: 'User creation failed (no id)' })
      }

      const { error: profErr } = await supabaseAdmin.from('profiles').upsert(
        {
          user_id: userId,
          email: applicantEmail,
          full_name: applicantName || app.full_name || '',
          role: 'student',
          status: 'active',
        },
        { onConflict: 'user_id' },
      )
      if (profErr) {
        return jsonResponse(500, { ok: false, error: profErr.message })
      }

      const { error: updErr } = await supabaseAdmin
        .from('applications')
        .update({
          status: 'approved',
          invited_user_id: userId,
          invited_at: nowIso,
          decision_email_sent_at: nowIso,
          decision_email_type: 'approved',
        })
        .eq('id', applicationId)

      if (updErr) {
        return jsonResponse(500, { ok: false, error: updErr.message })
      }

      await supabaseAdmin
        .from('activity_logs')
        .insert({
          actor_user_id: userData.user.id,
          action: 'application_approved',
          entity_type: 'application',
          entity_id: applicationId,
          metadata_json: { applicant_email: applicantEmail },
        })
        .then(() => {})
        .catch(() => {})

      try {
        const { data: emailData, error: emailErr } = await resend.emails.send({
          from: emailFrom,
          to: applicantEmail,
          subject: `Welcome to The Ember Network, ${first}! 🔥`,
          html: acceptanceEmailHtml({
            first,
            applicantEmail,
            tempPassword,
            siteUrl,
          }),
        })
        if (emailErr) throw emailErr
        return jsonResponse(200, {
          ok: true,
          action: 'approve',
          emailId: emailData?.id ?? null,
          emailWarning: false,
        })
      } catch {
        return jsonResponse(200, {
          ok: true,
          action: 'approve',
          emailWarning: true,
          error: 'Account created but welcome email could not be sent',
        })
      }
    }

    // reject
    if (app.invited_user_id) {
      return jsonResponse(409, { ok: false, error: 'Cannot reject: account already created' })
    }

    const { error: updErr } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason || null,
        decision_email_sent_at: nowIso,
        decision_email_type: 'rejected',
      })
      .eq('id', applicationId)

    if (updErr) {
      return jsonResponse(500, { ok: false, error: updErr.message })
    }

    await supabaseAdmin
      .from('activity_logs')
      .insert({
        actor_user_id: userData.user.id,
        action: 'application_rejected',
        entity_type: 'application',
        entity_id: applicationId,
        metadata_json: { applicant_email: applicantEmail },
      })
      .then(() => {})
      .catch(() => {})

    const { data: emailData, error: emailErr } = await resend.emails.send({
      from: emailFrom,
      to: applicantEmail,
      subject: 'Your Ember Network Application — An Update',
      html: rejectionEmailHtml({ first, rejectionReason }),
    })

    if (emailErr) {
      return jsonResponse(500, { ok: false, error: `Rejected in database but email failed: ${emailErr.message}` })
    }

    return jsonResponse(200, {
      ok: true,
      action: 'reject',
      emailId: emailData?.id ?? null,
      emailWarning: false,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return jsonResponse(500, { ok: false, error: message })
  }
})
