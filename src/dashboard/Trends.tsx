import { useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useGames } from '../games/useGames'
import { usePlayers } from '../players/usePlayers'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { ModeTabs } from '../components/ModeTabs'
import type { GameMode } from '../types'

export function Trends({ currentUid }: { currentUid: string }) {
  const { games } = useGames()
  const { players } = usePlayers()
  const [mode, setMode] = useState<GameMode>('1v1_regular')

  const myGames = useMemo(
    () =>
      games
        .filter((g) => g.gameMode === mode && (g.winnerIds.includes(currentUid) || g.loserIds.includes(currentUid)))
        .sort((a, b) => a.timestamp - b.timestamp),
    [games, mode, currentUid],
  )

  const chartData = useMemo(() => {
    let wins = 0
    return myGames.map((g, i) => {
      const isWinner = g.winnerIds.includes(currentUid)
      if (isWinner) wins += 1
      const stat = g.stats[currentUid]
      return {
        game: `#${i + 1}`,
        passingYds: stat?.passingYds ?? 0,
        rushingYds: stat?.rushingYds ?? 0,
        winPct: Math.round((wins / (i + 1)) * 100),
      }
    })
  }, [myGames, currentUid])

  const me = players.find((p) => p.uid === currentUid)

  const last8 = useMemo(() => myGames.slice(-8), [myGames])
  const trendBars = useMemo(
    () =>
      last8.map((g) => {
        const won = g.winnerIds.includes(currentUid)
        return { won, height: won ? '100%' : '40%' }
      }),
    [last8, currentUid],
  )

  const summaryStats = useMemo(() => {
    if (myGames.length === 0) {
      return { winRate: 0, avgScore: 0, bestWinMargin: 0, blowouts: 0 }
    }
    let wins = 0
    let scoreSum = 0
    let bestWinMargin = 0
    let blowouts = 0
    for (const g of myGames) {
      const won = g.winnerIds.includes(currentUid)
      const myScore = won ? g.winnerScore : g.loserScore
      scoreSum += myScore
      if (won) {
        wins++
        bestWinMargin = Math.max(bestWinMargin, g.scoreDiff)
        if (g.isBlowout) blowouts++
      }
    }
    return {
      winRate: Math.round((wins / myGames.length) * 100),
      avgScore: Math.round(scoreSum / myGames.length),
      bestWinMargin,
      blowouts,
    }
  }, [myGames, currentUid])

  return (
    <Card>
      <div className="mb-3">
        <NetworkHeading size="md">{`Trends${me ? ` — ${me.displayName}` : ''}`}</NetworkHeading>
      </div>
      <div className="flex flex-col gap-4">
        <ModeTabs value={mode} onChange={setMode} />

        {myGames.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Log a few games in this mode to see trends.</p>
        ) : (
          <>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Last {trendBars.length} games
              </p>
              <div className="flex h-[120px] items-end gap-2">
                {trendBars.map((bar, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md rounded-b-sm"
                    style={{
                      height: bar.height,
                      backgroundImage: bar.won
                        ? 'linear-gradient(180deg, var(--accent), var(--accent-secondary))'
                        : undefined,
                      background: bar.won ? undefined : 'rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                ['Win rate', `${summaryStats.winRate}%`],
                ['Avg score', summaryStats.avgScore],
                ['Best win margin', summaryStats.bestWinMargin],
                ['Blowouts', summaryStats.blowouts],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
                  <p className="mt-1 text-2xl font-black" style={{ fontFamily: 'var(--font-teko)', color: 'var(--accent)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {chartData.length >= 2 && (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">Detailed trends</p>
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Yards per game</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="game" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="passingYds" stroke="#3b82f6" strokeWidth={2} dot={false} name="Passing" />
                  <Line type="monotone" dataKey="rushingYds" stroke="#22c55e" strokeWidth={2} dot={false} name="Rushing" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Win% over time</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <XAxis dataKey="game" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="winPct" stroke="var(--accent)" strokeWidth={2} dot={false} name="Win%" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
