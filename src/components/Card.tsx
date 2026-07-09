import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'

type CardProps = {
  className?: string
  strong?: boolean
  hover?: boolean
  style?: CSSProperties
  children?: ReactNode
  onClick?: () => void
}

export function Card({ className = '', strong = false, hover = true, style, children, onClick }: CardProps) {
  const glassClass = strong ? 'glass-strong' : 'glass'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`rounded-[var(--radius-card)] p-5 ${glassClass} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
