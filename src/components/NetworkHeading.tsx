export function NetworkHeading({ children, size = 'lg' }: { children: string; size?: 'lg' | 'md' }) {
  const textSize = size === 'lg' ? 'text-xl sm:text-2xl' : 'text-lg'

  return (
    <h2 className={`flex items-center gap-2.5 font-bold tracking-tight text-[var(--text)] ${textSize}`}>
      <span
        className="inline-block h-5 w-1.5 shrink-0 rounded-full"
        style={{
          backgroundImage: 'linear-gradient(180deg, var(--accent), var(--accent-secondary))',
          boxShadow: '0 0 12px color-mix(in srgb, var(--accent) 60%, transparent)',
        }}
      />
      <span className="gradient-text">{children}</span>
    </h2>
  )
}
