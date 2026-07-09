import type { GameDoc, GameMode } from '../types'

export interface RankingInputs {
  uid: string
  winPct: number
  passYdsPerGame: number
  rushYdsPerGame: number
  interceptionsPerGame: number
  sacksPerGame: number
  bigPlayTDsPerGame: number
  pointsPerGame: number
  gamesPlayed: number
}

export interface RankedPlayer extends RankingInputs {
  score: number
  rank: number
}

function buildRankingInputs(games: GameDoc[], mode: GameMode, playerUids: string[]): RankingInputs[] {
  const modeGames = games.filter((g) => g.gameMode === mode)

  return playerUids.map((uid) => {
    const relevant = modeGames.filter((g) => g.winnerIds.includes(uid) || g.loserIds.includes(uid))
    const gamesPlayed = relevant.length
    if (gamesPlayed === 0) {
      return {
        uid,
        winPct: 0,
        passYdsPerGame: 0,
        rushYdsPerGame: 0,
        interceptionsPerGame: 0,
        sacksPerGame: 0,
        bigPlayTDsPerGame: 0,
        pointsPerGame: 0,
        gamesPlayed: 0,
      }
    }

    let wins = 0
    let passYds = 0
    let rushYds = 0
    let interceptions = 0
    let sacks = 0
    let bigPlayTDs = 0
    let points = 0

    for (const g of relevant) {
      const isWinner = g.winnerIds.includes(uid)
      if (isWinner) wins++
      points += isWinner ? g.winnerScore : g.loserScore

      const s = g.stats[uid]
      if (s) {
        passYds += s.passingYds
        rushYds += s.rushingYds
        interceptions += s.interceptions
        sacks += s.sacks
        bigPlayTDs += s.interceptionTDs + s.kickReturnTDs + s.puntReturnTDs
      }
    }

    return {
      uid,
      winPct: wins / gamesPlayed,
      passYdsPerGame: passYds / gamesPlayed,
      rushYdsPerGame: rushYds / gamesPlayed,
      interceptionsPerGame: interceptions / gamesPlayed,
      sacksPerGame: sacks / gamesPlayed,
      bigPlayTDsPerGame: bigPlayTDs / gamesPlayed,
      pointsPerGame: points / gamesPlayed,
      gamesPlayed,
    }
  })
}

function normalize(values: number[]): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) return values.map(() => 1)
  return values.map((v) => (v - min) / (max - min))
}

// AP-poll style composite: win%, per-game pass/rush yards, interceptions, sacks,
// "big play" TDs (pick-sixes + kick/punt return TDs), and points per game are each
// normalized against the field and averaged with equal weight, then sorted into a
// straight #1..#N ranking.
export function computeApRankings(games: GameDoc[], mode: GameMode, playerUids: string[]): RankedPlayer[] {
  const inputs = buildRankingInputs(games, mode, playerUids).filter((p) => p.gamesPlayed > 0)
  if (inputs.length === 0) return []

  const winPctN = normalize(inputs.map((p) => p.winPct))
  const passN = normalize(inputs.map((p) => p.passYdsPerGame))
  const rushN = normalize(inputs.map((p) => p.rushYdsPerGame))
  const intN = normalize(inputs.map((p) => p.interceptionsPerGame))
  const sacksN = normalize(inputs.map((p) => p.sacksPerGame))
  const bigPlayN = normalize(inputs.map((p) => p.bigPlayTDsPerGame))
  const pointsN = normalize(inputs.map((p) => p.pointsPerGame))

  const scored = inputs.map((p, i) => ({
    ...p,
    score: (winPctN[i] + passN[i] + rushN[i] + intN[i] + sacksN[i] + bigPlayN[i] + pointsN[i]) / 7,
  }))

  scored.sort((a, b) => b.score - a.score)

  return scored.map((p, i) => ({ ...p, rank: i + 1 }))
}
