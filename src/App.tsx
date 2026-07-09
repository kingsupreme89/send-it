import { useState } from 'react'
import { isFirebaseConfigured } from './firebase'
import { AuthGate } from './auth/AuthGate'
import { useAuth } from './auth/useAuth'
import { useProfile } from './profile/useProfile'
import { CreateProfile } from './profile/CreateProfile'
import { useTeamTheme } from './theme/useTeamTheme'
import { LogGameForm } from './games/LogGameForm'
import { Leaderboard } from './dashboard/Leaderboard'
import { Feed } from './dashboard/Feed'
import { WeeklyRecapCard } from './dashboard/WeeklyRecapCard'
import { HeadToHead } from './dashboard/HeadToHead'
import { Trends } from './dashboard/Trends'
import { PlayerHistory } from './dashboard/PlayerHistory'
import { PlayerProfile } from './dashboard/PlayerProfile'
import { PlayerAvatar } from './components/PlayerAvatar'
import { TeamBadge } from './components/TeamBadge'
import { KSNLogo } from './components/KSNLogo'
import { Ticker } from './components/Ticker'
import { NFL_TEAMS_BY_ID } from './constants/nflTeams'
import { HomeIcon, PlusCircleIcon, CompareIcon, TrendsIcon, UserIcon } from './components/icons'

type Tab = 'home' | 'log' | 'compare' | 'trends' | 'me'

const TABS: { id: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'log', label: 'Log Game', Icon: PlusCircleIcon },
  { id: 'compare', label: 'Compare', Icon: CompareIcon },
  { id: 'trends', label: 'Trends', Icon: TrendsIcon },
  { id: 'me', label: 'Me', Icon: UserIcon },
]

function Wordmark() {
  return (
    <h1
      style={{
        fontFamily: 'var(--font-wordmark)',
        fontSize: '1.4rem',
        lineHeight: 1,
        letterSpacing: '0.02em',
        backgroundImage: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 55%, #ffffff))',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        textShadow: 'none',
      }}
    >
      SEND IT!
    </h1>
  )
}

function AppShell({ uid }: { uid: string }) {
  const { profile, loading } = useProfile(uid)
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('home')
  const [detailPlayerUid, setDetailPlayerUid] = useState<string | null>(null)

  useTeamTheme(profile?.favoriteTeam)

  const handleTabChange = (newTab: Tab) => {
    setDetailPlayerUid(null)
    setTab(newTab)
  }

  const handleSelectPlayer = (playerUid: string) => {
    setDetailPlayerUid(playerUid)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return user ? <CreateProfile user={user} /> : null
  }

  return (
    <div className="flex min-h-screen flex-col pb-28">
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'var(--network-black)',
          borderBottom: '3px solid var(--accent)',
          boxShadow: '0 3px 20px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <KSNLogo height={22} />
            <div className="h-5 w-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
            <TeamBadge team={profile.favoriteTeam ? NFL_TEAMS_BY_ID[profile.favoriteTeam] : null} size={32} />
            <Wordmark />
          </div>
          <button onClick={() => handleTabChange('me')} className="flex items-center gap-2">
            <PlayerAvatar photoURL={profile.photoURL} displayName={profile.displayName} size={34} />
          </button>
        </div>
        <Ticker />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {tab === 'home' && detailPlayerUid ? (
          <PlayerProfile
            uid={detailPlayerUid}
            currentUid={uid}
            onBack={() => setDetailPlayerUid(null)}
          />
        ) : tab === 'home' ? (
          <div className="flex flex-col gap-4">
            <WeeklyRecapCard onSelectPlayer={handleSelectPlayer} />
            <Leaderboard onSelectPlayer={handleSelectPlayer} />
            <Feed currentUid={uid} />
          </div>
        ) : null}
        {tab === 'log' && <LogGameForm currentUid={uid} onLogged={() => handleTabChange('home')} />}
        {tab === 'compare' && <HeadToHead currentUid={uid} />}
        {tab === 'trends' && <Trends currentUid={uid} />}
        {tab === 'me' && <PlayerHistory currentUid={uid} />}
      </main>

      <nav className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-solid)]/90 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              aria-label={t.label}
              className="flex flex-col items-center gap-0.5 rounded-full px-3.5 py-2 text-[10px] font-medium transition-all duration-150"
              style={
                active
                  ? {
                      backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                      color: 'white',
                      boxShadow: '0 4px 14px -2px color-mix(in srgb, var(--accent) 60%, transparent)',
                    }
                  : { color: 'var(--text-muted)' }
              }
            >
              <t.Icon size={19} />
              {t.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function FirebaseSetupNotice() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-[var(--text)]">Firebase isn't configured yet</h1>
      <p className="max-w-md text-sm text-[var(--text-muted)]">
        Create a Firebase project (Auth + Firestore), then copy <code>.env.example</code> to{' '}
        <code>.env</code> and fill in your project's config values from the Firebase console.
        Restart the dev server after saving.
      </p>
    </div>
  )
}

function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseSetupNotice />
  }
  return <AuthGate>{(uid) => <AppShell uid={uid} />}</AuthGate>
}

export default App
