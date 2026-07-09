import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { TeamId } from '../constants/nflTeams'
import { emptyPlayerStats, type GameMode, type Player } from '../types'

const GAME_MODES: GameMode[] = ['1v1_regular', '2v2_regular', '1v1_mut']

export function useProfile(uid: string | null) {
  const [profile, setProfile] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    return onSnapshot(doc(db, 'players', uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as Player) : null)
      setLoading(false)
    })
  }, [uid])

  return { profile, loading }
}

/** Create a new player doc for a signed-in user who has no profile yet. */
export async function createProfile(user: User, displayName: string, favoriteTeam: TeamId) {
  const statsByMode = Object.fromEntries(GAME_MODES.map((mode) => [mode, emptyPlayerStats()])) as Player['statsByMode']

  await setDoc(doc(db, 'players', user.uid), {
    uid: user.uid,
    displayName,
    photoURL: user.photoURL,
    googleEmail: user.email ?? '',
    favoriteTeam,
    hometown: '',
    statsByMode,
    teamUsage: {},
    badges: [],
    mustChangePassword: false,
    createdAt: Date.now(),
  } satisfies Omit<Player, 'createdAt'> & { createdAt: number })
}

export async function updateProfile(
  uid: string,
  updates: Partial<Pick<Player, 'displayName' | 'favoriteTeam' | 'photoURL' | 'hometown' | 'mustChangePassword'>>,
) {
  await updateDoc(doc(db, 'players', uid), updates)
}