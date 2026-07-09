import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase'

export async function uploadClipPhoto(gameId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const photoRef = ref(storage, `clips/${gameId}/photo.${ext}`)
  await uploadBytes(photoRef, file)
  return getDownloadURL(photoRef)
}
