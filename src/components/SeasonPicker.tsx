import { getSeasons, currentSeasonId } from '../features/seasons'

export function SeasonPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}) {
  const seasons = getSeasons()

  return (
    <div className="glass flex gap-1 overflow-x-auto rounded-2xl p-1">
      <button
        onClick={() => onChange('all')}
        className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
        style={
          value === 'all'
            ? {
                backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                color: 'white',
              }
            : { color: 'var(--text-muted)' }
        }
      >
        All-time
      </button>
      {seasons.slice(0, 5).map((s) => {
        const active = value === s.id
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
            style={
              active
                ? {
                    backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                    color: 'white',
                  }
                : { color: 'var(--text-muted)' }
            }
          >
            {s.label}
            {s.id === currentSeasonId() ? ' · now' : ''}
          </button>
        )
      })}
    </div>
  )
}
