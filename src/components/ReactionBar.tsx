import { useState } from 'react'
import { REACTION_EMOJIS } from '../types'
import { setReaction } from '../games/useReactions'

interface ReactionBarProps {
  gameId: string
  currentUid: string
  reactions: Record<string, string>
}

export function ReactionBar({ gameId, currentUid, reactions }: ReactionBarProps) {
  const [pending, setPending] = useState(false)
  const myReaction = reactions[currentUid] ?? null

  const counts = REACTION_EMOJIS.map((emoji) => ({
    emoji,
    count: Object.values(reactions).filter((r) => r === emoji).length,
  }))

  const handleTap = async (emoji: string) => {
    if (pending) return
    setPending(true)
    try {
      await setReaction(gameId, currentUid, myReaction === emoji ? null : emoji)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {counts.map(({ emoji, count }) => {
        const active = myReaction === emoji
        return (
          <button
            key={emoji}
            onClick={() => handleTap(emoji)}
            disabled={pending}
            className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all duration-150"
            style={
              active
                ? { borderColor: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
            }
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
