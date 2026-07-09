import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'motion/react'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  className = '',
  style,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
    'relative overflow-hidden px-4 py-2.5 rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'text-white',
    secondary: 'glass text-[var(--text)]',
    ghost: 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]',
  }

  const variantStyle =
    variant === 'primary'
      ? {
          backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
          boxShadow: '0 10px 28px -8px color-mix(in srgb, var(--accent) 55%, transparent)',
        }
      : undefined

  return (
    <motion.button
      type={type}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={`${base} ${variants[variant]} ${className}`}
      style={{ ...variantStyle, ...style }}
      disabled={disabled}
      {...props}
    >
      {variant === 'primary' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
