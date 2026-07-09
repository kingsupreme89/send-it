import { useState } from 'react'
import { motion } from 'motion/react'
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
          <motion.button
            key={emoji}
            whileTap={{ scale: 1.2 }}
            onClick={() => handleTap(emoji)}
            disabled={pending}
            className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs backdrop-blur-md"
            style={
              active
                ? {
                    borderColor: 'var(--accent)',
                    backgroundColor: 'color-mix(in srgb, var(--accent) 22%, transparent)',
                    boxShadow: '0 0 12px color-mix(in srgb, var(--accent) 35%, transparent)',
                  }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)' }
            }
          >
            <span>{emoji}</span>
            {count > 0 && <span className="font-semibold">{count}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}
