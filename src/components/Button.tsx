import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', style, ...props }: ButtonProps) {
  const base =
    'px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100'
  const variants = {
    primary: 'text-white',
    secondary: 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] backdrop-blur-xl',
    ghost: 'bg-transparent text-[var(--text-muted)]',
  }
  const variantStyle =
    variant === 'primary'
      ? {
          backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
          boxShadow: '0 8px 24px -4px color-mix(in srgb, var(--accent) 50%, transparent)',
        }
      : undefined

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={{ ...variantStyle, ...style }}
      {...props}
    />
  )
}
