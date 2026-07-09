import type { GameDoc, GameStatLine, Player } from '../types'

export interface Story {
  id: string
  gameId: string
  timestamp: number
  emoji: string
  headline: string
  priority: number
  kind: 'baseline' | 'highlight'
}

function nameFor(players: Player[], uid: string) {
  return players.find((p) => p.uid === uid)?.displayName ?? 'Player'
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join('|')
}

function statHighlights(stat: GameStatLine): string[] {
  const parts: string[] = []
  if (stat.passingYds > 0) parts.push(`${stat.passingYds} passing yds`)
  if (stat.rushingYds > 0) parts.push(`${stat.rushingYds} rushing yds`)
  if (stat.interceptions > 0) parts.push(`${stat.interceptions} INT${stat.interceptions > 1 ? 's' : ''}`)
  if (stat.sacks > 0) parts.push(`${stat.sacks} sack${stat.sacks > 1 ? 's' : ''}`)
  if (stat.interceptionTDs > 0) parts.push(`${stat.interceptionTDs} pick-six${stat.interceptionTDs > 1 ? 'es' : ''}`)
  if (stat.kickReturnTDs > 0) parts.push(`${stat.kickReturnTDs} kick return TD${stat.kickReturnTDs > 1 ? 's' : ''}`)
  if (stat.puntReturnTDs > 0) parts.push(`${stat.puntReturnTDs} punt return TD${stat.puntReturnTDs > 1 ? 's' : ''}`)
  return parts
}

function buildBaselineRecap(g: GameDoc, players: Player[]): Story {
  const winnerName = g.winnerIds.map((id) => nameFor(players, id)).join(' & ')
  const loserName = g.loserIds.map((id) => nameFor(players, id)).join(' & ')
  const margin = g.scoreDiff
  const verb = margin >= 14 ? 'cruises past' : margin <= 3 ? 'edges' : 'beats'

  let standoutUid: string | null = null
  let standoutTotal = -1
  for (const uid of g.winnerIds) {
    const stat = g.stats[uid]
    if (!stat) continue
    const total =
      stat.passingYds +
      stat.rushingYds +
      stat.interceptions * 10 +
      stat.sacks * 8 +
      (stat.interceptionTDs + stat.kickReturnTDs + stat.puntReturnTDs) * 25
    if (total > standoutTotal) {
      standoutTotal = total
      standoutUid = uid
    }
  }

  let headline = `${winnerName} ${verb} ${loserName} ${g.winnerScore}-${g.loserScore}`
  if (standoutUid) {
    const parts = statHighlights(g.stats[standoutUid])
    if (parts.length > 0) {
      headline += ` — ${nameFor(players, standoutUid)} put up ${parts.join(', ')}`
    }
  }

  return {
    id: `${g.id}:recap`,
    gameId: g.id,
    timestamp: g.timestamp,
    emoji: '📰',
    headline,
    priority: 20,
    kind: 'baseline',
  }
}

const isStreakMilestone = (n: number) => n === 3 || n === 5 || (n >= 10 && n % 5 === 0)

function losingStreakHeadline(name: string, n: number) {
  if (n >= 10) return `${name} hasn't won in ${n} straight. Time to abdicate, "Your Majesty."`
  if (n >= 5) return `${name} is in a ${n}-game freefall. The throne is empty.`
  return `Some king — ${name} has dropped ${n} straight`
}

export function generateStories(games: GameDoc[], players: Player[]): Story[] {
  const chronological = [...games].sort((a, b) => a.timestamp - b.timestamp)

  const winStreaks: Record<string, number> = {}
  const lossStreaks: Record<string, number> = {}
  const headToHeadWins: Record<string, Record<string, number>> = {}
  const opponentStreaks: Record<string, number> = {}
  const stories: Story[] = []

  for (const g of chronological) {
    const winnerName = g.winnerIds.map((id) => nameFor(players, id)).join(' & ')
    const loserName = g.loserIds.map((id) => nameFor(players, id)).join(' & ')

    if (g.isBlowout) {
      stories.push({
        id: `${g.id}:blowout`,
        gameId: g.id,
        timestamp: g.timestamp,
        emoji: '💥',
        headline: `${winnerName} STEAMROLLS ${loserName} ${g.winnerScore}-${g.loserScore}`,
        priority: 70,
        kind: 'highlight',
      })
    }
    if (g.isComeback) {
      stories.push({
        id: `${g.id}:comeback`,
        gameId: g.id,
        timestamp: g.timestamp,
        emoji: '🔥',
        headline: `${winnerName} claws back from a ${g.comebackDeficit}-point hole to stun ${loserName}`,
        priority: 75,
        kind: 'highlight',
      })
    }

    for (const uid of [...g.winnerIds, ...g.loserIds]) {
      const stat = g.stats[uid]
      if (!stat) continue
      const name = nameFor(players, uid)

      if (stat.passingYds >= 300) {
        stories.push({
          id: `${g.id}:pass:${uid}`,
          gameId: g.id,
          timestamp: g.timestamp,
          emoji: '🎯',
          headline: `${name} torched the defense for ${stat.passingYds} yards passing`,
          priority: 50,
          kind: 'highlight',
        })
      }
      if (stat.rushingYds >= 150) {
        stories.push({
          id: `${g.id}:rush:${uid}`,
          gameId: g.id,
          timestamp: g.timestamp,
          emoji: '🏃',
          headline: `${name} ran wild for ${stat.rushingYds} yards on the ground`,
          priority: 50,
          kind: 'highlight',
        })
      }
      if (stat.interceptions >= 2) {
        stories.push({
          id: `${g.id}:int:${uid}`,
          gameId: g.id,
          timestamp: g.timestamp,
          emoji: '🛡️',
          headline: `${name} picked off ${stat.interceptions} passes`,
          priority: 50,
          kind: 'highlight',
        })
      }
      if (stat.sacks >= 3) {
        stories.push({
          id: `${g.id}:sacks:${uid}`,
          gameId: g.id,
          timestamp: g.timestamp,
          emoji: '💢',
          headline: `${name} brought the heat with ${stat.sacks} sacks`,
          priority: 50,
          kind: 'highlight',
        })
      }
      const bigPlayTDs = stat.interceptionTDs + stat.kickReturnTDs + stat.puntReturnTDs
      if (bigPlayTDs >= 1) {
        const kinds: string[] = []
        if (stat.interceptionTDs > 0) kinds.push(`${stat.interceptionTDs} pick-six${stat.interceptionTDs > 1 ? 'es' : ''}`)
        if (stat.kickReturnTDs > 0) kinds.push(`${stat.kickReturnTDs} kick return TD${stat.kickReturnTDs > 1 ? 's' : ''}`)
        if (stat.puntReturnTDs > 0) kinds.push(`${stat.puntReturnTDs} punt return TD${stat.puntReturnTDs > 1 ? 's' : ''}`)
        stories.push({
          id: `${g.id}:bigplay:${uid}`,
          gameId: g.id,
          timestamp: g.timestamp,
          emoji: '⚡',
          headline: `${name} took it to the house — ${kinds.join(', ')}`,
          priority: 65,
          kind: 'highlight',
        })
      }
    }

    for (const uid of g.winnerIds) {
      const key = `${uid}:${g.gameMode}`
      winStreaks[key] = (winStreaks[key] ?? 0) + 1
      const streak = winStreaks[key]
      if (isStreakMilestone(streak)) {
        stories.push({
          id: `${g.id}:streak:${uid}`,
          gameId: g.id,
          timestamp: g.timestamp,
          emoji: streak >= 10 ? '👑' : '🔥',
          headline: `${nameFor(players, uid)} has won ${streak} straight`,
          priority: streak >= 10 ? 90 : 80,
          kind: 'highlight',
        })
      }
    }
    for (const uid of g.loserIds) {
      winStreaks[`${uid}:${g.gameMode}`] = 0
      const key = `${uid}:${g.gameMode}`
      lossStreaks[key] = (lossStreaks[key] ?? 0) + 1
      const streak = lossStreaks[key]
      if (isStreakMilestone(streak)) {
        stories.push({
          id: `${g.id}:lossstreak:${uid}`,
          gameId: g.id,
          timestamp: g.timestamp,
          emoji: streak >= 10 ? '🥶' : '📉',
          headline: losingStreakHeadline(nameFor(players, uid), streak),
          priority: streak >= 10 ? 85 : 65,
          kind: 'highlight',
        })
      }
    }
    for (const uid of g.winnerIds) {
      lossStreaks[`${uid}:${g.gameMode}`] = 0
    }

    if (g.winnerIds.length === 1 && g.loserIds.length === 1) {
      const winnerUid = g.winnerIds[0]
      const loserUid = g.loserIds[0]
      const key = pairKey(winnerUid, loserUid)
      headToHeadWins[key] ??= {}
      headToHeadWins[key][winnerUid] = (headToHeadWins[key][winnerUid] ?? 0) + 1
      const wWins = headToHeadWins[key][winnerUid] ?? 0
      const lWins = headToHeadWins[key][loserUid] ?? 0

      if (wWins === lWins && wWins + lWins >= 4) {
        stories.push({
          id: `${g.id}:series-tied`,
          gameId: g.id,
          timestamp: g.timestamp,
          emoji: '⚖️',
          headline: `${winnerName} ties the season series with ${loserName} at ${wWins}-${lWins}`,
          priority: 60,
          kind: 'highlight',
        })
      }

      const oppKey = `${winnerUid}:${loserUid}:${g.gameMode}`
      opponentStreaks[oppKey] = (opponentStreaks[oppKey] ?? 0) + 1
      opponentStreaks[`${loserUid}:${winnerUid}:${g.gameMode}`] = 0
      const oppStreak = opponentStreaks[oppKey]
      if (oppStreak === 3 || oppStreak === 5) {
        stories.push({
          id: `${g.id}:rivalry-streak`,
          gameId: g.id,
          timestamp: g.timestamp,
          emoji: '😤',
          headline: `${winnerName} has beaten ${loserName} ${oppStreak} straight times`,
          priority: 55,
          kind: 'highlight',
        })
      }
    }

    stories.push(buildBaselineRecap(g, players))
  }

  return stories.sort((a, b) => b.timestamp - a.timestamp || b.priority - a.priority)
}

export function topStory(stories: Story[]): Story | null {
  return stories[0] ?? null
}
