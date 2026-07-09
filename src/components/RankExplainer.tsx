import { useState } from 'react'

export function RankExplainer({ modeLabel }: { modeLabel: string }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-semibold underline decoration-dotted"
        style={{ color: 'var(--accent)' }}
      >
        How rankings work
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full z-20 mt-1 w-64 rounded-xl border border-[var(--border)] p-3 text-left text-xs shadow-2xl"
            style={{ background: 'var(--surface-solid)' }}
          >
            <p className="mb-1 font-bold text-[var(--text)]">AP-style ranking</p>
            <p className="text-[var(--text-muted)]">
              Like a college football poll — everyone in {modeLabel} is ranked #1 to #N off one composite: win%,
              passing yds/game, rushing yds/game, interceptions/game, sacks/game, return and pick-six TDs/game, and
              points/game, each weighted equally. A new player slots in automatically the moment they log a game, and
              the board reshuffles after every game.
            </p>
          </div>
        </>
      )}
    </span>
  )
}
