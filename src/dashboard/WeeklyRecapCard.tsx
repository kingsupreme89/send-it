import { useMemo, useState } from 'react'
import { useGames } from '../games/useGames'
import { usePlayers } from '../players/usePlayers'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { getWeeklyRecap } from '../stories/weeklyRecap'
import { generateStories, topStory } from '../stories/storyGenerator'
import { shareOrDownloadRecap } from '../stories/recapImage'

export function WeeklyRecapCard({ onSelectPlayer }: { onSelectPlayer?: (uid: string) => void }) {
  const { games } = useGames(300)
  const { players } = usePlayers()
  const [sharing, setSharing] = useState(false)

  const recap = useMemo(() => getWeeklyRecap(games, players), [games, players])
  const headline = useMemo(() => topStory(generateStories(games, players))?.headline ?? null, [games, players])

  const handleShare = async () => {
    setSharing(true)
    try {
      await shareOrDownloadRecap(recap, headline)
    } finally {
      setSharing(false)
    }
  }

  if (recap.gamesPlayed === 0) {
    return (
      <Card>
        <div className="mb-1">
          <NetworkHeading>This Week</NetworkHeading>
        </div>
        <p className="text-sm text-[var(--text-muted)]">No games logged yet this week — get out there.</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <NetworkHeading>This Week</NetworkHeading>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">
            {recap.gamesPlayed} game{recap.gamesPlayed === 1 ? '' : 's'} played
          </span>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
              color: 'var(--accent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            }}
          >
            {sharing ? 'Building...' : '📰 Share recap'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {recap.playerOfTheWeek && (
          <button
            onClick={() => onSelectPlayer?.(recap.playerOfTheWeek!.uid)}
            className="rounded-xl bg-[var(--surface)] p-3 text-left transition-all hover:bg-white/[0.08] active:scale-[0.98]"
            style={{ cursor: onSelectPlayer ? 'pointer' : 'default' }}
          >
            <p className="text-xs text-[var(--text-muted)]">🏆 Player of the Week</p>
            <p className="text-sm font-semibold text-[var(--text)]">{recap.playerOfTheWeek.name}</p>
            <p className="text-xs" style={{ color: 'var(--text)' }}>
              {recap.playerOfTheWeek.wins}-{recap.playerOfTheWeek.losses}, {recap.playerOfTheWeek.totalYds} total yds
            </p>
            {onSelectPlayer && (
              <p className="mt-1 text-[10px]" style={{ color: 'var(--accent)' }}>Tap to view profile →</p>
            )}
          </button>
        )}
        {recap.biggestBlowout && (
          <div className="rounded-xl bg-[var(--surface)] p-3">
            <p className="text-xs text-[var(--text-muted)]">💥 Biggest Blowout</p>
            <p className="text-sm font-semibold text-[var(--text)]">
              {recap.biggestBlowout.winnerName} over {recap.biggestBlowout.loserName}
            </p>
            <p className="text-xs" style={{ color: 'var(--text)' }}>
              {recap.biggestBlowout.winnerScore}-{recap.biggestBlowout.loserScore} ({recap.biggestBlowout.margin}-pt margin)
            </p>
          </div>
        )}
        {recap.yardageLeader && (
          <button
            onClick={() => onSelectPlayer?.(recap.yardageLeader!.uid)}
            className="rounded-xl bg-[var(--surface)] p-3 text-left transition-all hover:bg-white/[0.08] active:scale-[0.98]"
            style={{ cursor: onSelectPlayer ? 'pointer' : 'default' }}
          >
            <p className="text-xs text-[var(--text-muted)]">📊 Yardage Leader</p>
            <p className="text-sm font-semibold text-[var(--text)]">{recap.yardageLeader.name}</p>
            <p className="text-xs" style={{ color: 'var(--text)' }}>{recap.yardageLeader.yards} total yds</p>
            {onSelectPlayer && (
              <p className="mt-1 text-[10px]" style={{ color: 'var(--accent)' }}>Tap to view profile →</p>
            )}
          </button>
        )}
      </div>
    </Card>
  )
}
