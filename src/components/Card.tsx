import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}
      {...props}
    />
  )
}
