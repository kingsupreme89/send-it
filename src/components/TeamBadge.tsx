import type { NflTeam } from '../constants/nflTeams'

export function TeamBadge({ team, size = 36 }: { team: NflTeam | null; size?: number }) {
  if (!team) return null

  return (
    <div
      className="flex items-center justify-center rounded-xl font-black text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        letterSpacing: '-0.02em',
        backgroundImage: `linear-gradient(135deg, ${team.primary}, ${team.secondary})`,
        border: '2px solid rgba(255,255,255,0.18)',
        boxShadow: `0 4px 16px -2px color-mix(in srgb, ${team.primary} 70%, transparent)`,
      }}
    >
      {team.abbreviation}
    </div>
  )
}
