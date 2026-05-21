import nodemailer from 'nodemailer'

function getEnv(name) {
  return process.env[name] || ''
}

function createTransport() {
  const host = getEnv('SMTP_HOST')
  const port = Number(getEnv('SMTP_PORT') || '587')
  const user = getEnv('SMTP_USER')
  const pass = getEnv('SMTP_PASS')

  if (!host || !port || !user || !pass) {
    throw new Error('Missing SMTP env vars (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

function baseEmail() {
  const from = getEnv('EMAIL_FROM')
  if (!from) throw new Error('Missing EMAIL_FROM env var')
  return { from }
}

export async function sendApprovedEmail({ to, fullName, loginUrl, tempPassword }) {
  const transport = createTransport()
  const { from } = baseEmail()

  const safeName = fullName || 'there'
  const subject = 'Your Application Has Been Approved'

  const text = [
    `Hi ${safeName},`,
    '',
    'Welcome to The Ember Network — your application has been approved.',
    '',
    `Login URL: ${loginUrl}`,
    `Email (username): ${to}`,
    `Temporary password: ${tempPassword}`,
    '',
    'Important: Please change your password immediately after your first login.',
    '',
    '— The Ember Network',
  ].join('\n')

  return await transport.sendMail({ from, to, subject, text })
}

export async function sendRejectedEmail({ to, fullName, reason }) {
  const transport = createTransport()
  const { from } = baseEmail()

  const safeName = fullName || 'there'
  const subject = 'Application Status Update'

  const text = [
    `Hi ${safeName},`,
    '',
    'Thank you for applying to The Ember Network.',
    'After review, we’re unable to move forward with your application at this time.',
    reason ? '' : null,
    reason ? `Reason: ${reason}` : null,
    '',
    'You’re welcome to reapply in the future as your goals and stage evolve.',
    '',
    '— The Ember Network',
  ]
    .filter(Boolean)
    .join('\n')

  return await transport.sendMail({ from, to, subject, text })
}

export async function sendAnnouncementEmail({ to, fullName, mentorName, title, body, dashboardUrl }) {
  const transport = createTransport()
  const { from } = baseEmail()

  const safeName = fullName || 'there'
  const fromLabel = mentorName ? `${mentorName} (your mentor)` : 'Your mentor'
  const subject = title ? `Update from ${fromLabel}: ${title}` : `New message from ${fromLabel}`

  const text = [
    `Hi ${safeName},`,
    '',
    `${fromLabel} shared an announcement with you on The Ember Network:`,
    '',
    title ? title : '(Announcement)',
    '',
    body || '',
    '',
    dashboardUrl ? `View your dashboard: ${dashboardUrl}` : null,
    '',
    'You will also see this in your dashboard notifications.',
    '',
    '— The Ember Network',
  ]
    .filter((line) => line !== null)
    .join('\n')

  return await transport.sendMail({ from, to, subject, text })
}

