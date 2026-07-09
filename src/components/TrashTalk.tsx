import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { TrashTalkComment } from '../types'
import { addTrashTalk } from '../games/useTrashTalk'

export function TrashTalk({
  gameId,
  currentUid,
  comments = [],
  nameFor,
}: {
  gameId: string
  currentUid: string
  comments?: TrashTalkComment[]
  nameFor: (uid: string) => string
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [pending, setPending] = useState(false)

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || pending) return
    setPending(true)
    try {
      await addTrashTalk(gameId, comments, {
        uid: currentUid,
        text: trimmed.slice(0, 160),
        createdAt: Date.now(),
      })
      setText('')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mt-2 border-t border-[var(--border)] pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
      >
        💬 Trash talk{comments.length > 0 ? ` (${comments.length})` : ''}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="mt-2 flex max-h-36 flex-col gap-1.5 overflow-y-auto">
              {comments.length === 0 && (
                <li className="text-[11px] text-[var(--text-muted)]">No talk yet — drop a line.</li>
              )}
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl bg-white/[0.03] px-2.5 py-1.5 text-left text-xs">
                  <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                    {nameFor(c.uid)}
                  </span>
                  <span className="text-[var(--text-muted)]"> · </span>
                  <span className="text-[var(--text)]">{c.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSend()
                }}
                maxLength={160}
                placeholder="Keep it spicy…"
                className="glass-input min-w-0 flex-1 rounded-xl px-3 py-1.5 text-xs normal-case"
              />
              <button
                onClick={() => void handleSend()}
                disabled={pending || !text.trim()}
                className="rounded-xl px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' }}
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
