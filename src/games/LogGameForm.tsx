import { useEffect, useMemo, useState } from 'react'
import { usePlayers } from '../players/usePlayers'
import { logGame } from './useLogGame'
import { GAME_MODES, MADDEN_VERSIONS, emptyGameStatLine, type GameMode, type GameStatLine, type MaddenVersion } from '../types'
import { extractGameDataFromImage, type ParsedGameFields } from '../utils/ocrStats'
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
  const [uploaderId, setUploaderId] = useState<string | null>(currentUid)
  const [teammateId, setTeammateId] = useState<string | null>(null)
  const [opponent1Id, setOpponent1Id] = useState<string | null>(null)
  const [opponent2Id, setOpponent2Id] = useState<string | null>(null)
  const [challengerId, setChallengerId] = useState<string | null>(null)
  const [winnerTeam, setWinnerTeam] = useState<TeamId | null>(null)
  const [loserTeam, setLoserTeam] = useState<TeamId | null>(null)
  const [winnerScore, setWinnerScore] = useState('')
  const [loserScore, setLoserScore] = useState('')
  const [comebackDeficit, setComebackDeficit] = useState('')
  const [statsByUid, setStatsByUid] = useState<Record<string, GameStatLine>>({})
  const [clipUrl, setClipUrl] = useState('')
  const [clipPhoto, setClipPhoto] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [parsingPhoto, setParsingPhoto] = useState(false)
  const [parseMessage, setParseMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [parsedPhotoFields, setParsedPhotoFields] = useState<ParsedGameFields | null>(null)
  const [photoReviewConfirmed, setPhotoReviewConfirmed] = useState(false)

  const is2v2 = gameMode === '2v2_regular'

  const uploader = uploaderId ?? currentUid
  const winnerIds = useMemo(
    () => [uploader, ...(is2v2 && teammateId ? [teammateId] : [])],
    [uploader, is2v2, teammateId],
  )
  const loserIds = useMemo(
    () => [challengerId ?? opponent1Id, ...(is2v2 ? [opponent2Id] : [])].filter((id): id is string => !!id),
    [challengerId, opponent1Id, opponent2Id, is2v2],
  )

  const participantIds = [...winnerIds, ...loserIds]
  const nameFor = (uid: string) => players.find((p) => p.uid === uid)?.displayName ?? 'Player'

  const getStat = (uid: string) => statsByUid[uid] ?? emptyGameStatLine()
  const setStat = (uid: string, field: keyof GameStatLine, value: number) => {
    setStatsByUid((prev) => ({ ...prev, [uid]: { ...getStat(uid), [field]: value } }))
  }

  const handlePhotoChange = async (file: File | null) => {
    if (!file) {
      setClipPhoto(null)
      setParsedPhotoFields(null)
      setPhotoReviewConfirmed(false)
      setParseMessage(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError('Photos only — no videos.')
      setClipPhoto(null)
      return
    }
    setPhotoError(null)
    setClipPhoto(file)
    setParsedPhotoFields(null)
    setPhotoReviewConfirmed(false)
    setParsingPhoto(true)
    setParseMessage('Reading the screenshot…')
    try {
      const parsed = await extractGameDataFromImage(file)
      setParsedPhotoFields(parsed)
      if (parsed.winnerScore !== null && parsed.loserScore !== null) {
        setWinnerScore(String(parsed.winnerScore))
        setLoserScore(String(parsed.loserScore))
      }
      if (parsed.comebackDeficit !== null) {
        setComebackDeficit(String(parsed.comebackDeficit))
      }
      if (parsed.passingYds !== null) {
        const firstUid = participantIds[0]
        if (firstUid) {
          setStat(firstUid, 'passingYds', parsed.passingYds)
        }
      }
      if (parsed.rushingYds !== null) {
        const firstUid = participantIds[0]
        if (firstUid) {
          setStat(firstUid, 'rushingYds', parsed.rushingYds)
        }
      }
      if (parsed.interceptions !== null) {
        const firstUid = participantIds[0]
        if (firstUid) {
          setStat(firstUid, 'interceptions', parsed.interceptions)
        }
      }
      if (parsed.sacks !== null) {
        const firstUid = participantIds[0]
        if (firstUid) {
          setStat(firstUid, 'sacks', parsed.sacks)
        }
      }
      if (parsed.interceptionTDs !== null) {
        const firstUid = participantIds[0]
        if (firstUid) {
          setStat(firstUid, 'interceptionTDs', parsed.interceptionTDs)
        }
      }
      if (parsed.kickReturnTDs !== null) {
        const firstUid = participantIds[0]
        if (firstUid) {
          setStat(firstUid, 'kickReturnTDs', parsed.kickReturnTDs)
        }
      }
      if (parsed.puntReturnTDs !== null) {
        const firstUid = participantIds[0]
        if (firstUid) {
          setStat(firstUid, 'puntReturnTDs', parsed.puntReturnTDs)
        }
      }
      setParseMessage('Filled in what we could from the photo. Review before saving.')
    } catch {
      setPhotoError('We could not read the photo. You can still enter the stats manually.')
      setParseMessage(null)
    } finally {
      setParsingPhoto(false)
    }
  }

  const clipPhotoPreviewUrl = useMemo(() => (clipPhoto ? URL.createObjectURL(clipPhoto) : null), [clipPhoto])
  useEffect(() => {
    return () => {
      if (clipPhotoPreviewUrl) URL.revokeObjectURL(clipPhotoPreviewUrl)
    }
  }, [clipPhotoPreviewUrl])

  const hasPhoto = Boolean(clipPhoto)
  const photoReviewRequired = hasPhoto && parsedPhotoFields !== null
  const canSubmit =
    winnerIds.every(Boolean) &&
    uploaderId &&
    (!is2v2 || teammateId) &&
    (challengerId || opponent1Id) &&
    (!is2v2 || opponent2Id) &&
    winnerTeam &&
    loserTeam &&
    (hasPhoto || (winnerScore !== '' && loserScore !== '')) &&
    (!photoReviewRequired || photoReviewConfirmed) &&
    !submitting

  const handleSubmit = async () => {
    if (!canSubmit || !winnerTeam || !loserTeam) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const stats: Record<string, GameStatLine> = {}
      participantIds.forEach((uid) => {
        stats[uid] = getStat(uid)
      })

      const wScore = Number(winnerScore || 0)
      const lScore = Number(loserScore || 0)
      const deficit = comebackDeficit === '' ? 0 : Number(comebackDeficit)
      const scoreDiff = wScore - lScore

      await logGame({
        gameMode,
        maddenVersion,
        winnerIds,
        loserIds,
        loggedBy: uploader,
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
    } catch (error) {
      console.error('Failed to log game', error)
      setSubmitError(error instanceof Error ? error.message : 'We could not save the game right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <div className="mb-4">
        <NetworkHeading size="md">Log a game</NetworkHeading>
        <p className="mt-1 text-xs text-[var(--text-muted)]">You won — fill in how it went.</p>
        <p className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[11px] text-[var(--text-muted)]">
          You can save a photo-based entry after choosing who uploaded it, who the challenger was, and the teams.
        </p>
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

        <PlayerPicker
          players={players}
          value={uploaderId}
          onChange={setUploaderId}
          label="Who is uploading this game?"
          excludeIds={[teammateId, opponent1Id, opponent2Id, challengerId].filter((x): x is string => !!x)}
        />

        <PlayerPicker
          players={players}
          value={challengerId}
          onChange={setChallengerId}
          label="Who was the challenger?"
          excludeIds={[uploaderId, teammateId, opponent2Id].filter((x): x is string => !!x)}
        />

        <div className="grid grid-cols-2 gap-3">
          <TeamPicker label="Uploader's team" value={winnerTeam} onChange={setWinnerTeam} />
          <TeamPicker label="Challenger's team" value={loserTeam} onChange={setLoserTeam} />
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
            <span className="font-medium text-[var(--text)]">Upload or take a photo of the end-of-game stats</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => void handlePhotoChange(e.target.files?.[0] ?? null)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
            />
          </label>
          {photoError && <p className="text-xs font-medium text-red-400">{photoError}</p>}
          {parsingPhoto && <p className="text-xs text-[var(--text-muted)]">{parseMessage}</p>}
          {!parsingPhoto && parseMessage && <p className="text-xs text-[var(--text-muted)]">{parseMessage}</p>}
          {clipPhotoPreviewUrl && (
            <img
              src={clipPhotoPreviewUrl}
              alt="Clip preview"
              className="max-h-40 rounded-xl border border-[var(--border)] object-cover"
            />
          )}

          {hasPhoto && parsedPhotoFields && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Review OCR values</p>
                  <p className="text-[11px] text-[var(--text-muted)]">We filled in what we could from the photo. Check that the scores and stats look right before saving.</p>
                </div>
                <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  review required
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--text)]">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Score</div>
                  <div className="mt-1 font-semibold">{parsedPhotoFields.winnerScore ?? '—'} - {parsedPhotoFields.loserScore ?? '—'}</div>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Comeback</div>
                  <div className="mt-1 font-semibold">{parsedPhotoFields.comebackDeficit ?? '—'}</div>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Passing</div>
                  <div className="mt-1 font-semibold">{parsedPhotoFields.passingYds ?? '—'}</div>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Rushing</div>
                  <div className="mt-1 font-semibold">{parsedPhotoFields.rushingYds ?? '—'}</div>
                </div>
              </div>

              <label className="mt-3 flex items-start gap-2 text-xs text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={photoReviewConfirmed}
                  onChange={(e) => setPhotoReviewConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--border)]"
                />
                <span>I reviewed the photo values and they look correct before saving.</span>
              </label>
            </div>
          )}
        </div>

        {submitError && <p className="text-xs font-medium text-red-400">{submitError}</p>}

        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? 'Saving...' : 'Log game'}
        </Button>
      </div>
    </Card>
  )
}
