import { useState } from 'react'
import { motion } from 'motion/react'
import { isFirebaseConfigured } from './firebase'
import { AuthGate } from './auth/AuthGate'
import { useAuth } from './auth/useAuth'
import { useProfile } from './profile/useProfile'
import { CreateProfile } from './profile/CreateProfile'
import { useTeamTheme } from './theme/useTeamTheme'
import { LogGameForm } from './games/LogGameForm'
import { LeaderboardPreview } from './dashboard/LeaderboardPreview'
import { Feed } from './dashboard/Feed'
import { WeeklyRecapCard } from './dashboard/WeeklyRecapCard'
import { WeeklyChallengeCard } from './dashboard/WeeklyChallengeCard'
import { RivalryStrip } from './dashboard/RivalryStrip'
import { HeadToHead } from './dashboard/HeadToHead'
import { Trends } from './dashboard/Trends'
import { PlayerHistory } from './dashboard/PlayerHistory'
import { PlayerProfile } from './dashboard/PlayerProfile'
import { TodayStreakCard } from './dashboard/TodayStreakCard'
import { PlayerAvatar } from './components/PlayerAvatar'
import { TeamBadge } from './components/TeamBadge'
import { TeamPickerSheet } from './components/TeamPickerSheet'
import { Ticker } from './components/Ticker'
import { AmbientBackground } from './components/AmbientBackground'
import { LockerRoomBackground } from './components/LockerRoomBackground'
import { WeeklyPackCard } from './components/WeeklyPackCard'
import { PackModal } from './components/PackModal'
import { PageTransition } from './components/PageTransition'
import { WinCelebration, type CelebrationPayload } from './components/WinCelebration'
import { OnboardingGuide } from './components/OnboardingGuide'
import { SettingsPanel } from './components/SettingsPanel'
import { claimPackReward } from './achievements/usePackRewards'
import { updateProfile } from './profile/useProfile'
import { NFL_TEAMS_BY_ID } from './constants/nflTeams'
import { HomeIcon, PlusCircleIcon, CompareIcon, TrendsIcon, UserIcon } from './components/icons'

type Tab = 'home' | 'log' | 'compare' | 'trends' | 'me'

const TABS: { id: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'log', label: 'Log', Icon: PlusCircleIcon },
  { id: 'compare', label: 'Compare', Icon: CompareIcon },
  { id: 'trends', label: 'Trends', Icon: TrendsIcon },
  { id: 'me', label: 'Me', Icon: UserIcon },
]

function Wordmark() {
  return (
    <h1 className="gradient-text font-[family-name:var(--font-wordmark)] text-[1.35rem] font-extrabold tracking-tight">
      SEND IT!
    </h1>
  )
}

function AppShell({ uid }: { uid: string }) {
  const { profile, loading } = useProfile(uid)
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('home')
  const [detailPlayerUid, setDetailPlayerUid] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<CelebrationPayload | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showTeamPicker, setShowTeamPicker] = useState(false)
  const [showPack, setShowPack] = useState(false)

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
        <AmbientBackground />
        <motion.p
          className="text-sm text-[var(--text-muted)]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          Loading…
        </motion.p>
      </div>
    )
  }

  if (!profile) {
    return user ? <CreateProfile user={user} /> : null
  }

  const pageId = tab === 'home' && detailPlayerUid ? `profile-${detailPlayerUid}` : tab
  const team = profile.favoriteTeam ? NFL_TEAMS_BY_ID[profile.favoriteTeam] : NFL_TEAMS_BY_ID.cowboys

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden pb-28">
      <LockerRoomBackground
        team={team}
        lockerSkin={profile.claimedLockerSkin}
        lockerPickInitials={profile.claimedLockerPick}
      />

      <header className="sticky top-0 z-40 border-b border-white/[0.08] backdrop-blur-xl" style={{ background: 'rgba(8,9,14,0.62)' }}>
        <div className="flex items-center justify-between px-3.5 py-3 sm:px-4">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setShowTeamPicker(true)}>
              <TeamBadge team={team} size={32} />
            </button>
            <Wordmark />
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowTeamPicker(true)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[var(--text-muted)]"
            >
              TEAM
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowSettings(true)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[var(--text-muted)]"
            >
              Settings
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleTabChange('me')}
              className="flex items-center gap-2 rounded-full ring-2 ring-white/10"
            >
              <PlayerAvatar photoURL={profile.photoURL} displayName={profile.displayName} size={34} />
            </motion.button>
          </div>
        </div>
        <Ticker claimedTicker={profile.claimedTicker} />
      </header>

      <TeamPickerSheet
        open={showTeamPicker}
        value={profile.favoriteTeam}
        onChange={(newTeam) => void updateProfile(uid, { favoriteTeam: newTeam })}
        onClose={() => setShowTeamPicker(false)}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-3.5 py-4 sm:px-4 sm:py-5">
        <PageTransition id={pageId}>
          {tab === 'home' && detailPlayerUid ? (
            <PlayerProfile
              uid={detailPlayerUid}
              currentUid={uid}
              onBack={() => setDetailPlayerUid(null)}
            />
          ) : tab === 'home' ? (
            <div className="flex flex-col gap-4">
              <TodayStreakCard player={profile} />
              <WeeklyPackCard
                packAvailableWeek={profile.packAvailableWeek}
                lastPackClaimedWeek={profile.lastPackClaimedWeek}
                onOpen={() => setShowPack(true)}
              />
              <WeeklyChallengeCard onSelectPlayer={handleSelectPlayer} />
              <RivalryStrip onSelectPlayer={handleSelectPlayer} />
              <WeeklyRecapCard onSelectPlayer={handleSelectPlayer} />
              <LeaderboardPreview onSelectPlayer={handleSelectPlayer} claimedSpotlight={profile.claimedSpotlight} />
              <Feed currentUid={uid} />
            </div>
          ) : null}
          {tab === 'log' && (
            <LogGameForm
              currentUid={uid}
              claimedModeToken={profile.claimedModeToken}
              onLogged={(payload) => {
                setCelebration(payload)
                handleTabChange('home')
              }}
            />
          )}
          {tab === 'compare' && <HeadToHead currentUid={uid} />}
          {tab === 'trends' && <Trends currentUid={uid} />}
          {tab === 'me' && <PlayerHistory currentUid={uid} />}
        </PageTransition>
      </main>

      <PackModal
        open={showPack}
        onClose={() => setShowPack(false)}
        team={team}
        onClaim={(reward) => void claimPackReward(profile, reward)}
      />

      <nav className="glass-strong fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 gap-0.5 rounded-full p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <motion.button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              aria-label={t.label}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center gap-0.5 rounded-full px-3.5 py-2 text-[10px] font-semibold"
              style={{ color: active ? 'white' : 'var(--text-muted)' }}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                    boxShadow: '0 6px 18px -4px color-mix(in srgb, var(--accent) 65%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-0.5">
                <t.Icon size={19} />
                {t.label}
              </span>
            </motion.button>
          )
        })}
      </nav>

      <OnboardingGuide />
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <WinCelebration data={celebration} onDone={() => setCelebration(null)} />
    </div>
  )
}

function FirebaseSetupNotice() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <AmbientBackground />
      <h1 className="gradient-text text-3xl font-extrabold">Firebase isn't configured yet</h1>
      <p className="max-w-md text-sm text-[var(--text-muted)]">
        Create a Firebase project (Auth + Firestore), then copy <code className="text-[var(--text)]">.env.example</code>{' '}
        to <code className="text-[var(--text)]">.env</code> and fill in your project's config values.
      </p>
    </div>
  )
}

function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseSetupNotice />
  }
  return (
    <>
      <AmbientBackground />
      <AuthGate>{(uid) => <AppShell uid={uid} />}</AuthGate>
    </>
  )
}

export default App
