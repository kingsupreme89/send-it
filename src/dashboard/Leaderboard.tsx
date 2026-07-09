import { useMemo, useState } from 'react'
import { usePlayers } from '../players/usePlayers'
import { useGames } from '../games/useGames'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { ModeTabs } from '../components/ModeTabs'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { RankExplainer } from '../components/RankExplainer'
import { computeApRankings } from '../stats/apRanking'
import { GAME_MODES, type GameMode } from '../types'

const STAT_LEADER_FIELDS: {
  key: 'passingYds' | 'rushingYds' | 'interceptions' | 'sacks' | 'interceptionTDs' | 'kickReturnTDs' | 'puntReturnTDs'
  label: string
}[] = [
  { key: 'passingYds', label: 'Passing yds' },
  { key: 'rushingYds', label: 'Rushing yds' },
  { key: 'interceptions', label: 'Interceptions' },
  { key: 'sacks', label: 'Sacks' },
  { key: 'interceptionTDs', label: 'INT return TDs' },
  { key: 'kickReturnTDs', label: 'Kick return TDs' },
  { key: 'puntReturnTDs', label: 'Punt return TDs' },
]

export function Leaderboard({ onSelectPlayer }: { onSelectPlayer?: (uid: string) => void }) {
  const { players } = usePlayers()
  const { games } = useGames(300)
  const [mode, setMode] = useState<GameMode>('1v1_regular')

  const modeLabel = GAME_MODES.find((m) => m.id === mode)?.label ?? mode

  const ranked = useMemo(() => {
    const rankings = computeApRankings(games, mode, players.map((p) => p.uid))
    return rankings
      .map((r) => {
        const player = players.find((p) => p.uid === r.uid)
        if (!player) return null
        return { ...r, player, stats: player.statsByMode[mode] }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
  }, [games, mode, players])

  const leaderFor = (key: (typeof STAT_LEADER_FIELDS)[number]['key']) => {
    if (ranked.length === 0) return null
    return ranked.reduce((best, curr) => (curr.stats[key] > best.stats[key] ? curr : best))
  }

  return (
    <div className="flex flex-col gap-4">
      <ModeTabs value={mode} onChange={setMode} />

      <Card className="overflow-x-auto">
        <div className="mb-3 flex items-center justify-between">
          <NetworkHeading>Leaderboard</NetworkHeading>
          {ranked.length > 0 && <RankExplainer modeLabel={modeLabel} />}
        </div>
        {ranked.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No games logged in this mode yet.</p>
        ) : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="text-xs text-[var(--text-muted)]">
                <th className="pb-2">Rank</th>
                <th className="pb-2">Player</th>
                <th className="pb-2">W-L</th>
                <th className="pb-2">Win%</th>
                <th className="pb-2">Pass</th>
                <th className="pb-2">Rush</th>
                <th className="pb-2">INT</th>
                <th className="pb-2">Sacks</th>
                <th className="pb-2">INT TD</th>
                <th className="pb-2">KR TD</th>
                <th className="pb-2">PR TD</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(({ player, stats, rank }) => (
                <tr key={player.uid} className="border-t border-[var(--border)]">
                  <td className="py-2.5">
                    <span
                      className="text-xs font-bold"
                      style={{ color: rank <= 3 ? 'var(--accent)' : 'var(--text-muted)' }}
                    >
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <button
                      onClick={() => onSelectPlayer?.(player.uid)}
                      className="flex items-center gap-2 text-left"
                      style={{ cursor: onSelectPlayer ? 'pointer' : 'default' }}
                    >
                      <PlayerAvatar photoURL={player.photoURL} displayName={player.displayName} size={26} />
                      <span className="font-medium text-[var(--text)]">{player.displayName}</span>
                    </button>
                  </td>
                  <td className="py-2">{stats.wins}-{stats.losses}</td>
                  <td className="py-2">{Math.round((stats.wins / (stats.wins + stats.losses)) * 100)}%</td>
                  <td className="py-2">{stats.passingYds}</td>
                  <td className="py-2">{stats.rushingYds}</td>
                  <td className="py-2">{stats.interceptions}</td>
                  <td className="py-2">{stats.sacks}</td>
                  <td className="py-2">{stats.interceptionTDs}</td>
                  <td className="py-2">{stats.kickReturnTDs}</td>
                  <td className="py-2">{stats.puntReturnTDs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {ranked.length > 0 && (
        <Card>
          <div className="mb-3">
            <NetworkHeading size="md">Stat leaders</NetworkHeading>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {STAT_LEADER_FIELDS.map(({ key, label }) => {
              const leader = leaderFor(key)
              if (!leader) return null
              return (
                <div key={key} className="rounded-lg bg-[var(--surface)] p-2 text-center">
                  <p className="text-xs text-[var(--text-muted)]">{label}</p>
                  <p className="text-sm font-semibold text-[var(--text)]">{leader.player.displayName}</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{leader.stats[key]}</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
