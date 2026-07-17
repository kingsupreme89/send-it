import { getIsoWeekKey } from '../achievements/packRewards'
import { MADDEN_VERSIONS, type MaddenVersion } from '../types'

function versionLabel(version: MaddenVersion) {
  return MADDEN_VERSIONS.find((v) => v.id === version)?.label ?? version
}

export function WeeklyPackCard({
  packAvailableWeek,
  lastPackClaimedWeek,
  onOpen,
}: {
  packAvailableWeek: string | null
  lastPackClaimedWeek: string | null
  onOpen: () => void
}) {
  const currentWeek = getIsoWeekKey()
  const isAvailable = packAvailableWeek === currentWeek && lastPackClaimedWeek !== currentWeek
  const weekNumber = currentWeek.split('-W')[1]

  if (!isAvailable) {
    return (
      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Week {weekNumber} · {versionLabel('madden27')}
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">
          Pack opened — check back next week
        </p>
      </div>
    )
  }

  return (
    <button
      onClick={onOpen}
      className="relative overflow-hidden rounded-[24px] px-5 py-5 text-left"
      style={{
        backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
        boxShadow: '0 12px 30px -8px color-mix(in srgb, var(--accent) 60%, transparent)',
      }}
    >
      <div className="shimmer-accent absolute inset-0 opacity-60" />
      <p className="relative mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/85">
        Week {weekNumber} · {versionLabel('madden27')}
      </p>
      <p className="relative text-xl font-black tracking-tight text-white" style={{ fontFamily: 'var(--font-teko)' }}>
        RIP YOUR WEEKLY PACK
      </p>
      <p className="relative mt-1.5 text-xs font-semibold text-white/85">
        A new reward just dropped. Tap to open.
      </p>
    </button>
  )
}
