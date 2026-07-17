import { collection, doc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'
import { evaluateNewBadges } from '../achievements/badgeRules'
import { getIsoWeekKey } from '../achievements/packRewards'
import { uploadClipPhoto } from './clipUpload'
import { notifyAchievement } from '../utils/notifications'
import type { GameMode, GameStatLine, MaddenVersion, Player } from '../types'
import type { TeamId } from '../constants/nflTeams'

export interface LogGameInput {
  gameMode: GameMode
  maddenVersion: MaddenVersion
  winnerIds: string[]
  loserIds: string[]
  loggedBy: string
  winnerTeam: TeamId
  loserTeam: TeamId
  winnerScore: number
  loserScore: number
  comebackDeficit: number
  stats: Record<string, GameStatLine>
  clipUrl?: string
  clipPhoto?: File | null
}

export async function logGame(input: LogGameInput) {
  const gameRef = doc(collection(db, 'games'))
  const scoreDiff = input.winnerScore - input.loserScore
  const isBlowout = scoreDiff > 21
  const isComeback = input.comebackDeficit >= 17

  const allParticipantIds = [...input.winnerIds, ...input.loserIds]
  const photoUrl = input.clipPhoto ? await uploadClipPhoto(gameRef.id, input.clipPhoto) : undefined

  const earnedByLogger: string[] = []

  await runTransaction(db, async (tx) => {
    const playerRefs = allParticipantIds.map((uid) => doc(db, 'players', uid))
    const playerSnaps = await Promise.all(playerRefs.map((ref) => tx.get(ref)))

    playerSnaps.forEach((snap, i) => {
      const uid = allParticipantIds[i]
      if (!snap.exists()) throw new Error(`Player ${uid} not found`)
      const player = snap.data() as Player

      const isWinner = input.winnerIds.includes(uid)
      const teamUsed = isWinner ? input.winnerTeam : input.loserTeam
      const statLine = input.stats[uid]

      const modeStats = player.statsByMode[input.gameMode]
      const newStreak = isWinner ? modeStats.currentStreak + 1 : 0
      const newBestStreak = Math.max(modeStats.bestStreak, newStreak)

      const updatedModeStats = {
        wins: modeStats.wins + (isWinner ? 1 : 0),
        losses: modeStats.losses + (isWinner ? 0 : 1),
        passingYds: (modeStats.passingYds ?? 0) + statLine.passingYds,
        rushingYds: (modeStats.rushingYds ?? 0) + statLine.rushingYds,
        interceptions: (modeStats.interceptions ?? 0) + statLine.interceptions,
        sacks: (modeStats.sacks ?? 0) + statLine.sacks,
        interceptionTDs: (modeStats.interceptionTDs ?? 0) + statLine.interceptionTDs,
        kickReturnTDs: (modeStats.kickReturnTDs ?? 0) + statLine.kickReturnTDs,
        puntReturnTDs: (modeStats.puntReturnTDs ?? 0) + statLine.puntReturnTDs,
        currentStreak: newStreak,
        bestStreak: newBestStreak,
      }

      const newTeamUsageCount = (player.teamUsage[teamUsed] ?? 0) + 1
      const updatedTeamUsage = { ...player.teamUsage, [teamUsed]: newTeamUsageCount }

      const newBadgeIds = evaluateNewBadges({
        existingBadges: player.badges,
        statLine,
        isWinner,
        isBlowout,
        isComeback,
        updatedStreak: newStreak,
        teamUsageCountForGameTeam: newTeamUsageCount,
      })

      if (uid === input.loggedBy) earnedByLogger.push(...newBadgeIds)

      // Weekly pack availability is a personal-progression field, granted only to the
      // logging user's own doc — never included in other participants' updates, since
      // firestore.rules only allows non-owner writes to touch statsByMode/teamUsage/badges.
      const isLogger = uid === input.loggedBy
      const currentWeek = getIsoWeekKey()
      const packUpdate =
        isLogger && player.packAvailableWeek !== currentWeek ? { packAvailableWeek: currentWeek } : {}

      tx.update(playerRefs[i], {
        statsByMode: { ...player.statsByMode, [input.gameMode]: updatedModeStats },
        teamUsage: updatedTeamUsage,
        badges: [...player.badges, ...newBadgeIds],
        ...packUpdate,
      })
    })

    tx.set(gameRef, {
      gameMode: input.gameMode,
      maddenVersion: input.maddenVersion,
      winnerIds: input.winnerIds,
      loserIds: input.loserIds,
      loggedBy: input.loggedBy,
      timestamp: Date.now(),
      winnerTeam: input.winnerTeam,
      loserTeam: input.loserTeam,
      winnerScore: input.winnerScore,
      loserScore: input.loserScore,
      scoreDiff,
      comebackDeficit: input.comebackDeficit,
      isBlowout,
      isComeback,
      stats: input.stats,
      ...(input.clipUrl ? { clipUrl: input.clipUrl } : {}),
      ...(photoUrl ? { photoUrl } : {}),
    })
  })

  for (const badgeId of earnedByLogger) {
    notifyAchievement(badgeId)
  }

  return gameRef.id
}
