export function NetworkHeading({ children, size = 'lg' }: { children: string; size?: 'lg' | 'md' }) {
  const textSize = size === 'lg' ? 'text-2xl' : 'text-xl'
  const compact = children.length <= 16

  if (compact) {
    return (
      <h2 className={`inline-flex items-center font-bold ${textSize}`}>
        <span className="inline-block px-3 py-1" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))', transform: 'skewX(-12deg)' }}>
          <span className="inline-block font-extrabold text-white" style={{ transform: 'skewX(12deg)' }}>
            {children}
          </span>
        </span>
      </h2>
    )
  }

  return (
    <h2 className={`flex items-center gap-2.5 font-bold text-[var(--text)] ${textSize}`}>
      <span className="inline-block h-5 w-2.5 shrink-0" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))', transform: 'skewX(-20deg)' }} />
      {children}
    </h2>
  )
}
