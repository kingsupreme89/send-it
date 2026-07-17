import type { NflTeam } from '../constants/nflTeams'

interface LockerRoomBackgroundProps {
  team: NflTeam
  lockerSkin: 'vertical' | 'diagonal'
  lockerPickInitials?: string | null
}

const LEFT_DOOR_BGS = [
  'linear-gradient(160deg, #1c1e26, #101218)',
  'linear-gradient(160deg, #191b22, #0d0f15)',
  'linear-gradient(160deg, #1c1e26, #101218)',
  'linear-gradient(160deg, #191b22, #0d0f15)',
]

function LockerDoor({ bg, side }: { bg: string; side: 'left' | 'right' }) {
  const edge = side === 'left' ? { left: 0 } : { right: 0 }
  const handle = side === 'left' ? { right: '8%' } : { left: '8%' }
  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        borderRight: side === 'left' ? '2px solid rgba(0,0,0,0.65)' : undefined,
        borderLeft: side === 'right' ? '2px solid rgba(0,0,0,0.65)' : undefined,
        backgroundImage: `linear-gradient(${side === 'left' ? 100 : 260}deg, rgba(255,255,255,0.05), transparent 30%), ${bg}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 3,
          background: 'var(--accent)',
          boxShadow: '0 0 12px 2px color-mix(in srgb, var(--accent) 80%, transparent)',
          opacity: 0.85,
          ...edge,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '6%',
          left: '12%',
          right: '12%',
          height: '9%',
          borderRadius: 2,
          background: 'color-mix(in srgb, var(--accent-secondary) 55%, #0a0b10)',
          boxShadow: '0 0 8px color-mix(in srgb, var(--accent-secondary) 60%, transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '18%',
          right: '18%',
          height: '7%',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.16) 0 2px, transparent 2px 5px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          width: 6,
          height: 22,
          borderRadius: 3,
          background: 'linear-gradient(180deg, #dfe3e8, #8a8f96)',
          ...handle,
        }}
      />
    </div>
  )
}

export function LockerRoomBackground({ team, lockerSkin, lockerPickInitials }: LockerRoomBackgroundProps) {
  const wallPattern =
    lockerSkin === 'diagonal'
      ? 'repeating-linear-gradient(45deg, transparent 0 18px, color-mix(in srgb, var(--accent) 12%, transparent) 18px 20px)'
      : 'repeating-linear-gradient(0deg, transparent 0 18px, color-mix(in srgb, var(--accent) 10%, transparent) 18px 20px)'

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        background: '#08090d',
        perspective: 1000,
      }}
    >
      {/* Ceiling */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '9%',
          background: 'linear-gradient(180deg, #14161c, #08090d)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '9%',
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '1.5%',
          left: 0,
          right: 0,
          height: '3%',
          backgroundImage:
            'repeating-linear-gradient(84deg, transparent 0 30px, color-mix(in srgb, var(--accent) 70%, white 30%) 30px 34px, transparent 34px 64px)',
          opacity: 0.8,
          filter: 'blur(0.3px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '4.5%',
          left: 0,
          right: 0,
          height: '1.5%',
          backgroundImage:
            'repeating-linear-gradient(96deg, transparent 0 46px, color-mix(in srgb, var(--accent-secondary) 60%, white 20%) 46px 49px, transparent 49px 90px)',
          opacity: 0.5,
        }}
      />

      {/* Back wall */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '16%',
          right: '16%',
          height: '42%',
          backgroundImage: `${wallPattern}, linear-gradient(180deg, color-mix(in srgb, var(--accent) 14%, #16181f) 0%, #101116 100%)`,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ position: 'absolute', inset: '6%', border: '1px solid color-mix(in srgb, var(--accent) 45%, transparent)', opacity: 0.5 }} />
        <p
          style={{
            margin: '8% 0 0',
            textAlign: 'center',
            fontFamily: 'var(--font-teko)',
            fontWeight: 700,
            fontSize: 'clamp(20px, 6vw, 34px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'transparent',
            WebkitTextStroke: '1.2px color-mix(in srgb, var(--accent) 75%, white 25%)',
            opacity: 0.8,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textShadow: '0 0 18px color-mix(in srgb, var(--accent) 60%, transparent)',
          }}
        >
          {team.name}
        </p>
        <p
          style={{
            margin: '2% 0 0',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: '0.35em',
            color: 'color-mix(in srgb, var(--accent-secondary) 85%, white 20%)',
            opacity: 0.65,
          }}
        >
          LOCKER ROOM
        </p>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '15%',
            right: '15%',
            height: '34%',
            background: 'radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--accent) 48%, transparent), transparent 75%)',
            opacity: 0.65,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'color-mix(in srgb, var(--accent) 70%, white 15%)',
            boxShadow: '0 0 14px 2px color-mix(in srgb, var(--accent) 70%, transparent)',
          }}
        />
      </div>

      {/* Left locker bank */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: 0,
          width: '18%',
          height: '52%',
          transformOrigin: 'right center',
          transform: 'rotateY(28deg)',
          display: 'flex',
          boxShadow: '4px 0 30px rgba(0,0,0,0.6)',
        }}
      >
        {LEFT_DOOR_BGS.map((bg, i) => (
          <LockerDoor key={i} bg={bg} side="left" />
        ))}
      </div>

      {/* Right locker bank */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          right: 0,
          width: '18%',
          height: '52%',
          transformOrigin: 'left center',
          transform: 'rotateY(-28deg)',
          display: 'flex',
          boxShadow: '-4px 0 30px rgba(0,0,0,0.6)',
        }}
      >
        {LEFT_DOOR_BGS.map((bg, i) => (
          <LockerDoor key={i} bg={bg} side="right" />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: 0,
          width: '20%',
          height: '10%',
          background: 'radial-gradient(ellipse at left, color-mix(in srgb, var(--accent) 45%, transparent), transparent 75%)',
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '55%',
          right: 0,
          width: '20%',
          height: '10%',
          background: 'radial-gradient(ellipse at right, color-mix(in srgb, var(--accent) 45%, transparent), transparent 75%)',
          opacity: 0.5,
        }}
      />

      {/* Floor */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '42%',
          background: 'linear-gradient(180deg, #22242c 0%, #0d0e12 55%, #08090d 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '42%',
          backgroundImage: 'repeating-linear-gradient(100deg, rgba(255,255,255,0.09) 0 1.5px, transparent 1.5px 40px)',
          opacity: 0.65,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '10%',
          right: '10%',
          bottom: '6%',
          height: '3%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          opacity: 0.5,
          filter: 'blur(2px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '22%',
          background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent) 26%, transparent) 60%, transparent)',
          opacity: 0.55,
        }}
      />

      {/* Bench */}
      <div
        style={{
          position: 'absolute',
          bottom: '15.5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '36%',
          height: '3.6%',
          borderRadius: 6,
          background: 'linear-gradient(180deg, #262b33, #14171c)',
          boxShadow: '0 2px 0 rgba(255,255,255,0.08) inset, 0 8px 20px rgba(0,0,0,0.55)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15.5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '36%',
          height: 1,
          background: 'color-mix(in srgb, var(--accent) 60%, transparent)',
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28%',
          height: '4%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.55), transparent 70%)',
          opacity: 0.65,
        }}
      />

      {/* Crest + reflection */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', opacity: 0.75 }}
      >
        <polygon points="50,6 90,30 90,70 50,94 10,70 10,30" fill="none" stroke="var(--accent)" strokeWidth={3} />
        <polygon points="50,22 76,37 76,63 50,78 24,63 24,37" fill="none" stroke="var(--accent-secondary)" strokeWidth={2} />
      </svg>
      <svg
        width="80"
        height="34"
        viewBox="0 0 100 42"
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%) scaleY(-1)',
          opacity: 0.2,
          filter: 'blur(1.5px)',
        }}
      >
        <polygon points="50,6 90,26 90,42 10,42 10,26" fill="none" stroke="var(--accent)" strokeWidth={3} />
      </svg>

      <div
        className="locker-glow-pulse"
        style={{
          position: 'absolute',
          top: '-6%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          height: '45%',
          background: 'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent) 55%, transparent), transparent 68%)',
          mixBlendMode: 'screen',
        }}
      />

      {lockerPickInitials && (
        <div
          style={{
            position: 'absolute',
            top: '14%',
            left: '4%',
            width: 44,
            height: 44,
            borderRadius: 10,
            border: '2px solid rgba(255,255,255,0.5)',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 900,
            color: 'white',
            boxShadow: '0 0 20px color-mix(in srgb, var(--accent) 60%, transparent)',
            zIndex: 2,
          }}
        >
          {lockerPickInitials}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, transparent 38%, rgba(3,4,7,0.45) 80%, #030407 100%)',
        }}
      />
    </div>
  )
}
