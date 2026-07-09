import type { GameDoc, Player } from '../types'

export interface RivalryPair {
  a: Player
  b: Player
  aWins: number
  bWins: number
  lastMargin: number | null
  games: number
}

/** Rank 1v1 rivalries by games played (all modes, 1v1 only). */
export function getTopRivalries(games: GameDoc[], players: Player[], limit = 3): RivalryPair[] {
  const map = new Map<string, { a: string; b: string; aWins: number; bWins: number; last?: GameDoc }>()

  for (const g of games) {
    if (g.winnerIds.length !== 1 || g.loserIds.length !== 1) continue
    const w = g.winnerIds[0]
    const l = g.loserIds[0]
    const key = [w, l].sort().join('|')
    const cur = map.get(key) ?? { a: key.split('|')[0], b: key.split('|')[1], aWins: 0, bWins: 0 }
    if (w === cur.a) cur.aWins++
    else cur.bWins++
    if (!cur.last || g.timestamp > cur.last.timestamp) cur.last = g
    map.set(key, cur)
  }

  const pairs: RivalryPair[] = []
  for (const cur of map.values()) {
    const a = players.find((p) => p.uid === cur.a)
    const b = players.find((p) => p.uid === cur.b)
    if (!a || !b) continue
    pairs.push({
      a,
      b,
      aWins: cur.aWins,
      bWins: cur.bWins,
      lastMargin: cur.last?.scoreDiff ?? null,
      games: cur.aWins + cur.bWins,
    })
  }

  return pairs.sort((x, y) => y.games - x.games || Math.abs(y.aWins - y.bWins) - Math.abs(x.aWins - x.bWins)).slice(0, limit)
}
