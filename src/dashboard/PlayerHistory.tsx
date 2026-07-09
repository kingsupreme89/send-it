import { PlayerProfile } from './PlayerProfile'

export function PlayerHistory({ currentUid }: { currentUid: string }) {
  return <PlayerProfile uid={currentUid} currentUid={currentUid} />
}
