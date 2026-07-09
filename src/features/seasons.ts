import type { GameDoc } from '../types'

export interface Season {
  id: string
  label: string
  startMs: number
  endMs: number
}

/** Rolling seasons by calendar quarter — no schema change required. */
export function getSeasons(now = new Date()): Season[] {
  const year = now.getFullYear()
  const seasons: Season[] = []
  for (let y = year; y >= year - 1; y--) {
    for (let q = 4; q >= 1; q--) {
      const start = new Date(y, (q - 1) * 3, 1).getTime()
      const end = new Date(y, q * 3, 1).getTime()
      if (start > now.getTime()) continue
      seasons.push({
        id: `${y}-Q${q}`,
        label: `${y} · Q${q}`,
        startMs: start,
        endMs: end,
      })
    }
  }
  return seasons
}

export function currentSeasonId(now = new Date()) {
  return getSeasons(now)[0]?.id ?? 'all'
}

export function filterGamesBySeason(games: GameDoc[], seasonId: string | 'all', seasons: Season[]) {
  if (seasonId === 'all') return games
  const s = seasons.find((x) => x.id === seasonId)
  if (!s) return games
  return games.filter((g) => g.timestamp >= s.startMs && g.timestamp < s.endMs)
}
