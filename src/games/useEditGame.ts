import { doc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'
import { uploadClipPhoto } from './clipUpload'
import type { GameDoc, GameStatLine, Player } from '../types'
import type { TeamId } from '../constants/nflTeams'

export interface EditGameInput {
  winnerTeam: TeamId
  loserTeam: TeamId
  winnerScore: number
  loserScore: number
  comebackDeficit: number
  stats: Record<string, GameStatLine>
  clipUrl?: string
  clipPhoto?: File | null
}

const empty = (): GameStatLine => ({
  passingYds: 0,
  rushingYds: 0,
  interceptions: 0,
  sacks: 0,
  interceptionTDs: 0,
  kickReturnTDs: 0,
  puntReturnTDs: 0,
})

export async function editGame(gameId: string, input: EditGameInput, oldGame: GameDoc) {
  const gameRef = doc(db, 'games', gameId)
  const photoUrl = input.clipPhoto ? await uploadClipPhoto(gameId, input.clipPhoto) : undefined

  await runTransaction(db, async (tx) => {
    const allIds = [...oldGame.winnerIds, ...oldGame.loserIds]
    const playerRefs = allIds.map((uid) => doc(db, 'players', uid))
    const playerSnaps = await Promise.all(playerRefs.map((r) => tx.get(r)))

    const scoreDiff = input.winnerScore - input.loserScore
    const isBlowout = scoreDiff > 21
    const isComeback = input.comebackDeficit >= 17

    playerSnaps.forEach((snap, i) => {
      const uid = allIds[i]
      const player = snap.data() as Player
      const mode = oldGame.gameMode
      const m = player.statsByMode[mode]
      const old = oldGame.stats[uid] ?? empty()
      const next = input.stats[uid] ?? empty()

      tx.update(playerRefs[i], {
        [`statsByMode.${mode}.passingYds`]: (m.passingYds ?? 0) - old.passingYds + next.passingYds,
        [`statsByMode.${mode}.rushingYds`]: (m.rushingYds ?? 0) - old.rushingYds + next.rushingYds,
        [`statsByMode.${mode}.interceptions`]: (m.interceptions ?? 0) - old.interceptions + next.interceptions,
        [`statsByMode.${mode}.sacks`]: (m.sacks ?? 0) - old.sacks + next.sacks,
        [`statsByMode.${mode}.interceptionTDs`]: (m.interceptionTDs ?? 0) - old.interceptionTDs + next.interceptionTDs,
        [`statsByMode.${mode}.kickReturnTDs`]: (m.kickReturnTDs ?? 0) - old.kickReturnTDs + next.kickReturnTDs,
        [`statsByMode.${mode}.puntReturnTDs`]: (m.puntReturnTDs ?? 0) - old.puntReturnTDs + next.puntReturnTDs,
      })
    })

    tx.update(gameRef, {
      winnerScore: input.winnerScore,
      loserScore: input.loserScore,
      scoreDiff,
      comebackDeficit: input.comebackDeficit,
      isBlowout,
      isComeback,
      winnerTeam: input.winnerTeam,
      loserTeam: input.loserTeam,
      stats: input.stats,
      ...(input.clipUrl !== undefined ? { clipUrl: input.clipUrl } : {}),
      ...(photoUrl ? { photoUrl } : {}),
    })
  })
}

export async function deleteGame(gameId: string, game: GameDoc) {
  const gameRef = doc(db, 'games', gameId)

  await runTransaction(db, async (tx) => {
    const allIds = [...game.winnerIds, ...game.loserIds]
    const playerRefs = allIds.map((uid) => doc(db, 'players', uid))
    const playerSnaps = await Promise.all(playerRefs.map((r) => tx.get(r)))

    playerSnaps.forEach((snap, i) => {
      const uid = allIds[i]
      const player = snap.data() as Player
      const mode = game.gameMode
      const m = player.statsByMode[mode]
      const stat = game.stats[uid] ?? empty()
      const isWinner = game.winnerIds.includes(uid)

      tx.update(playerRefs[i], {
        [`statsByMode.${mode}.wins`]: m.wins - (isWinner ? 1 : 0),
        [`statsByMode.${mode}.losses`]: m.losses - (isWinner ? 0 : 1),
        [`statsByMode.${mode}.passingYds`]: (m.passingYds ?? 0) - stat.passingYds,
        [`statsByMode.${mode}.rushingYds`]: (m.rushingYds ?? 0) - stat.rushingYds,
        [`statsByMode.${mode}.interceptions`]: (m.interceptions ?? 0) - stat.interceptions,
        [`statsByMode.${mode}.sacks`]: (m.sacks ?? 0) - stat.sacks,
        [`statsByMode.${mode}.interceptionTDs`]: (m.interceptionTDs ?? 0) - stat.interceptionTDs,
        [`statsByMode.${mode}.kickReturnTDs`]: (m.kickReturnTDs ?? 0) - stat.kickReturnTDs,
        [`statsByMode.${mode}.puntReturnTDs`]: (m.puntReturnTDs ?? 0) - stat.puntReturnTDs,
      })
    })

    tx.delete(gameRef)
  })
}
