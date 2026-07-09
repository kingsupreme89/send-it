import type { Player } from '../types'

interface PlayerPickerProps {
  players: Player[]
  value: string | null
  onChange: (uid: string) => void
  label: string
  excludeIds?: string[]
  id?: string
}

export function PlayerPicker({ players, value, onChange, label, excludeIds = [], id }: PlayerPickerProps) {
  const options = players.filter((p) => !excludeIds.includes(p.uid))

  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={id}>
      <span className="font-medium text-[var(--text)]">{label}</span>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
      >
        <option value="" disabled>
          Select a player
        </option>
        {options.map((p) => (
          <option key={p.uid} value={p.uid}>
            {p.displayName}
          </option>
        ))}
      </select>
    </label>
  )
}
