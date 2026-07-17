import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase'
import { emailForUsername } from '../constants/squad'
import { DEFAULT_PASSWORD } from '../constants/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signIn = async (username: string, password: string) => {
    const email = emailForUsername(username)
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : ''
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        try {
          return await createUserWithEmailAndPassword(auth, email, password)
        } catch (createErr: unknown) {
          const createCode = typeof createErr === 'object' && createErr !== null && 'code' in createErr ? String(createErr.code) : ''
          if (createCode === 'auth/email-already-in-use') {
            throw err
          }
          throw createErr
        }
      }
      throw err
    }
  }

  const logOut = () => signOut(auth)

  const changePassword = async (newPassword: string) => {
    if (!user || !user.email) throw new Error('Not signed in')
    try {
      await updatePassword(user, newPassword)
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : ''
      if (code !== 'auth/requires-recent-login') throw err
      // This flow only runs on first sign-in (mustChangePassword), so the current
      // password is always the shared default — reauthenticate with that and retry.
      const credential = EmailAuthProvider.credential(user.email, DEFAULT_PASSWORD)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
    }
  }

  return { user, loading, signIn, logOut, changePassword }
}