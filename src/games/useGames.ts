import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import type { GameDoc } from '../types'

export function useGames(limitCount = 100) {
  const [games, setGames] = useState<GameDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'games'), orderBy('timestamp', 'desc'), limit(limitCount))
    return onSnapshot(q, (snap) => {
      setGames(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GameDoc))
      setLoading(false)
    })
  }, [limitCount])

  return { games, loading }
}
