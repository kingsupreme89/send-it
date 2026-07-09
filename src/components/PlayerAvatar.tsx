interface PlayerAvatarProps {
  photoURL: string | null
  displayName: string
  size?: number
}

export function PlayerAvatar({ photoURL, displayName, size = 40 }: PlayerAvatarProps) {
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const ringStyle = {
    width: size,
    height: size,
    padding: Math.max(2, size * 0.05),
    backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
  }

  if (photoURL) {
    return (
      <div className="rounded-full" style={ringStyle}>
        <img
          src={photoURL}
          alt={displayName}
          className="h-full w-full rounded-full object-cover"
          style={{ border: '2px solid var(--bg)' }}
        />
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  )
}
