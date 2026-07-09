import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updatePassword, type User } from 'firebase/auth'
import { auth } from '../firebase'
import { emailForUsername } from '../constants/squad'

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

  const changePassword = (newPassword: string) => {
    if (!user) throw new Error('Not signed in')
    return updatePassword(user, newPassword)
  }

  return { user, loading, signIn, logOut, changePassword }
}