import { useEffect, useState } from 'react'
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_FIELD_LABEL,
  ADMIN_INPUT_CLASS,
  DashboardAlert,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { getAdminNavigation, updateNavigation } from '../../services/cms/navigation'

const MENUS = [
  { key: 'main', label: 'Header (main)' },
  { key: 'footer', label: 'Footer' },
]

function emptyItem() {
  return { label: '', href: '/', external: false, enabled: true }
}

export function AdminNavigationPage() {
  const [menuKey, setMenuKey] = useState('main')
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const nav = await getAdminNavigation(menuKey)
        if (!alive) return
        setItems(nav.items?.length ? nav.items : [emptyItem()])
      } catch (err) {
        if (alive) setError(err?.message || 'Unable to load navigation.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [menuKey])

  if (loading) return <DashboardSkeleton className="h-48" />

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Navigation"
        title="Menus"
        description="Edit header and footer links. Reorder by moving items up/down (drag-and-drop coming in builder v2)."
      />
      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />

      <div className="mb-4 flex flex-wrap gap-2">
        {MENUS.map((m) => (
          <button
            key={m.key}
            type="button"
            className={
              menuKey === m.key
                ? 'rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 dark:border-zinc-700'
            }
            onClick={() => setMenuKey(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <DashboardPanel>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="grid gap-2 rounded-md border border-zinc-200 p-3 sm:grid-cols-[1fr_1fr_auto] dark:border-zinc-800">
              <div>
                <label className={ADMIN_FIELD_LABEL}>Label</label>
                <input
                  className={ADMIN_INPUT_CLASS}
                  value={item.label}
                  onChange={(e) => {
                    const next = [...items]
                    next[i] = { ...next[i], label: e.target.value }
                    setItems(next)
                  }}
                />
              </div>
              <div>
                <label className={ADMIN_FIELD_LABEL}>URL</label>
                <input
                  className={ADMIN_INPUT_CLASS}
                  value={item.href}
                  onChange={(e) => {
                    const next = [...items]
                    next[i] = { ...next[i], href: e.target.value }
                    setItems(next)
                  }}
                />
              </div>
              <div className="flex items-end gap-2">
                <button type="button" className={ADMIN_BTN_SECONDARY} onClick={() => moveItem(i, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button
                  type="button"
                  className={ADMIN_BTN_SECONDARY}
                  onClick={() => moveItem(i, 1)}
                  disabled={i === items.length - 1}
                >
                  ↓
                </button>
                <button type="button" className={ADMIN_BTN_SECONDARY} onClick={() => setItems(items.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={ADMIN_BTN_SECONDARY} onClick={() => setItems([...items, emptyItem()])}>
            Add item
          </button>
          <button
            type="button"
            className={ADMIN_BTN_PRIMARY}
            onClick={async () => {
              setError('')
              try {
                await updateNavigation(menuKey, { items })
                setNotice(`${MENUS.find((m) => m.key === menuKey)?.label || 'Menu'} saved.`)
              } catch (err) {
                setError(err?.message || 'Save failed.')
              }
            }}
          >
            Save menu
          </button>
        </div>
      </DashboardPanel>
    </DashboardPage>
  )

  function moveItem(index, dir) {
    const j = index + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[index], next[j]] = [next[j], next[index]]
    setItems(next)
  }
}
