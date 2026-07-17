import { useMemo } from 'react'
import { useGames } from '../games/useGames'
import { usePlayers } from '../players/usePlayers'
import { generateStories } from '../stories/storyGenerator'

export function Ticker({ claimedTicker }: { claimedTicker?: string | null }) {
  const { games } = useGames(300)
  const { players } = usePlayers()

  const stories = useMemo(() => generateStories(games, players).slice(0, 8), [games, players])

  if (stories.length === 0 && !claimedTicker) return null

  const headlines = [...(claimedTicker ? [claimedTicker] : []), ...stories.map((s) => s.headline)]
  const content = headlines.join('     •     ')

  return (
    <div className="overflow-hidden border-t border-white/5 bg-black/45">
      <div className="ticker-track py-1.5">
        <span className="px-4 text-[11px] font-bold text-white/70">{content}</span>
        <span className="px-4 text-[11px] font-bold text-white/70" aria-hidden="true">{content}</span>
      </div>
    </div>
  )
}
