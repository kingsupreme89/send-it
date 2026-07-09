import { useState } from 'react'
import { BADGES } from './badgeRules'

export function BadgeCase({ badgeIds }: { badgeIds: string[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const allBadges = Object.values(BADGES)

  return (
    <div className="flex flex-wrap gap-3">
      {allBadges.map((badge) => {
        const earned = badgeIds.includes(badge.id)
        const active = activeId === badge.id
        return (
          <div key={badge.id} className="relative">
            <button
              onClick={() => setActiveId((cur) => (cur === badge.id ? null : badge.id))}
              onMouseEnter={() => setActiveId(badge.id)}
              onMouseLeave={() => setActiveId((cur) => (cur === badge.id ? null : cur))}
              aria-label={`${badge.label}${earned ? '' : ' (locked)'}`}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border text-2xl transition-all duration-150 active:scale-95"
              style={
                earned
                  ? {
                      backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                      borderColor: 'transparent',
                      boxShadow: '0 4px 14px -2px color-mix(in srgb, var(--accent) 60%, transparent)',
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
            </button>

            {active && (
              <div
                className="absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 rounded-xl border border-[var(--border)] p-3 text-left shadow-2xl"
                style={{ background: 'var(--surface-solid)' }}
              >
                <p className="mb-1 text-sm font-bold text-[var(--text)]">
                  {badge.emoji} {badge.label}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{badge.description}</p>
                <p
                  className="mt-1.5 text-[10px] font-semibold"
                  style={{ color: earned ? '#4ade80' : 'var(--accent)' }}
                >
                  {earned ? 'Earned ✓' : 'Not yet earned'}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
