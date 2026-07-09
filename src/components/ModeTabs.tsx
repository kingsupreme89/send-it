import { motion } from 'motion/react'
import { GAME_MODES, type GameMode } from '../types'

export function ModeTabs({ value, onChange }: { value: GameMode; onChange: (mode: GameMode) => void }) {
  return (
    <div className="glass flex gap-1 rounded-2xl p-1">
      {GAME_MODES.map((m) => {
        const active = value === m.id
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className="relative flex-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors sm:text-xs"
            style={{ color: active ? 'white' : 'var(--text-muted)' }}
          >
            {active && (
              <motion.span
                layoutId="mode-tab-pill"
                className="absolute inset-0 rounded-xl"
                style={{
                  backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                  boxShadow: '0 4px 16px -4px color-mix(in srgb, var(--accent) 55%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
