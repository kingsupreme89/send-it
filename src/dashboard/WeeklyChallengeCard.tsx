import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useGames } from '../games/useGames'
import { usePlayers } from '../players/usePlayers'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { getChallengeOfWeek, rankChallenge, startOfWeekMs } from '../features/weeklyChallenge'

export function WeeklyChallengeCard({ onSelectPlayer }: { onSelectPlayer?: (uid: string) => void }) {
  const { games } = useGames(300)
  const { players } = usePlayers()
  const challenge = useMemo(() => getChallengeOfWeek(), [])
  const standings = useMemo(
    () => rankChallenge(challenge, games, players, startOfWeekMs()),
    [challenge, games, players],
  )
  const leader = standings[0]

  return (
    <Card className="overflow-hidden" hover={false}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <NetworkHeading size="md">Challenge of the Week</NetworkHeading>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{challenge.description}</p>
        </div>
        <motion.span
          className="text-3xl"
          animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {challenge.emoji}
        </motion.span>
      </div>

      <div className="shimmer-accent mb-3 rounded-2xl px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">This week</p>
        <p className="text-sm font-bold text-white">{challenge.title}</p>
      </div>

      {standings.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No entries yet — log a game and claim the crown.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {standings.slice(0, 3).map((s, i) => (
            <li key={s.uid}>
              <button
                onClick={() => onSelectPlayer?.(s.uid)}
                className="glass flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
              >
                <span
                  className="w-5 text-center text-xs font-bold"
                  style={{ color: i === 0 ? 'var(--warning)' : 'var(--text-muted)' }}
                >
                  {i === 0 ? '👑' : `#${i + 1}`}
                </span>
                <PlayerAvatar photoURL={s.photoURL} displayName={s.name} size={28} />
                <span className="flex-1 truncate text-sm font-semibold">{s.name}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                  {s.value}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {leader && (
        <p className="mt-3 text-[11px] text-[var(--text-muted)]">
          Current leader: <span className="font-semibold text-[var(--text)]">{leader.name}</span>
        </p>
      )}
    </Card>
  )
}
