import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { usePlayers } from '../players/usePlayers'
import { useGames } from '../games/useGames'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { ModeTabs } from '../components/ModeTabs'
import { SeasonPicker } from '../components/SeasonPicker'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { RankExplainer } from '../components/RankExplainer'
import { computeApRankings } from '../stats/apRanking'
import { filterGamesBySeason, getSeasons, currentSeasonId } from '../features/seasons'
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
  const [seasonId, setSeasonId] = useState(currentSeasonId())
  const seasons = useMemo(() => getSeasons(), [])

  const modeLabel = GAME_MODES.find((m) => m.id === mode)?.label ?? mode
  const seasonGames = useMemo(() => filterGamesBySeason(games, seasonId, seasons), [games, seasonId, seasons])

  const ranked = useMemo(() => {
    const rankings = computeApRankings(
      seasonGames,
      mode,
      players.map((p) => p.uid),
    )
    return rankings
      .map((r) => {
        const player = players.find((p) => p.uid === r.uid)
        if (!player) return null
        // Season-scoped W-L from filtered games rather than lifetime statsByMode
        let wins = 0
        let losses = 0
        let passingYds = 0
        let rushingYds = 0
        let interceptions = 0
        let sacks = 0
        let interceptionTDs = 0
        let kickReturnTDs = 0
        let puntReturnTDs = 0
        for (const g of seasonGames) {
          if (g.gameMode !== mode) continue
          const inWin = g.winnerIds.includes(player.uid)
          const inLoss = g.loserIds.includes(player.uid)
          if (!inWin && !inLoss) continue
          if (inWin) wins++
          if (inLoss) losses++
          const s = g.stats[player.uid]
          if (s) {
            passingYds += s.passingYds
            rushingYds += s.rushingYds
            interceptions += s.interceptions
            sacks += s.sacks
            interceptionTDs += s.interceptionTDs
            kickReturnTDs += s.kickReturnTDs
            puntReturnTDs += s.puntReturnTDs
          }
        }
        return {
          ...r,
          player,
          stats: {
            wins,
            losses,
            passingYds,
            rushingYds,
            interceptions,
            sacks,
            interceptionTDs,
            kickReturnTDs,
            puntReturnTDs,
          },
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
  }, [seasonGames, mode, players])

  const leaderFor = (key: (typeof STAT_LEADER_FIELDS)[number]['key']) => {
    if (ranked.length === 0) return null
    return ranked.reduce((best, curr) => (curr.stats[key] > best.stats[key] ? curr : best))
  }

  return (
    <div className="flex flex-col gap-4">
      <SeasonPicker value={seasonId} onChange={setSeasonId} />
      <ModeTabs value={mode} onChange={setMode} />

      <Card className="overflow-x-auto" hover={false}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <NetworkHeading>Leaderboard</NetworkHeading>
          {ranked.length > 0 && <RankExplainer modeLabel={modeLabel} />}
        </div>
        {ranked.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No games logged in this mode / season yet.</p>
        ) : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                <th className="pb-2 font-medium">Rank</th>
                <th className="pb-2 font-medium">Player</th>
                <th className="pb-2 font-medium">W-L</th>
                <th className="pb-2 font-medium">Win%</th>
                <th className="pb-2 font-medium">Pass</th>
                <th className="pb-2 font-medium">Rush</th>
                <th className="pb-2 font-medium">INT</th>
                <th className="pb-2 font-medium">Sacks</th>
                <th className="pb-2 font-medium">INT TD</th>
                <th className="pb-2 font-medium">KR TD</th>
                <th className="pb-2 font-medium">PR TD</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(({ player, stats, rank }, i) => (
                <motion.tr
                  key={player.uid}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t border-[var(--border)]"
                >
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
                      <span className="font-semibold text-[var(--text)]">{player.displayName}</span>
                    </button>
                  </td>
                  <td className="py-2">
                    {stats.wins}-{stats.losses}
                  </td>
                  <td className="py-2">
                    {stats.wins + stats.losses === 0
                      ? '—'
                      : `${Math.round((stats.wins / (stats.wins + stats.losses)) * 100)}%`}
                  </td>
                  <td className="py-2">{stats.passingYds}</td>
                  <td className="py-2">{stats.rushingYds}</td>
                  <td className="py-2">{stats.interceptions}</td>
                  <td className="py-2">{stats.sacks}</td>
                  <td className="py-2">{stats.interceptionTDs}</td>
                  <td className="py-2">{stats.kickReturnTDs}</td>
                  <td className="py-2">{stats.puntReturnTDs}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {ranked.length > 0 && (
        <Card hover={false}>
          <div className="mb-3">
            <NetworkHeading size="md">Stat leaders</NetworkHeading>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {STAT_LEADER_FIELDS.map(({ key, label }) => {
              const leader = leaderFor(key)
              if (!leader || leader.stats[key] <= 0) return null
              return (
                <div key={key} className="glass rounded-2xl p-3 text-center">
                  <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
                  <p className="text-sm font-semibold text-[var(--text)]">{leader.player.displayName}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                    {leader.stats[key]}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
