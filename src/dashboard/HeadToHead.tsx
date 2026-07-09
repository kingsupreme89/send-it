import { useMemo, useState } from 'react'
import { usePlayers } from '../players/usePlayers'
import { useGames } from '../games/useGames'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { PlayerPicker } from '../components/PlayerPicker'
import { ModeTabs } from '../components/ModeTabs'
import type { GameDoc, GameMode } from '../types'

interface SideTotals {
  wins: number
  losses: number
  passingYds: number
  rushingYds: number
  interceptions: number
  sacks: number
  interceptionTDs: number
  kickReturnTDs: number
  puntReturnTDs: number
}

function totalsFor(games: GameDoc[], uid: string): SideTotals {
  const totals: SideTotals = {
    wins: 0,
    losses: 0,
    passingYds: 0,
    rushingYds: 0,
    interceptions: 0,
    sacks: 0,
    interceptionTDs: 0,
    kickReturnTDs: 0,
    puntReturnTDs: 0,
  }
  for (const g of games) {
    if (g.winnerIds.includes(uid)) totals.wins++
    else totals.losses++
    const s = g.stats[uid]
    if (s) {
      totals.passingYds += s.passingYds
      totals.rushingYds += s.rushingYds
      totals.interceptions += s.interceptions
      totals.sacks += s.sacks
      totals.interceptionTDs += s.interceptionTDs
      totals.kickReturnTDs += s.kickReturnTDs
      totals.puntReturnTDs += s.puntReturnTDs
    }
  }
  return totals
}

const STAT_ROWS: { key: keyof SideTotals; label: string }[] = [
  { key: 'passingYds', label: 'Passing yds' },
  { key: 'rushingYds', label: 'Rushing yds' },
  { key: 'interceptions', label: 'Interceptions' },
  { key: 'sacks', label: 'Sacks' },
  { key: 'interceptionTDs', label: 'INT return TDs' },
  { key: 'kickReturnTDs', label: 'Kick return TDs' },
  { key: 'puntReturnTDs', label: 'Punt return TDs' },
]

export function HeadToHead({ currentUid }: { currentUid: string }) {
  const { players } = usePlayers()
  const { games } = useGames()
  const [opponentId, setOpponentId] = useState<string | null>(null)
  const [mode, setMode] = useState<GameMode>('1v1_regular')

  const h2h = useMemo(() => {
    if (!opponentId) return null
    const relevant = games.filter(
      (g) =>
        g.gameMode === mode &&
        ((g.winnerIds.includes(currentUid) && g.loserIds.includes(opponentId)) ||
          (g.winnerIds.includes(opponentId) && g.loserIds.includes(currentUid))),
    )
    return { me: totalsFor(relevant, currentUid), opp: totalsFor(relevant, opponentId), total: relevant.length }
  }, [games, currentUid, opponentId, mode])

  const opponent = players.find((p) => p.uid === opponentId)

  return (
    <Card>
      <div className="mb-3">
        <NetworkHeading>Head-to-head</NetworkHeading>
      </div>
      <div className="flex flex-col gap-3">
        <ModeTabs value={mode} onChange={setMode} />
        <PlayerPicker
          players={players}
          value={opponentId}
          onChange={setOpponentId}
          label="Compare against"
          excludeIds={[currentUid]}
        />

        {h2h && opponent && (
          <div className="rounded-xl bg-[var(--surface)] p-4">
            {h2h.total === 0 ? (
              <p className="text-center text-sm text-[var(--text-muted)]">
                No games logged against {opponent.displayName} in this mode yet.
              </p>
            ) : (
              <>
                <p className="mb-4 text-center text-lg font-semibold text-[var(--text)]">
                  You're <span className="font-bold">{h2h.me.wins}-{h2h.me.losses}</span> against {opponent.displayName}
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-[var(--text-muted)]">
                      <th className="pb-2 text-left font-medium">Stat (all-time)</th>
                      <th className="pb-2 text-right font-medium">You</th>
                      <th className="pb-2 text-right font-medium">{opponent.displayName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STAT_ROWS.map(({ key, label }) => {
                      const mine = h2h.me[key]
                      const theirs = h2h.opp[key]
                      return (
                        <tr key={key} className="border-t border-[var(--border)]">
                          <td className="py-2 text-[var(--text-muted)]">{label}</td>
                          <td
                            className="py-2 text-right font-semibold"
                            style={{ color: mine > theirs ? 'var(--accent)' : 'var(--text)' }}
                          >
                            {mine}
                          </td>
                          <td
                            className="py-2 text-right font-semibold"
                            style={{ color: theirs > mine ? 'var(--accent)' : 'var(--text)' }}
                          >
                            {theirs}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
