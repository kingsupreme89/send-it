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

  return (
    <Card>
      <div className="mb-3">
        <NetworkHeading size="md">{`Trends${me ? ` — ${me.displayName}` : ''}`}</NetworkHeading>
      </div>
      <div className="flex flex-col gap-4">
        <ModeTabs value={mode} onChange={setMode} />

        {chartData.length < 2 ? (
          <p className="text-sm text-[var(--text-muted)]">Log a few more games in this mode to see trends.</p>
        ) : (
          <>
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
