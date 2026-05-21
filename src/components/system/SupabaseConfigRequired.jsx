export function SupabaseConfigRequired() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-950 px-6">
      <div className="max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">Configuration required</p>
        <h1 className="mt-3 text-xl font-bold text-white">Supabase is not configured</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          Set <code className="text-orange-300">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-orange-300">VITE_SUPABASE_ANON_KEY</code> in your{' '}
          <code className="text-zinc-300">.env</code> file (see <code className="text-zinc-300">.env.example</code>
          ), then restart the dev server.
        </p>
      </div>
    </div>
  )
}
