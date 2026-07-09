import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, updatePassword, type User } from 'firebase/auth'
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

  const signIn = (username: string, password: string) =>
    signInWithEmailAndPassword(auth, emailForUsername(username), password)

  const logOut = () => signOut(auth)

  const changePassword = (newPassword: string) => {
    if (!user) throw new Error('Not signed in')
    return updatePassword(user, newPassword)
  }

  return { user, loading, signIn, logOut, changePassword }
}