import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useGames } from '../games/useGames'
import { usePlayers } from '../players/usePlayers'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { getTopRivalries } from '../features/rivalry'

export function RivalryStrip({ onSelectPlayer }: { onSelectPlayer?: (uid: string) => void }) {
  const { games } = useGames(300)
  const { players } = usePlayers()
  const rivalries = useMemo(() => getTopRivalries(games, players, 3), [games, players])

  if (rivalries.length === 0) return null

  return (
    <Card hover={false}>
      <div className="mb-3">
        <NetworkHeading size="md">Rivalries</NetworkHeading>
      </div>
      <div className="flex flex-col gap-2">
        {rivalries.map((r, i) => {
          const leader = r.aWins === r.bWins ? null : r.aWins > r.bWins ? r.a : r.b
          return (
            <motion.div
              key={`${r.a.uid}-${r.b.uid}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5"
            >
              <button
                onClick={() => onSelectPlayer?.(r.a.uid)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <PlayerAvatar photoURL={r.a.photoURL} displayName={r.a.displayName} size={32} />
                <span className="truncate text-sm font-semibold">{r.a.displayName}</span>
              </button>

              <div className="shrink-0 text-center">
                <p className="text-lg font-bold tracking-tight">
                  <span style={{ color: r.aWins >= r.bWins ? 'var(--accent)' : 'var(--text-muted)' }}>{r.aWins}</span>
                  <span className="mx-1 text-[var(--text-muted)]">–</span>
                  <span style={{ color: r.bWins >= r.aWins ? 'var(--accent)' : 'var(--text-muted)' }}>{r.bWins}</span>
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {r.games} games{leader ? ` · ${leader.displayName.split(' ')[0]} leads` : ' · tied'}
                </p>
              </div>

              <button
                onClick={() => onSelectPlayer?.(r.b.uid)}
                className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right"
              >
                <span className="truncate text-sm font-semibold">{r.b.displayName}</span>
                <PlayerAvatar photoURL={r.b.photoURL} displayName={r.b.displayName} size={32} />
              </button>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}
