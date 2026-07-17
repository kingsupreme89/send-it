import type { Player } from '../types'
import { PlayerAvatar } from './PlayerAvatar'

export function PlayerChipRow({
  players,
  value,
  onChange,
  excludeIds = [],
}: {
  players: Player[]
  value: string | null
  onChange: (uid: string) => void
  excludeIds?: string[]
}) {
  const options = players.filter((p) => !excludeIds.includes(p.uid))

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((p) => {
        const selected = p.uid === value
        return (
          <button
            key={p.uid}
            onClick={() => onChange(p.uid)}
            className="flex shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-1.5"
            style={{ border: selected ? '2px solid var(--accent)' : '2px solid transparent' }}
          >
            <PlayerAvatar photoURL={p.photoURL} displayName={p.displayName} size={40} />
            <span className="max-w-[56px] truncate text-[10px] font-semibold text-[var(--text-muted)]">
              {p.displayName}
            </span>
          </button>
        )
      })}
    </div>
  )
}
