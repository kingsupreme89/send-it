import { NFL_TEAMS, type TeamId } from '../constants/nflTeams'

interface TeamPickerSheetProps {
  open: boolean
  value: TeamId | null
  onChange: (team: TeamId) => void
  onClose: () => void
}

export function TeamPickerSheet({ open, value, onChange, onClose }: TeamPickerSheetProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-[var(--border-strong)] bg-[#0d0e15] p-5"
        style={{ boxShadow: '0 -20px 60px rgba(0,0,0,0.6)' }}
      >
        <p
          className="mb-3.5 text-base font-extrabold tracking-wide text-white"
          style={{ fontFamily: 'var(--font-teko)', fontSize: '1.15rem' }}
        >
          PICK YOUR TEAM
        </p>
        <div className="grid grid-cols-4 gap-2">
          {NFL_TEAMS.map((team) => {
            const selected = team.id === value
            return (
              <button
                key={team.id}
                onClick={() => {
                  onChange(team.id)
                  onClose()
                }}
                className="flex aspect-square items-center justify-center rounded-2xl text-[11px] font-black text-white"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${team.primary}, ${team.secondary})`,
                  border: selected ? '2px solid white' : '2px solid rgba(255,255,255,0.15)',
                }}
              >
                {team.abbreviation}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
