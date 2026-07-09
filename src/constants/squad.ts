/**
 * Closed roster of players for the squad.
 * Add a 4th (or more) name here, then re-run `node scripts/seedUsers.mjs`.
 */
export const SQUAD = ['PRINC3ofd3NITE', 'BlackonBothSides', 'KingSupreme'] as const

export type SquadMember = (typeof SQUAD)[number]

/** Derive a deterministic fake email for Firebase Email/Password auth. */
export function emailForUsername(name: string): string {
  return `${name.toLowerCase()}@madden.local`
}