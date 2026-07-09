import { useEffect, useMemo, useState } from 'react'
import { Card } from './Card'
import { Button } from './Button'
import { NetworkHeading } from './NetworkHeading'

const STORAGE_KEY = 'send-it-onboarding-complete'

const STEPS = [
  {
    title: 'Log your first game',
    copy: 'Capture a win or loss so your stats, streaks, and rankings update immediately.',
  },
  {
    title: 'Check your momentum',
    copy: 'Use the home screen to see your streak, challenge status, and recent squad activity.',
  },
  {
    title: 'Keep the squad in the loop',
    copy: 'Share reactions and recap your week so the crew can see what happened.',
  },
]

export function OnboardingGuide() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const completed = window.localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      setVisible(true)
    }
  }, [])

  const current = useMemo(() => STEPS[step], [step])

  if (!visible) return null

  const close = () => {
    window.localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <Card className="w-full max-w-md shine-border" strong hover={false}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">New here?</p>
            <NetworkHeading size="md">Quick start</NetworkHeading>
          </div>
          <button onClick={close} className="text-sm text-[var(--text-muted)]">
            Skip
          </button>
        </div>

        <div className="mb-4 rounded-2xl bg-[var(--surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Step {step + 1} of {STEPS.length}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--text)]">{current.title}</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{current.copy}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onClick={close}>Start tracking</Button>
          )}
        </div>
      </Card>
    </div>
  )
}
