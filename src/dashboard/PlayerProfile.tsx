import { useEffect, useMemo, useState } from 'react'
import { useGames } from '../games/useGames'
import { usePlayers } from '../players/usePlayers'
import { updateProfile } from '../profile/useProfile'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { Button } from '../components/Button'
import { ModeTabs } from '../components/ModeTabs'
import { TeamPicker } from '../components/TeamPicker'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { PencilIcon } from '../components/icons'
import { BadgeCase } from '../achievements/BadgeCase'
import { EditGameForm } from '../games/EditGameForm'
import { notificationPermission, notificationsSupported, requestNotificationPermission } from '../utils/notifications'
import { RankExplainer } from '../components/RankExplainer'
import { computeApRankings } from '../stats/apRanking'
import { GAME_MODES } from '../types'
import type { GameDoc, GameMode, Player } from '../types'
import type { TeamId } from '../constants/nflTeams'

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

function NotificationToggle() {
  const [permission, setPermission] = useState(notificationPermission())

  if (!notificationsSupported()) return null

  const handleEnable = async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-[var(--surface)] p-3">
      <div>
        <p className="text-sm font-medium text-[var(--text)]">Achievement notifications</p>
        <p className="text-xs text-[var(--text-muted)]">
          {permission === 'granted'
            ? "You'll get notified the moment you earn a badge."
            : permission === 'denied'
              ? 'Blocked — re-enable in your browser/phone notification settings.'
              : 'Get notified the instant you earn a badge (while the app is open).'}
        </p>
      </div>
      {permission === 'default' && (
        <button
          onClick={handleEnable}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{
            background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
            color: 'var(--accent)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          }}
        >
          Enable
        </button>
      )}
    </div>
  )
}

function ProfileEditor({ me }: { me: Player }) {
  const [displayName, setDisplayName] = useState(me.displayName)
  const [hometown, setHometown] = useState(me.hometown ?? '')
  const [favoriteTeam, setFavoriteTeam] = useState<TeamId | null>(me.favoriteTeam)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setDisplayName(me.displayName)
    setHometown(me.hometown ?? '')
    setFavoriteTeam(me.favoriteTeam)
  }, [me.displayName, me.hometown, me.favoriteTeam])

  const dirty =
    displayName.trim() !== me.displayName || hometown.trim() !== (me.hometown ?? '') || favoriteTeam !== me.favoriteTeam

  const handleSave = async () => {
    if (!displayName.trim() || !favoriteTeam) return
    setSaving(true)
    await updateProfile(me.uid, { displayName: displayName.trim(), hometown: hometown.trim(), favoriteTeam })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card>
      <div className="mb-3">
        <NetworkHeading size="md">Profile</NetworkHeading>
      </div>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--text)]">Username</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--text)]">Where you're from</span>
          <input
            value={hometown}
            onChange={(e) => setHometown(e.target.value)}
            placeholder="e.g. Denver, CO"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
          />
        </label>

        <TeamPicker label="Favorite team" value={favoriteTeam} onChange={setFavoriteTeam} id="me-favorite-team" />

        <Button onClick={handleSave} disabled={!dirty || saving} className="self-start">
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
        </Button>

        <NotificationToggle />
      </div>
    </Card>
  )
}

export function PlayerProfile({
  uid,
  currentUid,
  onBack,
}: {
  uid: string
  currentUid: string
  onBack?: () => void
}) {
  const { games } = useGames(300)
  const { players } = usePlayers()
  const [mode, setMode] = useState<GameMode>('1v1_regular')
  const [editingGame, setEditingGame] = useState<GameDoc | null>(null)

  const player = players.find((p) => p.uid === uid)
  const nameFor = (id: string) => players.find((p) => p.uid === id)?.displayName ?? 'Player'
  const isMe = uid === currentUid
  const canEdit = (g: GameDoc) =>
    g.winnerIds.includes(currentUid) || g.loserIds.includes(currentUid) || g.loggedBy === currentUid

  const myGames = useMemo(
    () =>
      games
        .filter((g) => g.gameMode === mode && (g.winnerIds.includes(uid) || g.loserIds.includes(uid)))
        .sort((a, b) => b.timestamp - a.timestamp),
    [games, mode, uid],
  )

  const modeLabel = GAME_MODES.find((m) => m.id === mode)?.label ?? mode

  const { rank, totalRanked } = useMemo(() => {
    const rankings = computeApRankings(games, mode, players.map((p) => p.uid))
    const mine = rankings.find((r) => r.uid === uid)
    return { rank: mine?.rank ?? null, totalRanked: rankings.length }
  }, [games, players, mode, uid])

  const sevenDayTotals = useMemo(() => {
    const cutoff = Date.now() - SEVEN_DAYS
    let wins = 0, losses = 0, passingYds = 0, rushingYds = 0, interceptions = 0, sacks = 0
    let interceptionTDs = 0, kickReturnTDs = 0, puntReturnTDs = 0, count = 0
    for (const g of games) {
      if (g.timestamp < cutoff) continue
      if (!g.winnerIds.includes(uid) && !g.loserIds.includes(uid)) continue
      count++
      if (g.winnerIds.includes(uid)) wins++; else losses++
      const s = g.stats[uid]
      if (s) {
        passingYds += s.passingYds
        rushingYds += s.rushingYds
        interceptions += s.interceptions
        sacks += s.sacks
        interceptionTDs += s.interceptionTDs
        kickReturnTDs += s.kickReturnTDs
        puntReturnTDs += s.puntReturnTDs
      }
    }
    return { wins, losses, passingYds, rushingYds, interceptions, sacks, interceptionTDs, kickReturnTDs, puntReturnTDs, count }
  }, [games, uid])

  if (!player) return null

  const stats = player.statsByMode[mode]

  return (
    <div className="flex flex-col gap-4">
      {onBack && (
        <button
          onClick={onBack}
          className="self-start rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
          style={{
            background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
            color: 'var(--accent)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          }}
        >
          ← Back
        </button>
      )}

      <Card>
        <div className="flex items-center gap-3">
          <PlayerAvatar photoURL={player.photoURL} displayName={player.displayName} size={48} />
          <div>
            <p className="text-base font-bold text-[var(--text)]">{player.displayName}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {player.hometown ? player.hometown : player.googleEmail}
            </p>
          </div>
          <div className="ml-auto text-right">
            {rank !== null && (
              <p className="text-lg font-extrabold" style={{ color: 'var(--accent)' }}>
                #{rank} <span className="text-xs font-medium text-[var(--text-muted)]">of {totalRanked}</span>
              </p>
            )}
            <RankExplainer modeLabel={modeLabel} />
          </div>
        </div>

        <div className="mt-4">
          <ModeTabs value={mode} onChange={setMode} />
          <p className="mb-1 mt-3 text-xs font-medium text-[var(--text-muted)]">All-time</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              ['W-L', `${stats.wins}-${stats.losses}`],
              ['Pass', stats.passingYds],
              ['Rush', stats.rushingYds],
              ['INT', stats.interceptions],
              ['Sacks', stats.sacks],
              ['INT TD', stats.interceptionTDs],
              ['KR TD', stats.kickReturnTDs],
              ['PR TD', stats.puntReturnTDs],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg bg-[var(--surface)] p-2">
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
                <p className="text-sm font-semibold text-[var(--text)]">{value}</p>
              </div>
            ))}
          </div>

          <p className="mb-1 mt-3 text-xs font-medium text-[var(--text-muted)]">
            Last 7 days — {sevenDayTotals.count} game{sevenDayTotals.count === 1 ? '' : 's'} (all modes)
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              ['W-L', `${sevenDayTotals.wins}-${sevenDayTotals.losses}`],
              ['Pass', sevenDayTotals.passingYds],
              ['Rush', sevenDayTotals.rushingYds],
              ['INT', sevenDayTotals.interceptions],
              ['Sacks', sevenDayTotals.sacks],
              ['INT TD', sevenDayTotals.interceptionTDs],
              ['KR TD', sevenDayTotals.kickReturnTDs],
              ['PR TD', sevenDayTotals.puntReturnTDs],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg bg-[var(--surface)] p-2">
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
                <p className="text-sm font-semibold text-[var(--text)]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {isMe && <ProfileEditor me={player} />}

      <Card>
        <div className="mb-3">
          <NetworkHeading size="md">Badges</NetworkHeading>
        </div>
        <BadgeCase badgeIds={player.badges} />
      </Card>

      <Card>
        <div className="mb-3">
          <NetworkHeading size="md">{`Game log — ${GAME_MODES.find((m) => m.id === mode)?.label}`}</NetworkHeading>
        </div>
        {myGames.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No games logged in this mode yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {myGames.map((g) => {
              const won = g.winnerIds.includes(uid)
              const opponents = (won ? g.loserIds : g.winnerIds).map(nameFor).join(' & ')
              return (
                <li key={g.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-2 text-sm">
                  <span className={won ? 'font-medium text-green-600' : 'font-medium text-red-500'}>
                    {won ? 'W' : 'L'} vs {opponents}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">
                      {won ? `${g.winnerScore}-${g.loserScore}` : `${g.loserScore}-${g.winnerScore}`}
                    </span>
                    {canEdit(g) && (
                      <button
                        onClick={() => setEditingGame(g)}
                        aria-label="Edit game"
                        className="rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
                      >
                        <PencilIcon size={14} />
                      </button>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {editingGame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => setEditingGame(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full">
            <EditGameForm
              game={editingGame}
              players={players}
              onSaved={() => setEditingGame(null)}
              onCancel={() => setEditingGame(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
