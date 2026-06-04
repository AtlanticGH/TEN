import { HOME_CONTAINER, HOME_WHO_STATS } from './homeContentData.jsx'

/** Dark impact stats band (100+ Future Founders, etc.). */
export function HomeWhoStatsBar() {
  return (
    <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 py-12">
      <div className={`${HOME_CONTAINER} grid grid-cols-2 gap-8 md:grid-cols-4`}>
        {HOME_WHO_STATS.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-3xl font-black text-orange-400 md:text-4xl">{value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-300">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
