import type { GameDoc, Player } from '../types'

export interface WeeklyChallenge {
  id: string
  title: string
  description: string
  emoji: string
  /** Higher is better unless invert is true */
  score: (ctx: { game: GameDoc; uid: string; player: Player }) => number | null
  invert?: boolean
}

function weekSeed(d = new Date()) {
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  return Math.floor(start.getTime() / 86400000)
}

const CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'yard_king',
    title: 'Yard King',
    description: 'Most combined pass + rush yards in a single game this week.',
    emoji: '📊',
    score: ({ game, uid }) => {
      const s = game.stats[uid]
      if (!s) return null
      return s.passingYds + s.rushingYds
    },
  },
  {
    id: 'pick_artist',
    title: 'Pick Artist',
    description: 'Most interceptions forced in one game this week.',
    emoji: '🖐️',
    score: ({ game, uid }) => game.stats[uid]?.interceptions ?? null,
  },
  {
    id: 'close_call',
    title: 'Heart Attack',
    description: 'Win by the smallest margin this week (min 1 pt).',
    emoji: '💓',
    invert: true,
    score: ({ game, uid }) => {
      if (!game.winnerIds.includes(uid)) return null
      return game.scoreDiff > 0 ? game.scoreDiff : null
    },
  },
  {
    id: 'sack_master',
    title: 'Sack Master',
    description: 'Most sacks in a single game this week.',
    emoji: '💥',
    score: ({ game, uid }) => game.stats[uid]?.sacks ?? null,
  },
  {
    id: 'blowout_artist',
    title: 'Body Bag',
    description: 'Biggest win margin this week.',
    emoji: '🧨',
    score: ({ game, uid }) => (game.winnerIds.includes(uid) ? game.scoreDiff : null),
  },
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Largest deficit overcome in a win this week.',
    emoji: '🔥',
    score: ({ game, uid }) =>
      game.winnerIds.includes(uid) && game.comebackDeficit > 0 ? game.comebackDeficit : null,
  },
]

export function getChallengeOfWeek(d = new Date()): WeeklyChallenge {
  return CHALLENGES[weekSeed(d) % CHALLENGES.length]
}

export interface ChallengeStanding {
  uid: string
  name: string
  value: number
  photoURL: string | null
}

export function rankChallenge(
  challenge: WeeklyChallenge,
  games: GameDoc[],
  players: Player[],
  weekStartMs: number,
): ChallengeStanding[] {
  const weekGames = games.filter((g) => g.timestamp >= weekStartMs)
  const best = new Map<string, number>()

  for (const game of weekGames) {
    for (const player of players) {
      const value = challenge.score({ game, uid: player.uid, player })
      if (value == null || value <= 0) continue
      const prev = best.get(player.uid)
      if (prev == null) {
        best.set(player.uid, value)
        continue
      }
      if (challenge.invert ? value < prev : value > prev) best.set(player.uid, value)
    }
  }

  return [...best.entries()]
    .map(([uid, value]) => {
      const p = players.find((x) => x.uid === uid)!
      return { uid, name: p.displayName, value, photoURL: p.photoURL }
    })
    .sort((a, b) => (challenge.invert ? a.value - b.value : b.value - a.value))
}

export function startOfWeekMs(d = new Date()) {
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  return start.getTime()
}
