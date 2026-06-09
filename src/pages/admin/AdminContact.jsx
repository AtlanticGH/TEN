import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FaqEditor } from '../../components/admin/FaqEditor'
import {
  DashboardAlert,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { CONTACT_FAQ_KEY, DEFAULT_CONTACT_FAQ, mergeFaqContent } from '../../config/faqContentDefaults'
import { useAuth } from '../../hooks/useAuth'
import { canEditContent } from '../../lib/rbac'
import { extractSiteContentValue, getSiteContent, upsertSiteContent } from '../../services/siteContent'

export function AdminContactPage() {
  const { profile } = useAuth()
  const canEdit = canEditContent(profile?.role)
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [faq, setFaq] = useState(() => mergeFaqContent(DEFAULT_CONTACT_FAQ, null))

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const row = await getSiteContent(CONTACT_FAQ_KEY)
        if (!alive) return
        setFaq(mergeFaqContent(DEFAULT_CONTACT_FAQ, extractSiteContentValue(row)))
      } catch (err) {
        if (alive) setError(err?.message || 'Unable to load contact FAQs.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const save = async () => {
    if (!canEdit) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await upsertSiteContent({ key: CONTACT_FAQ_KEY, value: faq })
      await queryClient.invalidateQueries({ queryKey: ['site-content', CONTACT_FAQ_KEY] })
      setNotice('Contact FAQs saved.')
    } catch (err) {
      setError(err?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardSkeleton className="h-64" />

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Contact"
        title="Contact page FAQs"
        description="Edit the accordion questions at the bottom of /contact."
        actions={
          <a href="/contact" target="_blank" rel="noreferrer" className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-orange-400 dark:border-zinc-600 dark:text-zinc-200">
            View Contact
          </a>
        }
      />
      {error ? <DashboardAlert message={error} /> : null}
      {notice ? <DashboardNotice message={notice} /> : null}
      <FaqEditor content={faq} onChange={setFaq} canEdit={canEdit} onSave={save} saving={saving} />
    </DashboardPage>
  )
}
