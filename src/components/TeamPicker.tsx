import { NFL_TEAMS, type TeamId } from '../constants/nflTeams'

interface TeamPickerProps {
  value: TeamId | null
  onChange: (team: TeamId) => void
  label?: string
  id?: string
}

export function TeamPicker({ value, onChange, label, id }: TeamPickerProps) {
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={id}>
      {label && <span className="font-medium text-[var(--text)]">{label}</span>}
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value as TeamId)}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
      >
        <option value="" disabled>
          Select a team
        </option>
        {NFL_TEAMS.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </label>
  )
}
