import { useState } from 'react'
import type { User } from 'firebase/auth'
import { createProfile } from './useProfile'
import { TeamPicker } from '../components/TeamPicker'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { NetworkHeading } from '../components/NetworkHeading'
import type { TeamId } from '../constants/nflTeams'

export function CreateProfile({ user }: { user: User }) {
  const [displayName, setDisplayName] = useState(user.displayName ?? '')
  const [favoriteTeam, setFavoriteTeam] = useState<TeamId | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = displayName.trim().length > 0 && favoriteTeam !== null && !submitting

  const handleSubmit = async () => {
    if (!canSubmit || !favoriteTeam) return
    setSubmitting(true)
    await createProfile(user, displayName.trim(), favoriteTeam)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-1">
          <NetworkHeading size="md">Welcome to the squad</NetworkHeading>
        </div>
        <p className="mb-4 text-sm text-[var(--text-muted)]">Set up your profile to get started.</p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text)]">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
              placeholder="Your name"
            />
          </label>

          <TeamPicker label="Favorite team" value={favoriteTeam} onChange={setFavoriteTeam} id="favorite-team" />

          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? 'Saving...' : 'Get started'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
