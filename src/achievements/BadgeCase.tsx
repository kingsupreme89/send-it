import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BADGES } from './badgeRules'

export function BadgeCase({ badgeIds }: { badgeIds: string[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const allBadges = Object.values(BADGES)

  return (
    <div className="flex flex-wrap gap-3">
      {allBadges.map((badge, i) => {
        const earned = badgeIds.includes(badge.id)
        const active = activeId === badge.id
        return (
          <div key={badge.id} className="relative">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 22 }}
              whileHover={earned ? { scale: 1.08, y: -2 } : undefined}
              whileTap={{ scale: 0.94 }}
              onClick={() => setActiveId((cur) => (cur === badge.id ? null : badge.id))}
              onMouseEnter={() => setActiveId(badge.id)}
              onMouseLeave={() => setActiveId((cur) => (cur === badge.id ? null : cur))}
              aria-label={`${badge.label}${earned ? '' : ' (locked)'}`}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border text-2xl"
              style={
                earned
                  ? {
                      backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                      borderColor: 'transparent',
                      boxShadow: '0 8px 20px -4px color-mix(in srgb, var(--accent) 55%, transparent)',
                    }
                  : {
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      filter: 'grayscale(1)',
                      opacity: 0.4,
                    }
              }
            >
              {badge.emoji}
            </motion.button>

            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  className="glass-strong absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 rounded-xl p-3 text-left shadow-2xl"
                >
                  <p className="mb-1 text-sm font-bold text-[var(--text)]">
                    {badge.emoji} {badge.label}
                  </p>
                  <p className="text-xs normal-case tracking-normal text-[var(--text-muted)]">{badge.description}</p>
                  <p
                    className="mt-1.5 text-[10px] font-semibold"
                    style={{ color: earned ? 'var(--success)' : 'var(--accent)' }}
                  >
                    {earned ? 'Earned ✓' : 'Not yet earned'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
