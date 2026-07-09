import type { GameStatLine } from '../types'

export interface BadgeDefinition {
  id: string
  label: string
  description: string
  emoji: string
}

export const BADGES: Record<string, BadgeDefinition> = {
  three_hundred_club: {
    id: 'three_hundred_club',
    label: '300+ Club',
    description: 'Threw for 300+ passing yards in a single game',
    emoji: '🎯',
  },
  workhorse: {
    id: 'workhorse',
    label: 'Workhorse',
    description: 'Rushed for 150+ yards in a single game',
    emoji: '🏃',
  },
  takeaway_king: {
    id: 'takeaway_king',
    label: 'Takeaway King',
    description: 'Picked off 3+ passes in a single game',
    emoji: '🛡️',
  },
  blowout_king: {
    id: 'blowout_king',
    label: 'Blowout King',
    description: 'Won a game by more than 21 points',
    emoji: '💥',
  },
  comeback_king: {
    id: 'comeback_king',
    label: 'Comeback King',
    description: 'Overcame a 17+ point deficit to win',
    emoji: '🔥',
  },
  streak_3: { id: 'streak_3', label: '3-Game Streak', description: 'Won 3 games in a row', emoji: '🔥' },
  streak_5: { id: 'streak_5', label: '5-Game Streak', description: 'Won 5 games in a row', emoji: '🔥' },
  streak_10: { id: 'streak_10', label: '10-Game Streak', description: 'Won 10 games in a row', emoji: '👑' },
  team_loyalist: {
    id: 'team_loyalist',
    label: 'Team Loyalist',
    description: 'Played 10+ games with the same team',
    emoji: '🏈',
  },
}

interface EvaluateBadgesParams {
  existingBadges: string[]
  statLine: GameStatLine
  isWinner: boolean
  isBlowout: boolean
  isComeback: boolean
  updatedStreak: number
  teamUsageCountForGameTeam: number
}

export function evaluateNewBadges(params: EvaluateBadgesParams): string[] {
  const earned: string[] = []
  const has = (id: string) => params.existingBadges.includes(id) || earned.includes(id)

  if (params.statLine.passingYds >= 300 && !has('three_hundred_club')) earned.push('three_hundred_club')
  if (params.statLine.rushingYds >= 150 && !has('workhorse')) earned.push('workhorse')
  if (params.statLine.interceptions >= 3 && !has('takeaway_king')) earned.push('takeaway_king')
  if (params.isWinner && params.isBlowout && !has('blowout_king')) earned.push('blowout_king')
  if (params.isWinner && params.isComeback && !has('comeback_king')) earned.push('comeback_king')
  if (params.updatedStreak >= 3 && !has('streak_3')) earned.push('streak_3')
  if (params.updatedStreak >= 5 && !has('streak_5')) earned.push('streak_5')
  if (params.updatedStreak >= 10 && !has('streak_10')) earned.push('streak_10')
  if (params.teamUsageCountForGameTeam >= 10 && !has('team_loyalist')) earned.push('team_loyalist')

  return earned
}
