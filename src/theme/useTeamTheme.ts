import { useEffect } from 'react'
import { NFL_TEAMS_BY_ID, type TeamId } from '../constants/nflTeams'

const DEFAULT_ACCENT = '#3b82f6'
const DEFAULT_ACCENT_SECONDARY = '#8b5cf6'

export function useTeamTheme(favoriteTeam: TeamId | null | undefined) {
  useEffect(() => {
    const team = favoriteTeam ? NFL_TEAMS_BY_ID[favoriteTeam] : null
    const root = document.documentElement
    root.style.setProperty('--accent', team?.primary ?? DEFAULT_ACCENT)
    root.style.setProperty('--accent-secondary', team?.secondary ?? DEFAULT_ACCENT_SECONDARY)
  }, [favoriteTeam])
}
