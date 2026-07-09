import { BADGES } from '../achievements/badgeRules'

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!notificationsSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  return Notification.requestPermission()
}

// In-app only — fires while this tab is open. True background push (closed app,
// other players' achievements) needs Firebase Cloud Messaging on a Blaze-plan project.
export function notifyAchievement(badgeId: string) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  const badge = BADGES[badgeId]
  if (!badge) return
  try {
    new Notification(`${badge.emoji} Badge earned: ${badge.label}`, {
      body: badge.description,
      tag: `badge-${badgeId}-${Date.now()}`,
    })
  } catch {
    // Notification constructor can throw on some mobile browsers; safe to ignore.
  }
}
