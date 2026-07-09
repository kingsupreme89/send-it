import type { GameDoc, Player } from '../types'

export interface WeeklyRecap {
  weekStart: number
  gamesPlayed: number
  playerOfTheWeek: { uid: string; name: string; wins: number; losses: number; totalYds: number } | null
  biggestBlowout: { winnerName: string; loserName: string; margin: number; winnerScore: number; loserScore: number } | null
  yardageLeader: { uid: string; name: string; yards: number } | null
}

function startOfWeek(now: Date): number {
  const d = new Date(now)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + diff)
  return d.getTime()
}

function nameFor(players: Player[], uid: string) {
  return players.find((p) => p.uid === uid)?.displayName ?? 'Player'
}

export function getWeeklyRecap(games: GameDoc[], players: Player[], now: Date = new Date()): WeeklyRecap {
  const weekStart = startOfWeek(now)
  const weekGames = games.filter((g) => g.timestamp >= weekStart)

  const record: Record<string, { wins: number; losses: number; yards: number }> = {}
  const bump = (uid: string, field: 'wins' | 'losses', yards: number) => {
    record[uid] ??= { wins: 0, losses: 0, yards: 0 }
    record[uid][field] += 1
    record[uid].yards += yards
  }
  const yardsFor = (g: GameDoc, uid: string) => {
    const s = g.stats[uid]
    return s ? s.passingYds + s.rushingYds : 0
  }

  for (const g of weekGames) {
    for (const uid of g.winnerIds) bump(uid, 'wins', yardsFor(g, uid))
    for (const uid of g.loserIds) bump(uid, 'losses', yardsFor(g, uid))
  }

  let playerOfTheWeek: WeeklyRecap['playerOfTheWeek'] = null
  let bestScore = -Infinity
  for (const [uid, r] of Object.entries(record)) {
    const score = r.wins * 100 + r.yards
    if (score > bestScore) {
      bestScore = score
      playerOfTheWeek = { uid, name: nameFor(players, uid), wins: r.wins, losses: r.losses, totalYds: r.yards }
    }
  }

  let yardageLeader: WeeklyRecap['yardageLeader'] = null
  let bestYards = -1
  for (const [uid, r] of Object.entries(record)) {
    if (r.yards > bestYards) {
      bestYards = r.yards
      yardageLeader = { uid, name: nameFor(players, uid), yards: r.yards }
    }
  }

  let biggestBlowout: WeeklyRecap['biggestBlowout'] = null
  let bestMargin = -1
  for (const g of weekGames) {
    if (g.scoreDiff > bestMargin) {
      bestMargin = g.scoreDiff
      biggestBlowout = {
        winnerName: g.winnerIds.map((id) => nameFor(players, id)).join(' & '),
        loserName: g.loserIds.map((id) => nameFor(players, id)).join(' & '),
        margin: g.scoreDiff,
        winnerScore: g.winnerScore,
        loserScore: g.loserScore,
      }
    }
  }

  return {
    weekStart,
    gamesPlayed: weekGames.length,
    playerOfTheWeek,
    biggestBlowout,
    yardageLeader,
  }
}
