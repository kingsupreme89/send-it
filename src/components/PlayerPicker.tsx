import { useState } from 'react'
import type { Player } from '../types'
import { PlayerAvatar } from './PlayerAvatar'

interface PlayerPickerProps {
  players: Player[]
  value: string | null
  onChange: (uid: string) => void
  label: string
  excludeIds?: string[]
  id?: string
}

export function PlayerPicker({ players, value, onChange, label, excludeIds = [], id }: PlayerPickerProps) {
  const [open, setOpen] = useState(false)
  const options = players.filter((p) => !excludeIds.includes(p.uid))
  const selected = players.find((p) => p.uid === value)

  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-[var(--text)]">{label}</span>
      <button
        type="button"
        id={id}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-[var(--text)]"
      >
        {selected ? (
          <>
            <PlayerAvatar photoURL={selected.photoURL} displayName={selected.displayName} size={22} />
            <span className="truncate">{selected.displayName}</span>
          </>
        ) : (
          <span className="text-[var(--text-muted)]">Select a player</span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-[var(--border-strong)] bg-[#0d0e15] p-4"
            style={{ boxShadow: '0 -20px 60px rgba(0,0,0,0.6)' }}
          >
            <p className="mb-3 px-1 text-sm font-semibold text-[var(--text)]">{label}</p>
            <div className="flex flex-col gap-1">
              {options.length === 0 ? (
                <p className="px-1 py-2 text-sm text-[var(--text-muted)]">No players available.</p>
              ) : (
                options.map((p) => {
                  const isSelected = p.uid === value
                  return (
                    <button
                      key={p.uid}
                      type="button"
                      onClick={() => {
                        onChange(p.uid)
                        setOpen(false)
                      }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                      style={{ background: isSelected ? 'var(--surface-strong)' : undefined }}
                    >
                      <PlayerAvatar photoURL={p.photoURL} displayName={p.displayName} size={30} />
                      <span className="flex-1 truncate text-sm font-semibold text-[var(--text)]">{p.displayName}</span>
                      {isSelected && (
                        <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
