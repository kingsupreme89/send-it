import { useMemo, useState } from 'react'
import { usePlayers } from '../players/usePlayers'
import { useGames } from '../games/useGames'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { PlayerChipRow } from '../components/PlayerChipRow'
import { PlayerAvatar } from '../components/PlayerAvatar'
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

function ComparisonBar({ label, aVal, bVal }: { label: string; aVal: number; bVal: number }) {
  const total = aVal + bVal
  const aPct = total === 0 ? 50 : (aVal / total) * 100
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] font-bold text-[var(--text-muted)]">
        <span>{aVal}</span>
        <span className="uppercase tracking-[0.1em]">{label}</span>
        <span>{bVal}</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
        <div style={{ width: `${aPct}%`, background: 'var(--accent)' }} />
        <div style={{ width: `${100 - aPct}%`, background: 'rgba(255,255,255,0.25)' }} />
      </div>
    </div>
  )
}

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
  const me = players.find((p) => p.uid === currentUid)

  return (
    <Card>
      <div className="mb-3">
        <NetworkHeading>Head-to-head</NetworkHeading>
      </div>
      <div className="flex flex-col gap-3">
        <ModeTabs value={mode} onChange={setMode} />
        <PlayerChipRow players={players} value={opponentId} onChange={setOpponentId} excludeIds={[currentUid]} />

        {h2h && opponent && me && (
          <div className="rounded-xl bg-[var(--surface)] p-4">
            {h2h.total === 0 ? (
              <p className="text-center text-sm text-[var(--text-muted)]">
                No games logged against {opponent.displayName} in this mode yet.
              </p>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-center gap-4.5">
                  <div className="text-center">
                    <PlayerAvatar photoURL={me.photoURL} displayName={me.displayName} size={52} />
                    <p className="mt-1.5 text-xs font-bold text-[var(--text)]">{me.displayName}</p>
                  </div>
                  <span className="text-2xl font-bold text-[var(--text-muted)]" style={{ fontFamily: 'var(--font-teko)' }}>
                    VS
                  </span>
                  <div className="text-center">
                    <PlayerAvatar photoURL={opponent.photoURL} displayName={opponent.displayName} size={52} />
                    <p className="mt-1.5 text-xs font-bold text-[var(--text)]">{opponent.displayName}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <ComparisonBar label="Wins" aVal={h2h.me.wins} bVal={h2h.opp.wins} />
                  <ComparisonBar label="Losses" aVal={h2h.me.losses} bVal={h2h.opp.losses} />
                  <ComparisonBar
                    label="Streak"
                    aVal={me.statsByMode[mode].currentStreak}
                    bVal={opponent.statsByMode[mode].currentStreak}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
