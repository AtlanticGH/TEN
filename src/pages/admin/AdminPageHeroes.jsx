import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeroEditorPanel } from '../../components/admin/PageHeroEditorPanel'
import {
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
} from '../../components/dashboard/DashboardChrome'
import { PAGE_HERO_PAGES } from '../../config/pageHeroDefaults'
import { useAuth } from '../../hooks/useAuth'
import { canEditContent } from '../../lib/rbac'

const TABS = [
  { id: 'home', label: 'Homepage', path: '/', adminPath: '/admin/home', isHome: true },
  ...PAGE_HERO_PAGES.map((p) => ({ id: p.slug, label: p.label, path: p.path, isHome: false, ...p })),
]

export function AdminPageHeroesPage() {
  const { profile } = useAuth()
  const canEdit = canEditContent(profile?.role)
  const [tab, setTab] = useState('about')
  const active = TABS.find((t) => t.id === tab) || TABS[1]

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Page heroes"
        title="Page heroes"
        description="Edit the hero image and headline on each public page (About → Programs → Resources → Gallery → Community → Contact). Homepage hero is edited separately."
      />

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DashboardPanel className="mt-6">
        {active.isHome ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The homepage uses a full-screen hero with optional background video, managed on the Homepage screen.
            </p>
            <Link
              to="/admin/home"
              className="inline-flex rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400"
            >
              Edit homepage hero →
            </Link>
            <a href="/" target="_blank" rel="noreferrer" className="ml-3 text-sm font-medium text-zinc-600 hover:text-orange-600 dark:text-zinc-400">
              View homepage
            </a>
          </div>
        ) : (
          <PageHeroEditorPanel
            slug={active.id}
            label={active.label}
            path={active.path}
            uploadFolder={active.uploadFolder}
            canEdit={canEdit}
          />
        )}
      </DashboardPanel>
    </DashboardPage>
  )
}
