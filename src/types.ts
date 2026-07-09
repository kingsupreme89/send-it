import type { TeamId } from './constants/nflTeams'

export type GameMode = '1v1_regular' | '2v2_regular' | '1v1_mut'
export type MaddenVersion = 'madden26' | 'madden27'

export const GAME_MODES: { id: GameMode; label: string }[] = [
  { id: '1v1_regular', label: '1v1 Regular' },
  { id: '2v2_regular', label: '2v2 Regular' },
  { id: '1v1_mut', label: '1v1 Madden Ultimate Team' },
]

export const MADDEN_VERSIONS: { id: MaddenVersion; label: string }[] = [
  { id: 'madden26', label: 'Madden 26' },
  { id: 'madden27', label: 'Madden 27' },
]

export const REACTION_EMOJIS = ['🔥', '😭', '💀', '😂', '👑'] as const

export interface TrashTalkComment {
  id: string
  uid: string
  text: string
  createdAt: number
}

export interface PlayerStats {
  wins: number
  losses: number
  passingYds: number
  rushingYds: number
  interceptions: number
  sacks: number
  interceptionTDs: number
  kickReturnTDs: number
  puntReturnTDs: number
  currentStreak: number
  bestStreak: number
}

export const emptyPlayerStats = (): PlayerStats => ({
  wins: 0,
  losses: 0,
  passingYds: 0,
  rushingYds: 0,
  interceptions: 0,
  sacks: 0,
  interceptionTDs: 0,
  kickReturnTDs: 0,
  puntReturnTDs: 0,
  currentStreak: 0,
  bestStreak: 0,
})

export interface Player {
  uid: string
  displayName: string
  photoURL: string | null
  googleEmail: string
  favoriteTeam: TeamId | null
  hometown: string
  statsByMode: Record<GameMode, PlayerStats>
  teamUsage: Partial<Record<TeamId, number>>
  badges: string[]
  mustChangePassword: boolean
  createdAt: number
}

export interface GameStatLine {
  passingYds: number
  rushingYds: number
  interceptions: number
  sacks: number
  interceptionTDs: number
  kickReturnTDs: number
  puntReturnTDs: number
}

export const emptyGameStatLine = (): GameStatLine => ({
  passingYds: 0,
  rushingYds: 0,
  interceptions: 0,
  sacks: 0,
  interceptionTDs: 0,
  kickReturnTDs: 0,
  puntReturnTDs: 0,
})

export interface GameDoc {
  id: string
  gameMode: GameMode
  maddenVersion: MaddenVersion
  winnerIds: string[]
  loserIds: string[]
  loggedBy: string
  timestamp: number
  winnerTeam: TeamId
  loserTeam: TeamId
  winnerScore: number
  loserScore: number
  scoreDiff: number
  comebackDeficit: number
  isBlowout: boolean
  isComeback: boolean
  stats: Record<string, GameStatLine>
  reactions?: Record<string, string>
  comments?: TrashTalkComment[]
  clipUrl?: string
  photoUrl?: string
}
