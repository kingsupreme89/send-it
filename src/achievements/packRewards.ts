import type { PackRewardTier } from '../types'

export interface PackRewardDef {
  id: string
  name: string
  tier: PackRewardTier
  description: string
  weight: number
}

export const PACK_REWARDS: PackRewardDef[] = [
  {
    id: 'locker_skin',
    name: 'Diagonal Wrap',
    tier: 'Silver',
    description: "Switches the locker wall's background pattern to a diagonal variant.",
    weight: 30,
  },
  {
    id: 'home_locker_pick',
    name: 'Home Locker Pick',
    tier: 'Gold',
    description: 'Your initials appear in a badge in the Home locker spotlight area.',
    weight: 20,
  },
  {
    id: 'ticker_message',
    name: 'Ticker Takeover',
    tier: 'Gold',
    description: 'Injects a custom headline at the front of the scrolling ticker.',
    weight: 20,
  },
  {
    id: 'nameplate_style',
    name: 'Outline Nameplate',
    tier: 'Silver',
    description: 'Switches the Me-tab name treatment to an outlined style.',
    weight: 30,
  },
  {
    id: 'card_border',
    name: 'Border Upgrade',
    tier: 'Legendary',
    description: "Permanently upgrades the Me-tab card's border and glow tier.",
    weight: 10,
  },
  {
    id: 'title_tag',
    name: 'Title: Comeback King',
    tier: 'Gold',
    description: 'Shows a quoted title line under your name on the Me tab.',
    weight: 20,
  },
  {
    id: 'mode_token',
    name: '2x Mode Vote',
    tier: 'Bronze',
    description: 'Shows a 2X VOTE ACTIVE indicator on the Log tab mode picker.',
    weight: 40,
  },
  {
    id: 'stat_spotlight',
    name: 'Stat Spotlight',
    tier: 'Silver',
    description: 'Pins a spotlight stat pill to the Leaderboard card header.',
    weight: 30,
  },
  {
    id: 'trophy_case',
    name: 'Trophy: Iron Will',
    tier: 'Bronze',
    description: 'Adds a trophy tile to the Me-tab Trophy Case.',
    weight: 40,
  },
]

export function drawPackReward(rng: () => number = Math.random): PackRewardDef {
  const total = PACK_REWARDS.reduce((sum, r) => sum + r.weight, 0)
  let roll = rng() * total
  for (const reward of PACK_REWARDS) {
    if (roll < reward.weight) return reward
    roll -= reward.weight
  }
  return PACK_REWARDS[PACK_REWARDS.length - 1]
}

/** ISO 8601 week key, e.g. "2026-W29". Used as an idempotency guard for weekly pack grants. */
export function getIsoWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}
