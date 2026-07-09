import { GAME_MODES, type GameMode } from '../types'

export function ModeTabs({ value, onChange }: { value: GameMode; onChange: (mode: GameMode) => void }) {
  return (
    <div className="flex gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 backdrop-blur-xl">
      {GAME_MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className="flex-1 rounded-xl px-2 py-1.5 text-xs font-semibold transition-all duration-150"
          style={
            value === m.id
              ? {
                  backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                  color: 'white',
                  boxShadow: '0 4px 14px -2px color-mix(in srgb, var(--accent) 50%, transparent)',
                }
              : { color: 'var(--text-muted)' }
          }
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
