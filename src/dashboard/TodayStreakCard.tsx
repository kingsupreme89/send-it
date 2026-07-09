import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import type { Player } from '../types'

export function TodayStreakCard({ player }: { player: Player }) {
  const mode = '1v1_regular'
  const stats = player.statsByMode[mode]
  const currentStreak = stats.currentStreak
  const bestStreak = stats.bestStreak

  const headline =
    currentStreak > 0
      ? `${currentStreak}-game streak${currentStreak > 1 ? 's' : ''} in ${mode === '1v1_regular' ? '1v1 Regular' : mode}`
      : 'No streak started yet — log a win to build momentum.'

  const accent = currentStreak >= 3 ? '🔥' : currentStreak === 2 ? '⚡' : '📈'

  return (
    <Card className="overflow-hidden" hover={false}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <NetworkHeading size="md">Today’s streak</NetworkHeading>
          <p className="mt-1 text-xs text-[var(--text-muted)]">A quick pulse on your current hot streak.</p>
        </div>
        <span className="text-3xl">{accent}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Current</p>
          <p className="mt-1 text-2xl font-black text-[var(--text)]">{currentStreak}</p>
        </div>
        <div className="rounded-2xl bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Best</p>
          <p className="mt-1 text-2xl font-black text-[var(--accent)]">{bestStreak}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-[var(--text-muted)]">{headline}</p>
    </Card>
  )
}
