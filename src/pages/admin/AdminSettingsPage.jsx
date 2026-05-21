import { useEffect, useState } from 'react'
import {
  ADMIN_FIELD_LABEL,
  ADMIN_TEXTAREA_CLASS,
  DashboardAlert,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { SITE_BTN_PRIMARY } from '../../components/ui/siteDesignTokens'
import { getSiteContent, upsertSiteContent } from '../../services/siteContent'

const SETTINGS_KEY = 'admin.settings.v1'

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [orgName, setOrgName] = useState('The Ember Network')
  const [supportEmail, setSupportEmail] = useState('hello@ember.network')

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const row = await getSiteContent(SETTINGS_KEY)
        if (!alive) return
        const v = row?.value || {}
        setOrgName(v.orgName || 'The Ember Network')
        setSupportEmail(v.supportEmail || 'hello@ember.network')
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load settings.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [])

  if (loading) {
    return (
      <DashboardPage>
        <DashboardSkeleton className="h-8 w-48" />
        <DashboardSkeleton className="h-64 max-w-xl" />
      </DashboardPage>
    )
  }

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Settings"
        title="Branding & contact"
        description={`Stored in site_content (key ${SETTINGS_KEY}). Extend with email templates and feature flags.`}
      />

      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />

      <DashboardPanel className="max-w-xl">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            setError('')
            setNotice('')
            try {
              await upsertSiteContent({
                key: SETTINGS_KEY,
                value: {
                  orgName: orgName.trim(),
                  supportEmail: supportEmail.trim(),
                },
              })
              setNotice('Settings saved.')
            } catch (err) {
              setError(err?.message || 'Unable to save.')
            } finally {
              setSaving(false)
            }
          }}
        >
          <div>
            <label className={`block ${ADMIN_FIELD_LABEL}`}>Organization name</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className={`mt-2 ${ADMIN_TEXTAREA_CLASS}`}
            />
          </div>
          <div>
            <label className={`block ${ADMIN_FIELD_LABEL}`}>Support email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className={`mt-2 ${ADMIN_TEXTAREA_CLASS}`}
            />
          </div>
          <button type="submit" disabled={saving} className={`${SITE_BTN_PRIMARY} disabled:opacity-60`}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      </DashboardPanel>
    </DashboardPage>
  )
}
