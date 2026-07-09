import { useEffect, useMemo, useState } from 'react'
import { editGame, deleteGame } from './useEditGame'
import { emptyGameStatLine, GAME_MODES, type GameStatLine } from '../types'
import type { GameDoc } from '../types'
import type { Player } from '../types'
import type { TeamId } from '../constants/nflTeams'
import { TeamPicker } from '../components/TeamPicker'
import { NetworkHeading } from '../components/NetworkHeading'
import { StatInput } from '../components/StatInput'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

export function EditGameForm({
  game,
  players,
  onSaved,
  onCancel,
}: {
  game: GameDoc
  players: Player[]
  onSaved: () => void
  onCancel: () => void
}) {
  const nameFor = (uid: string) => players.find((p) => p.uid === uid)?.displayName ?? 'Player'
  const modeLabel = GAME_MODES.find((m) => m.id === game.gameMode)?.label ?? game.gameMode

  const [winnerTeam, setWinnerTeam] = useState<TeamId>(game.winnerTeam)
  const [loserTeam, setLoserTeam] = useState<TeamId>(game.loserTeam)
  const [winnerScore, setWinnerScore] = useState(String(game.winnerScore))
  const [loserScore, setLoserScore] = useState(String(game.loserScore))
  const [comebackDeficit, setComebackDeficit] = useState(String(game.comebackDeficit || ''))
  const [statsByUid, setStatsByUid] = useState<Record<string, GameStatLine>>(
    Object.fromEntries(
      [...game.winnerIds, ...game.loserIds].map((uid) => [
        uid,
        game.stats[uid] ?? emptyGameStatLine(),
      ]),
    ),
  )
  const [clipUrl, setClipUrl] = useState(game.clipUrl ?? '')
  const [clipPhoto, setClipPhoto] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const getStat = (uid: string) => statsByUid[uid] ?? emptyGameStatLine()
  const setStat = (uid: string, field: keyof GameStatLine, value: number) =>
    setStatsByUid((prev) => ({ ...prev, [uid]: { ...getStat(uid), [field]: value } }))

  const handlePhotoChange = (file: File | null) => {
    if (file && !file.type.startsWith('image/')) {
      setPhotoError('Photos only — no videos.')
      setClipPhoto(null)
      return
    }
    setPhotoError(null)
    setClipPhoto(file)
  }

  const clipPhotoPreviewUrl = useMemo(() => (clipPhoto ? URL.createObjectURL(clipPhoto) : null), [clipPhoto])
  useEffect(() => {
    return () => {
      if (clipPhotoPreviewUrl) URL.revokeObjectURL(clipPhotoPreviewUrl)
    }
  }, [clipPhotoPreviewUrl])

  const canSave = winnerScore !== '' && loserScore !== '' && !saving

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await editGame(
        game.id,
        {
          winnerTeam,
          loserTeam,
          winnerScore: Number(winnerScore),
          loserScore: Number(loserScore),
          comebackDeficit: comebackDeficit === '' ? 0 : Number(comebackDeficit),
          stats: statsByUid,
          clipUrl: clipUrl.trim(),
          clipPhoto,
        },
        game,
      )
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      await deleteGame(game.id, game)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game.')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  const allIds = [...game.winnerIds, ...game.loserIds]

  return (
    <Card className="mx-auto w-full max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <NetworkHeading>Edit Game</NetworkHeading>
        <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text-muted)]">
          {modeLabel}
        </span>
      </div>

      <div className="mb-4 rounded-xl bg-[var(--surface)] p-3 text-sm">
        <p className="text-xs text-[var(--text-muted)] mb-1">Result (cannot change)</p>
        <p className="font-bold text-[var(--text)]">
          {game.winnerIds.map(nameFor).join(' & ')} def. {game.loserIds.map(nameFor).join(' & ')}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <TeamPicker label="Winner team" value={winnerTeam} onChange={(v) => v && setWinnerTeam(v)} />
          <TeamPicker label="Loser team" value={loserTeam} onChange={(v) => v && setLoserTeam(v)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Winner score</span>
            <input
              type="number"
              min={0}
              value={winnerScore}
              onChange={(e) => setWinnerScore(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Loser score</span>
            <input
              type="number"
              min={0}
              value={loserScore}
              onChange={(e) => setLoserScore(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--text)]">Comeback deficit (optional)</span>
          <input
            type="number"
            min={0}
            value={comebackDeficit}
            onChange={(e) => setComebackDeficit(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="0"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
          />
        </label>

        <div className="flex flex-col gap-3">
          <NetworkHeading size="md">Stats</NetworkHeading>
          {allIds.map((uid) => (
            <div key={uid} className="rounded-xl border border-[var(--border)] p-3">
              <p className="mb-2 text-sm font-medium text-[var(--text)]">{nameFor(uid)}</p>
              <div className="grid grid-cols-2 gap-2">
                <StatInput label="Passing yds" value={getStat(uid).passingYds} onChange={(v) => setStat(uid, 'passingYds', v)} />
                <StatInput label="Rushing yds" value={getStat(uid).rushingYds} onChange={(v) => setStat(uid, 'rushingYds', v)} />
                <StatInput label="Interceptions" value={getStat(uid).interceptions} onChange={(v) => setStat(uid, 'interceptions', v)} />
                <StatInput label="Sacks" value={getStat(uid).sacks} onChange={(v) => setStat(uid, 'sacks', v)} />
                <StatInput label="INT return TDs" value={getStat(uid).interceptionTDs} onChange={(v) => setStat(uid, 'interceptionTDs', v)} />
                <StatInput label="Kick return TDs" value={getStat(uid).kickReturnTDs} onChange={(v) => setStat(uid, 'kickReturnTDs', v)} />
                <StatInput label="Punt return TDs" value={getStat(uid).puntReturnTDs} onChange={(v) => setStat(uid, 'puntReturnTDs', v)} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--text)]">Clip</h3>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Clip link (optional)</span>
            <input
              type="url"
              value={clipUrl}
              onChange={(e) => setClipUrl(e.target.value)}
              placeholder="Paste your PS/Xbox share link, YouTube, etc."
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">{game.photoUrl ? 'Replace photo' : 'Add a photo'} (optional, photos only)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
            />
          </label>
          {photoError && <p className="text-xs font-medium text-red-400">{photoError}</p>}
          <img
            src={clipPhotoPreviewUrl ?? game.photoUrl ?? undefined}
            alt="Clip preview"
            className={`max-h-40 rounded-xl border border-[var(--border)] object-cover ${clipPhotoPreviewUrl || game.photoUrl ? '' : 'hidden'}`}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400">{error}</p>
        )}

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={!canSave} className="flex-1">
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
          <button
            onClick={onCancel}
            className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)]"
          >
            Cancel
          </button>
        </div>

        <div className="border-t border-[var(--border)] pt-4">
          {confirmingDelete ? (
            <div className="flex flex-col gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm font-semibold text-red-400">
                Delete this game for good? It'll remove the W/L and stats it contributed for everyone in it.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete it'}
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)]"
                >
                  Never mind
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="text-sm font-semibold text-red-400 transition-colors hover:text-red-300"
            >
              Delete game
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
