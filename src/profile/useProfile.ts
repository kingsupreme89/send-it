import { useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { Player } from '../types'
import type { TeamId } from '../constants/nflTeams'

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

export async function updateProfile(
  uid: string,
  updates: Partial<Pick<Player, 'displayName' | 'favoriteTeam' | 'photoURL' | 'hometown' | 'mustChangePassword'>>,
) {
  await updateDoc(doc(db, 'players', uid), updates)
}