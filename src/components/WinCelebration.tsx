import { useMemo, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './Button'

export interface CelebrationPayload {
  winnerNames: string[]
  loserNames: string[]
  winnerScore: number
  loserScore: number
  isBlowout?: boolean
  isComeback?: boolean
}

const COLORS = ['#3b82f6', '#8b5cf6', '#34d399', '#fbbf24', '#fb7185', '#22d3ee', '#f472b6']

export function WinCelebration({
  data,
  onDone,
}: {
  data: CelebrationPayload | null
  onDone: () => void
}) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 7) % 100}%`,
        delay: (i % 12) * 0.05,
        color: COLORS[i % COLORS.length],
        dx: `${((i * 13) % 40) - 20}vw`,
        w: 6 + (i % 5),
        h: 10 + (i % 7),
      })),
    [],
  )

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onDone} />

          {pieces.map((p) => (
            <span
              key={p.id}
              className="confetti-piece"
              style={
                {
                  left: p.left,
                  width: p.w,
                  height: p.h,
                  background: p.color,
                  animationDelay: `${p.delay}s`,
                  ['--dx']: p.dx,
                } as CSSProperties
              }
            />
          ))}

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="glass-strong shine-border relative z-10 w-full max-w-sm rounded-[1.75rem] p-7 text-center"
          >
            <motion.p
              className="mb-2 text-5xl"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.25, 1] }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              {data.isBlowout ? '💥' : data.isComeback ? '🔥' : '🏆'}
            </motion.p>
            <h2 className="gradient-text text-3xl font-extrabold tracking-tight">SEND IT!</h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {data.winnerNames.join(' & ')} took down {data.loserNames.join(' & ')}
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--text)]">
              {data.winnerScore}
              <span className="mx-1 text-lg text-[var(--text-muted)]">–</span>
              {data.loserScore}
            </p>
            {(data.isBlowout || data.isComeback) && (
              <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                {data.isBlowout ? 'BLOWOUT' : 'COMEBACK WIN'}
              </p>
            )}
            <div className="mt-6">
              <Button onClick={onDone} className="w-full">
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
