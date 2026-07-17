import { useMemo } from 'react'
import { usePlayers } from '../players/usePlayers'
import { useGames } from '../games/useGames'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { computeApRankings } from '../stats/apRanking'
import { filterGamesBySeason, getSeasons, currentSeasonId } from '../features/seasons'

const PREVIEW_MODE = '1v1_regular'
const PREVIEW_COUNT = 5

export function LeaderboardPreview({
  onSelectPlayer,
  claimedSpotlight,
}: {
  onSelectPlayer?: (uid: string) => void
  claimedSpotlight?: string | null
}) {
  const { players } = usePlayers()
  const { games } = useGames(300)
  const seasons = useMemo(() => getSeasons(), [])
  const seasonGames = useMemo(() => filterGamesBySeason(games, currentSeasonId(), seasons), [games, seasons])

  const ranked = useMemo(() => {
    const rankings = computeApRankings(seasonGames, PREVIEW_MODE, players.map((p) => p.uid))
    return rankings
      .map((r) => {
        const player = players.find((p) => p.uid === r.uid)
        if (!player) return null
        let wins = 0
        let losses = 0
        for (const g of seasonGames) {
          if (g.gameMode !== PREVIEW_MODE) continue
          if (g.winnerIds.includes(player.uid)) wins++
          else if (g.loserIds.includes(player.uid)) losses++
        }
        return { ...r, player, wins, losses }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .slice(0, PREVIEW_COUNT)
  }, [seasonGames, players])

  return (
    <Card hover={false}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <NetworkHeading size="md">Leaderboard</NetworkHeading>
        {claimedSpotlight && (
          <span
            className="rounded-full px-2.5 py-1 text-[9px] font-extrabold text-white"
            style={{ background: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}
          >
            SPOTLIGHT: {claimedSpotlight}
          </span>
        )}
      </div>
      {ranked.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No games logged this season yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {ranked.map(({ player, wins, losses, rank }) => {
            const total = wins + losses
            const winPct = total === 0 ? '—' : `${Math.round((wins / total) * 100)}%`
            return (
              <button
                key={player.uid}
                onClick={() => onSelectPlayer?.(player.uid)}
                className="flex items-center gap-2.5 rounded-2xl p-2 text-left transition-colors hover:bg-white/[0.06]"
              >
                <span
                  className="w-5 text-center text-sm font-black"
                  style={{ color: rank <= 3 ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  #{rank}
                </span>
                <PlayerAvatar photoURL={player.photoURL} displayName={player.displayName} size={30} />
                <span className="flex-1 truncate text-sm font-bold text-[var(--text)]">{player.displayName}</span>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {wins}-{losses}
                </span>
                <span className="w-11 text-right text-sm font-extrabold" style={{ color: 'var(--accent)' }}>
                  {winPct}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </Card>
  )
}
