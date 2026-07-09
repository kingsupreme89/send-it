import { useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import { useProfile } from '../profile/useProfile'
import { SQUAD } from '../constants/squad'
import { DEFAULT_PASSWORD, MIN_PASSWORD_LENGTH } from '../constants/auth'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

function ChangePasswordModal() {
  const { changePassword, user } = useAuth()
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const tooShort = newPw.length > 0 && newPw.length < MIN_PASSWORD_LENGTH
  const isDefault = newPw === DEFAULT_PASSWORD
  const mismatch = confirmPw.length > 0 && newPw !== confirmPw
  const canSubmit =
    newPw.length >= MIN_PASSWORD_LENGTH &&
    newPw === confirmPw &&
    newPw !== DEFAULT_PASSWORD &&
    !saving

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !user) return
    setSaving(true)
    setError(null)
    try {
      await changePassword(newPw)
      // Clear the mustChangePassword flag — profile listener unlocks the app
      await updateDoc(doc(db, 'players', user.uid), { mustChangePassword: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <Card className="w-full max-w-sm shine-border" strong hover={false}>
        <div className="mb-1">
          <NetworkHeading size="md">Set your password</NetworkHeading>
        </div>
        <p className="mb-4 text-sm normal-case tracking-normal text-[var(--text-muted)]">
          First sign-in — change the default password before you can use the app.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">New password</span>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoFocus
              autoComplete="new-password"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Confirm password</span>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              autoComplete="new-password"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
              placeholder="Re-enter new password"
            />
          </label>

          {tooShort && (
            <p className="text-xs font-medium text-red-400">
              Password must be at least {MIN_PASSWORD_LENGTH} characters
            </p>
          )}
          {isDefault && (
            <p className="text-xs font-medium text-red-400">Pick something other than the default password</p>
          )}
          {mismatch && <p className="text-xs font-medium text-red-400">Passwords don't match</p>}
          {error && <p className="text-xs font-medium text-red-400">{error}</p>}

          <Button type="submit" disabled={!canSubmit}>
            {saving ? 'Saving...' : 'Set password & continue'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

function SquadLogin({ onSignIn }: { onSignIn: (username: string, password: string) => Promise<unknown> }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = username !== '' && password !== '' && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await onSignIn(username, password)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed'
      if (message.includes('invalid-credential') || message.includes('wrong-password') || message.includes('user-not-found')) {
        setError(`Wrong password — first login is ${DEFAULT_PASSWORD}, then you'll set a new one`)
      } else if (message.includes('too-many-requests')) {
        setError('Too many attempts — wait a moment and try again')
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <img
        src="/icons/icon-512.png"
        alt="Send It!"
        className="h-20 w-20 rounded-3xl object-cover ring-2 ring-white/15"
        style={{ boxShadow: '0 16px 40px -8px color-mix(in srgb, var(--accent) 55%, transparent)' }}
      />
      <h1 className="gradient-text text-5xl font-extrabold tracking-tight sm:text-6xl">SEND IT!</h1>
      <p className="max-w-xs text-sm normal-case tracking-normal text-[var(--text-muted)]">
        Squad stats. Live rivalries. Pure chaos.
      </p>

      <Card className="w-full max-w-sm shine-border" strong hover={false}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <label className="flex flex-col gap-1 text-sm normal-case tracking-normal">
            <span className="font-medium text-[var(--text)]">Who are you?</span>
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-input rounded-xl px-3 py-2.5 text-[var(--text)]"
            >
              <option value="" disabled>
                Select your name
              </option>
              {SQUAD.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm normal-case tracking-normal">
            <span className="font-medium text-[var(--text)]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="glass-input rounded-xl px-3 py-2.5 text-[var(--text)] normal-case"
              placeholder="Enter your password"
            />
          </label>

          <p className="text-left text-xs normal-case tracking-normal text-[var(--text-muted)]">
            First time? Use <span className="font-semibold text-[var(--text)]">{DEFAULT_PASSWORD}</span> — you'll
            be asked to set a new password right after.
          </p>

          {error && <p className="text-xs font-medium text-red-400">{error}</p>}

          <Button type="submit" disabled={!canSubmit}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export function AuthGate({ children }: { children: (uid: string) => ReactNode }) {
  const { user, loading, signIn } = useAuth()
  const { profile, loading: profileLoading } = useProfile(user?.uid ?? null)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <SquadLogin onSignIn={signIn} />
  }

  // Wait for profile to load before deciding whether to show the password change modal
  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading profile...</p>
      </div>
    )
  }

  // First sign-in — force password change before entering the app
  if (profile?.mustChangePassword) {
    return <ChangePasswordModal />
  }

  return <>{children(user.uid)}</>
}
