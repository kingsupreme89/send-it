import { useMemo } from 'react'
import { useGames } from '../games/useGames'
import { usePlayers } from '../players/usePlayers'
import { generateStories } from '../stories/storyGenerator'

export function Ticker() {
  const { games } = useGames(300)
  const { players } = usePlayers()

  const stories = useMemo(() => generateStories(games, players).slice(0, 8), [games, players])

  if (stories.length === 0) return null

  const content = stories.map((s) => `${s.emoji} ${s.headline}`).join('     •     ')

  return (
    <div className="overflow-hidden" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' }}>
      <div className="ticker-track py-1.5">
        <span className="px-4 text-xs font-extrabold text-white">{content}</span>
        <span className="px-4 text-xs font-extrabold text-white" aria-hidden="true">{content}</span>
      </div>
    </div>
  )
}
