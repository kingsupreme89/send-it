import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getIsoWeekKey, type PackRewardDef } from './packRewards'
import { notifyPackClaim } from '../utils/notifications'
import type { Player } from '../types'

function initialsFor(displayName: string) {
  return displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

function effectFieldsFor(reward: PackRewardDef, player: Player): Partial<Player> {
  switch (reward.id) {
    case 'locker_skin':
      return { claimedLockerSkin: 'diagonal' }
    case 'home_locker_pick':
      return { claimedLockerPick: initialsFor(player.displayName) }
    case 'ticker_message':
      return { claimedTicker: `${player.displayName} claimed the Ticker Takeover this week` }
    case 'nameplate_style':
      return { claimedNameplate: 'outline' }
    case 'card_border':
      return { claimedBorderTier: 'Legendary' }
    case 'title_tag':
      return { claimedTitle: 'Comeback King' }
    case 'mode_token':
      return { claimedModeToken: true }
    case 'stat_spotlight':
      return { claimedSpotlight: 'Passing yds' }
    case 'trophy_case':
      return { trophies: [...player.trophies, { id: 'iron_will', name: 'Iron Will' }] }
    default:
      return {}
  }
}

/** Persists a claimed pack reward's effect fields on the player's own doc. */
export async function claimPackReward(player: Player, reward: PackRewardDef) {
  const effectFields = effectFieldsFor(reward, player)
  await updateDoc(doc(db, 'players', player.uid), {
    ...effectFields,
    lastPackClaimedWeek: getIsoWeekKey(),
  })
  notifyPackClaim(reward)
}
