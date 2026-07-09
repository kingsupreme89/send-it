import { useState } from 'react'
import { Card } from './Card'
import { Button } from './Button'
import { NetworkHeading } from './NetworkHeading'
import { notificationPermission, notificationsSupported, requestNotificationPermission } from '../utils/notifications'

const STORAGE_KEY = 'send-it-settings-compact'

function SettingsToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-3">
      <div>
        <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-[var(--accent)]' : 'bg-white/15'}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [compact, setCompact] = useState(() => window.localStorage.getItem(STORAGE_KEY) === 'true')
  const [permission, setPermission] = useState(notificationPermission())

  const handleCompactToggle = (value: boolean) => {
    setCompact(value)
    window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false')
  }

  const handleEnableNotifications = async () => {
    if (!notificationsSupported()) return
    const result = await requestNotificationPermission()
    setPermission(result)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <Card className="w-full max-w-md shine-border" strong hover={false}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Account</p>
            <NetworkHeading size="md">Settings</NetworkHeading>
          </div>
          <button onClick={onClose} className="text-sm text-[var(--text-muted)]">
            Close
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <SettingsToggle
            label="Compact home view"
            description="Reduce card density so the dashboard feels lighter on mobile."
            checked={compact}
            onChange={handleCompactToggle}
          />

          {notificationsSupported() && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Badge alerts</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {permission === 'granted'
                      ? 'You’ll get badge notifications when they unlock.'
                      : permission === 'denied'
                        ? 'Notifications are blocked in this browser.'
                        : 'Enable browser notifications for badge alerts.'}
                  </p>
                </div>
                {permission !== 'granted' && (
                  <Button variant="secondary" onClick={handleEnableNotifications} className="shrink-0 px-3 py-2">
                    {permission === 'denied' ? 'Blocked' : 'Enable'}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-3">
            <p className="text-sm font-semibold text-[var(--text)]">Quick tips</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
              <li>Log games right after a match to keep your stats fresh.</li>
              <li>Use the profile page to update your favorite team and hometown.</li>
              <li>Open the home screen anytime to check your weekly momentum.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
