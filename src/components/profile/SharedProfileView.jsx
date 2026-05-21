import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SITE_BTN_SECONDARY } from '../ui/siteDesignTokens'

function InitialsAvatar({ name, email, imageUrl }) {
  const initials = useMemo(() => {
    const base = (name || email || 'Member').trim()
    const parts = base.split(/\s+/).filter(Boolean)
    const a = (parts[0]?.[0] || 'M').toUpperCase()
    const b = (parts[1]?.[0] || parts[0]?.[1] || 'E').toUpperCase()
    return `${a}${b}`
  }, [name, email])

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="h-20 w-20 rounded-full object-cover ring-2 ring-white/60 dark:ring-zinc-950/60"
      />
    )
  }

  return (
    <div className="grid h-20 w-20 place-content-center rounded-full bg-gradient-to-br from-orange-500 via-amber-400 to-orange-600 text-lg font-bold text-white shadow-glow ring-2 ring-white/60 dark:ring-zinc-950/60">
      {initials}
    </div>
  )
}

function TagList({ label, items }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SharedProfileView({ profile, backTo, backLabel = 'Back' }) {
  const joinedLabel = useMemo(() => {
    if (!profile?.joined_at) return '—'
    try {
      return new Date(profile.joined_at).toLocaleDateString()
    } catch {
      return '—'
    }
  }, [profile?.joined_at])

  const roleLabel =
    profile?.role === 'mentor' ? 'Mentor' : profile?.role === 'student' ? 'Student' : profile?.role || 'Member'

  return (
    <div className="space-y-6">
      {backTo ? (
        <Link to={backTo} className={`inline-flex ${SITE_BTN_SECONDARY} !py-2 text-sm`}>
          ← {backLabel}
        </Link>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="relative p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <InitialsAvatar name={profile?.full_name} email={profile?.email} imageUrl={profile?.profile_image_url} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                {roleLabel}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{profile?.full_name || 'Member'}</h1>
              <p className="mt-1 text-sm text-zinc-500">Joined {joinedLabel}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">About</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {profile?.bio?.trim() || 'No bio shared yet.'}
          </p>
          {profile?.goals ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">Goals: </span>
              {profile.goals}
            </p>
          ) : null}
        </section>

        <section className="rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">Contact</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {profile?.email ? (
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="text-zinc-800 dark:text-zinc-200">{profile.email}</dd>
              </div>
            ) : null}
            {profile?.phone ? (
              <div>
                <dt className="text-zinc-500">Phone</dt>
                <dd className="text-zinc-800 dark:text-zinc-200">{profile.phone}</dd>
              </div>
            ) : null}
            {profile?.country ? (
              <div>
                <dt className="text-zinc-500">Country</dt>
                <dd className="text-zinc-800 dark:text-zinc-200">{profile.country}</dd>
              </div>
            ) : null}
            {!profile?.email && !profile?.phone && !profile?.country ? (
              <p className="text-zinc-500">No contact details shared.</p>
            ) : null}
          </dl>
        </section>
      </div>

      <section className="rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <TagList label="Skills" items={profile?.skills} />
        <div className="mt-4">
          <TagList label="Interests" items={profile?.interests} />
        </div>
        {!profile?.skills?.length && !profile?.interests?.length ? (
          <p className="text-sm text-zinc-500">No skills or interests listed yet.</p>
        ) : null}
      </section>
    </div>
  )
}
