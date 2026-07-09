import { useEffect, useMemo, useState } from 'react'
import { usePlayers } from '../players/usePlayers'
import { logGame } from './useLogGame'
import { GAME_MODES, MADDEN_VERSIONS, emptyGameStatLine, type GameMode, type GameStatLine, type MaddenVersion } from '../types'
import type { TeamId } from '../constants/nflTeams'
import { TeamPicker } from '../components/TeamPicker'
import { NetworkHeading } from '../components/NetworkHeading'
import { PlayerPicker } from '../components/PlayerPicker'
import { StatInput } from '../components/StatInput'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

import type { CelebrationPayload } from '../components/WinCelebration'

export function LogGameForm({
  currentUid,
  onLogged,
}: {
  currentUid: string
  onLogged: (celebration: CelebrationPayload) => void
}) {
  const { players } = usePlayers()
  const [gameMode, setGameMode] = useState<GameMode>('1v1_regular')
  const [maddenVersion, setMaddenVersion] = useState<MaddenVersion>('madden27')
  const [teammateId, setTeammateId] = useState<string | null>(null)
  const [opponent1Id, setOpponent1Id] = useState<string | null>(null)
  const [opponent2Id, setOpponent2Id] = useState<string | null>(null)
  const [winnerTeam, setWinnerTeam] = useState<TeamId | null>(null)
  const [loserTeam, setLoserTeam] = useState<TeamId | null>(null)
  const [winnerScore, setWinnerScore] = useState('')
  const [loserScore, setLoserScore] = useState('')
  const [comebackDeficit, setComebackDeficit] = useState('')
  const [statsByUid, setStatsByUid] = useState<Record<string, GameStatLine>>({})
  const [clipUrl, setClipUrl] = useState('')
  const [clipPhoto, setClipPhoto] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const is2v2 = gameMode === '2v2_regular'

  const winnerIds = useMemo(
    () => [currentUid, ...(is2v2 && teammateId ? [teammateId] : [])],
    [currentUid, is2v2, teammateId],
  )
  const loserIds = useMemo(
    () => [opponent1Id, ...(is2v2 ? [opponent2Id] : [])].filter((id): id is string => !!id),
    [opponent1Id, opponent2Id, is2v2],
  )

  const participantIds = [...winnerIds, ...loserIds]
  const nameFor = (uid: string) => players.find((p) => p.uid === uid)?.displayName ?? 'Player'

  const getStat = (uid: string) => statsByUid[uid] ?? emptyGameStatLine()
  const setStat = (uid: string, field: keyof GameStatLine, value: number) => {
    setStatsByUid((prev) => ({ ...prev, [uid]: { ...getStat(uid), [field]: value } }))
  }

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

  const canSubmit =
    winnerIds.every(Boolean) &&
    (!is2v2 || teammateId) &&
    opponent1Id &&
    (!is2v2 || opponent2Id) &&
    winnerTeam &&
    loserTeam &&
    winnerScore !== '' &&
    loserScore !== '' &&
    !submitting

  const handleSubmit = async () => {
    if (!canSubmit || !winnerTeam || !loserTeam) return
    setSubmitting(true)
    try {
      const stats: Record<string, GameStatLine> = {}
      participantIds.forEach((uid) => {
        stats[uid] = getStat(uid)
      })

      const wScore = Number(winnerScore)
      const lScore = Number(loserScore)
      const deficit = comebackDeficit === '' ? 0 : Number(comebackDeficit)
      const scoreDiff = wScore - lScore

      await logGame({
        gameMode,
        maddenVersion,
        winnerIds,
        loserIds,
        loggedBy: currentUid,
        winnerTeam,
        loserTeam,
        winnerScore: wScore,
        loserScore: lScore,
        comebackDeficit: deficit,
        stats,
        clipUrl: clipUrl.trim() || undefined,
        clipPhoto,
      })
      onLogged({
        winnerNames: winnerIds.map(nameFor),
        loserNames: loserIds.map(nameFor),
        winnerScore: wScore,
        loserScore: lScore,
        isBlowout: scoreDiff > 21,
        isComeback: deficit >= 17,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <div className="mb-4">
        <NetworkHeading size="md">Log a game</NetworkHeading>
        <p className="mt-1 text-xs text-[var(--text-muted)]">You won — fill in how it went.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Mode</span>
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value as GameMode)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
            >
              {GAME_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Madden version</span>
            <select
              value={maddenVersion}
              onChange={(e) => setMaddenVersion(e.target.value as MaddenVersion)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
            >
              {MADDEN_VERSIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {is2v2 && (
          <PlayerPicker
            players={players}
            value={teammateId}
            onChange={setTeammateId}
            label="Your teammate"
            excludeIds={[currentUid, opponent1Id, opponent2Id].filter((x): x is string => !!x)}
          />
        )}

        <PlayerPicker
          players={players}
          value={opponent1Id}
          onChange={setOpponent1Id}
          label={is2v2 ? 'Opponent 1' : 'Opponent'}
          excludeIds={[currentUid, teammateId, opponent2Id].filter((x): x is string => !!x)}
        />

        {is2v2 && (
          <PlayerPicker
            players={players}
            value={opponent2Id}
            onChange={setOpponent2Id}
            label="Opponent 2"
            excludeIds={[currentUid, teammateId, opponent1Id].filter((x): x is string => !!x)}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <TeamPicker label="Your team" value={winnerTeam} onChange={setWinnerTeam} />
          <TeamPicker label="Opponent's team" value={loserTeam} onChange={setLoserTeam} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Your score</span>
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
            <span className="font-medium text-[var(--text)]">Opponent score</span>
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
          <span className="font-medium text-[var(--text)]">Biggest deficit you overcame (optional)</span>
          <input
            type="number"
            min={0}
            value={comebackDeficit}
            onChange={(e) => setComebackDeficit(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="e.g. 21 if you were down by 21 at some point"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
          />
        </label>

        {participantIds.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[var(--text)]">Stats</h3>
            {participantIds.map((uid) => (
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
        )}

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--text)]">Got a clip?</h3>
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
            <span className="font-medium text-[var(--text)]">Add a photo (optional, photos only)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
            />
          </label>
          {photoError && <p className="text-xs font-medium text-red-400">{photoError}</p>}
          {clipPhotoPreviewUrl && (
            <img
              src={clipPhotoPreviewUrl}
              alt="Clip preview"
              className="max-h-40 rounded-xl border border-[var(--border)] object-cover"
            />
          )}
        </div>

        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? 'Saving...' : 'Log game'}
        </Button>
      </div>
    </Card>
  )
}
