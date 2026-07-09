import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { TrashTalkComment } from '../types'

export async function addTrashTalk(
  gameId: string,
  existing: TrashTalkComment[] | undefined,
  comment: Omit<TrashTalkComment, 'id'>,
) {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const next: TrashTalkComment[] = [...(existing ?? []), { ...comment, id }].slice(-30)
  await updateDoc(doc(db, 'games', gameId), { comments: next })
  return id
}
