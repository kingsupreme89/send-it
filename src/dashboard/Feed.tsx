import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useGames } from '../games/useGames'
import { usePlayers } from '../players/usePlayers'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { ReactionBar } from '../components/ReactionBar'
import { TrashTalk } from '../components/TrashTalk'
import { PencilIcon } from '../components/icons'
import { EditGameForm } from '../games/EditGameForm'
import { StaggerItem, StaggerList } from '../components/PageTransition'
import { GAME_MODES } from '../types'
import type { GameDoc } from '../types'
import { NFL_TEAMS_BY_ID } from '../constants/nflTeams'
import { generateStories, topStory } from '../stories/storyGenerator'

const DISPLAY_LIMIT = 20

export function Feed({ currentUid }: { currentUid: string }) {
  const { games } = useGames(300)
  const { players } = usePlayers()
  const [editingGame, setEditingGame] = useState<GameDoc | null>(null)

  const nameFor = (uid: string) => players.find((p) => p.uid === uid)?.displayName ?? 'Player'
  const modeLabel = (modeId: string) => GAME_MODES.find((m) => m.id === modeId)?.label ?? modeId
  const canEdit = (g: GameDoc) =>
    g.winnerIds.includes(currentUid) || g.loserIds.includes(currentUid) || g.loggedBy === currentUid

  const stories = useMemo(() => generateStories(games, players), [games, players])
  const headline = topStory(stories)
  const storiesByGame = useMemo(() => {
    const map = new Map<string, typeof stories>()
    for (const s of stories) {
      const existing = map.get(s.gameId) ?? []
      existing.push(s)
      map.set(s.gameId, existing)
    }
    return map
  }, [stories])

  const visibleGames = games.slice(0, DISPLAY_LIMIT)

  return (
    <>
      <div className="flex flex-col gap-4">
        {headline && (
          <Card
            className="border-0 shine-border"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            }}
            hover={false}
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Top Story</p>
            <p className="text-lg font-bold leading-snug text-white">
              {headline.emoji} {headline.headline}
            </p>
          </Card>
        )}

        <Card hover={false}>
          <div className="mb-3">
            <NetworkHeading>The Feed</NetworkHeading>
          </div>
          {visibleGames.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No games logged yet.</p>
          ) : (
            <StaggerList className="flex flex-col gap-2.5">
              {visibleGames.map((g) => {
                const gameStories = storiesByGame.get(g.id) ?? []
                return (
                  <StaggerItem key={g.id}>
                    <motion.div
                      layout
                      className="glass rounded-2xl p-3.5 transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-semibold leading-snug text-[var(--text)]">
                          {g.winnerIds.map(nameFor).join(' & ')}{' '}
                          <span className="font-medium text-[var(--text-muted)]">def.</span>{' '}
                          {g.loserIds.map(nameFor).join(' & ')}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-base font-bold tracking-tight text-[var(--text)]">
                            {g.winnerScore}-{g.loserScore}
                          </span>
                          {canEdit(g) && (
                            <button
                              onClick={() => setEditingGame(g)}
                              aria-label="Edit game"
                              className="rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-white/10 hover:text-[var(--text)]"
                            >
                              <PencilIcon size={14} />
                            </button>
                          )}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                        <span>{modeLabel(g.gameMode)}</span>
                        <span>·</span>
                        <span>
                          {NFL_TEAMS_BY_ID[g.winnerTeam]?.abbreviation} vs{' '}
                          {NFL_TEAMS_BY_ID[g.loserTeam]?.abbreviation}
                        </span>
                        {g.isBlowout && (
                          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 font-semibold text-rose-300">
                            💥 Blowout
                          </span>
                        )}
                        {g.isComeback && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-300">
                            🔥 Comeback
                          </span>
                        )}
                      </div>
                      {gameStories.length > 0 && (
                        <ul className="mt-2 flex flex-col gap-1 border-t border-[var(--border)] pt-2">
                          {gameStories.slice(0, 3).map((s) => (
                            <li
                              key={s.id}
                              className="text-xs font-medium"
                              style={{ color: s.kind === 'highlight' ? 'var(--text)' : 'var(--text-muted)' }}
                            >
                              {s.emoji} {s.headline}
                            </li>
                          ))}
                        </ul>
                      )}
                      {g.photoUrl && (
                        <img
                          src={g.photoUrl}
                          alt="Game clip"
                          className="mt-2 max-h-56 w-full rounded-xl border border-[var(--border)] object-cover"
                        />
                      )}
                      {g.clipUrl && (
                        <a
                          href={g.clipUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold"
                          style={{ color: 'var(--accent)' }}
                        >
                          🎬 Watch clip →
                        </a>
                      )}
                      <ReactionBar gameId={g.id} currentUid={currentUid} reactions={g.reactions ?? {}} />
                      <TrashTalk
                        gameId={g.id}
                        currentUid={currentUid}
                        comments={g.comments}
                        nameFor={nameFor}
                      />
                    </motion.div>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          )}
        </Card>
      </div>

      {editingGame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-md"
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
    </>
  )
}
