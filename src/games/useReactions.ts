import { deleteField, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export async function setReaction(gameId: string, uid: string, emoji: string | null) {
  await updateDoc(doc(db, 'games', gameId), {
    [`reactions.${uid}`]: emoji === null ? deleteField() : emoji,
  })
}
