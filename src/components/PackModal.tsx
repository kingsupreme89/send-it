import { useMemo, useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { drawPackReward, type PackRewardDef } from '../achievements/packRewards'
import { FootballIcon, TrophyIcon } from './icons'
import type { NflTeam } from '../constants/nflTeams'

type PackStage = 'idle' | 'shuffling' | 'revealed'

const TIER_COLORS: Record<PackRewardDef['tier'], { border: string; glow: string; text: string }> = {
  Bronze: { border: 'var(--tier-bronze)', glow: 'var(--tier-bronze-2)', text: 'var(--tier-bronze-2)' },
  Silver: { border: 'var(--tier-silver)', glow: 'var(--tier-silver-2)', text: 'var(--tier-silver-2)' },
  Gold: { border: 'var(--tier-gold)', glow: 'var(--tier-gold-2)', text: 'var(--tier-gold-2)' },
  Legendary: {
    border: 'var(--tier-legendary-border)',
    glow: 'var(--tier-legendary-glow)',
    text: 'var(--tier-legendary-text)',
  },
}

export function PackModal({
  open,
  onClose,
  onClaim,
  team,
}: {
  open: boolean
  onClose: () => void
  onClaim: (reward: PackRewardDef) => void
  team: NflTeam
}) {
  const [stage, setStage] = useState<PackStage>('idle')
  const [reward, setReward] = useState<PackRewardDef | null>(null)

  const confetti = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${(i * 19 + 5) % 100}%`,
        delay: (i % 10) * 0.06,
        color: i % 2 === 0 ? team.primary : team.secondary,
        dx: `${((i * 11) % 30) - 15}vw`,
      })),
    [team],
  )

  const handleClose = () => {
    setStage('idle')
    setReward(null)
    onClose()
  }

  const handleRip = () => {
    setStage('shuffling')
    setTimeout(() => {
      setReward(drawPackReward())
      setStage('revealed')
    }, 900)
  }

  const handleClaim = () => {
    if (reward) onClaim(reward)
    handleClose()
  }

  const tier = reward ? TIER_COLORS[reward.tier] : TIER_COLORS.Bronze

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/[0.82] backdrop-blur-md" onClick={handleClose} />

          <div className="relative z-10 flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            {stage === 'idle' && (
              <button
                onClick={handleRip}
                className="relative h-[280px] w-[200px] overflow-hidden rounded-[20px] border-2 border-white/30"
                style={{
                  backgroundImage: 'linear-gradient(155deg, var(--accent), var(--accent-secondary))',
                  boxShadow: '0 20px 50px -10px color-mix(in srgb, var(--accent) 70%, transparent)',
                }}
              >
                <div className="shimmer-accent absolute inset-0 opacity-70" />
                <p className="relative mt-10 text-center text-[11px] font-extrabold tracking-[0.2em] text-white/85">
                  WEEKLY PACK
                </p>
                <div className="relative mt-6 flex justify-center text-white">
                  <FootballIcon size={52} />
                </div>
                <p className="relative mt-5 text-center text-xs font-extrabold text-white">TAP TO RIP</p>
              </button>
            )}

            {stage === 'shuffling' && (
              <>
                <div
                  className="locker-glow-pulse relative h-[280px] w-[200px] overflow-hidden rounded-[20px]"
                  style={{
                    backgroundImage: 'linear-gradient(155deg, var(--accent), var(--accent-secondary))',
                    boxShadow: '0 0 70px -6px var(--accent)',
                  }}
                >
                  <div className="shimmer-accent absolute inset-0" />
                </div>
                <p className="text-center text-xs font-extrabold tracking-[0.1em] text-white">RIPPING...</p>
              </>
            )}

            {stage === 'revealed' && reward && (
              <>
                <div
                  className="card-pop relative w-[220px] overflow-hidden rounded-[22px] p-[18px]"
                  style={{
                    aspectRatio: '0.7',
                    background: 'linear-gradient(155deg, #2a2416, #4a3d1a 45%, #1a1608)',
                    border: `2px solid ${tier.border}`,
                    boxShadow: `0 0 70px -4px ${tier.glow}`,
                  }}
                >
                  <div className="shimmer-accent absolute inset-0 opacity-40" />
                  <p
                    className="relative text-[10px] font-extrabold uppercase tracking-[0.2em]"
                    style={{ color: tier.text }}
                  >
                    {reward.tier} reward
                  </p>
                  <div className="relative mx-auto mt-[18px] w-fit" style={{ color: tier.text, filter: `drop-shadow(0 0 8px ${tier.glow})` }}>
                    <TrophyIcon size={46} />
                  </div>
                  <p
                    className="relative mt-3.5 text-center text-lg font-black text-white"
                    style={{ fontFamily: 'var(--font-teko)' }}
                  >
                    {reward.name}
                  </p>
                  <p className="relative mt-2 text-center text-[10px] leading-snug text-white/75">{reward.description}</p>
                </div>

                {confetti.map((c) => (
                  <span
                    key={c.id}
                    className="confetti-piece"
                    style={
                      {
                        top: '40%',
                        left: c.left,
                        width: 7,
                        height: 11,
                        background: c.color,
                        animationDelay: `${c.delay}s`,
                        ['--dx']: c.dx,
                      } as CSSProperties
                    }
                  />
                ))}

                <button
                  onClick={handleClaim}
                  className="rounded-full px-7 py-3 text-[13px] font-extrabold text-white"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                    boxShadow: '0 10px 24px -6px color-mix(in srgb, var(--accent) 60%, transparent)',
                  }}
                >
                  CLAIM
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
