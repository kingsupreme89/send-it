import { useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import { useProfile } from '../profile/useProfile'
import { SQUAD } from '../constants/squad'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

function ChangePasswordModal({ onDone }: { onDone: () => void }) {
  const { changePassword } = useAuth()
  const { user } = useAuth()
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const canSubmit = newPw.length >= 6 && newPw === confirmPw && !saving

  const handleSubmit = async () => {
    if (!canSubmit || !user) return
    setSaving(true)
    setError(null)
    try {
      await changePassword(newPw)
      // Clear the mustChangePassword flag in Firestore
      await updateDoc(doc(db, 'players', user.uid), { mustChangePassword: false })
      onDone()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-sm">
        <div className="mb-1">
          <NetworkHeading size="md">Set your password</NetworkHeading>
        </div>
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          This is your first sign-in — you need to change the default password before continuing.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">New password</span>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
              placeholder="At least 6 characters"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Confirm password</span>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
              placeholder="Re-enter new password"
            />
          </label>

          {newPw && confirmPw && newPw !== confirmPw && (
            <p className="text-xs font-medium text-red-400">Passwords don't match</p>
          )}
          {error && <p className="text-xs font-medium text-red-400">{error}</p>}

          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {saving ? 'Saving...' : 'Set password & continue'}
          </Button>
        </div>
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
      if (message.includes('invalid-credential') || message.includes('wrong-password')) {
        setError('Wrong password — try again')
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
        className="h-20 w-20 rounded-3xl object-cover"
        style={{ boxShadow: '0 12px 30px -6px color-mix(in srgb, var(--accent) 55%, transparent)' }}
      />
      <h1
        style={{
          fontFamily: 'var(--font-wordmark)',
          fontSize: '3.25rem',
          lineHeight: 1,
          letterSpacing: '0.06em',
          backgroundImage: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 55%, #ffffff))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        SEND IT!
      </h1>

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Who are you?</span>
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
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

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
              placeholder="Enter your password"
            />
          </label>

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
    return <ChangePasswordModal onDone={() => {}} />
  }

  return <>{children(user.uid)}</>
}
