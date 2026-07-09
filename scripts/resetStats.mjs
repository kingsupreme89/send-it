/**
 * Reset all player stats to 0 and delete every game.
 * Uses Firebase CLI OAuth (must be logged in as a project owner).
 *
 * Usage: node scripts/resetStats.mjs
 */

import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { resolve } from 'node:path'

const PROJECT = 'send-it-d654a'
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`

const EMPTY_STATS = {
  wins: 0,
  losses: 0,
  passingYds: 0,
  rushingYds: 0,
  interceptions: 0,
  sacks: 0,
  interceptionTDs: 0,
  kickReturnTDs: 0,
  puntReturnTDs: 0,
  currentStreak: 0,
  bestStreak: 0,
}

const GAME_MODES = ['1v1_regular', '2v2_regular', '1v1_mut']

function loadAccessToken() {
  const path = resolve(homedir(), '.config/configstore/firebase-tools.json')
  const cfg = JSON.parse(readFileSync(path, 'utf8'))
  const token = cfg.tokens?.access_token
  if (!token) throw new Error('No Firebase CLI access token. Run: npx firebase login')
  if (cfg.tokens.expires_at && Date.now() > cfg.tokens.expires_at) {
    console.warn('⚠️  Token may be expired — if this fails, run: npx firebase login --reauth')
  }
  return token
}

function toFirestoreValue(value) {
  if (value === null) return { nullValue: null }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } }
  }
  if (typeof value === 'object') {
    const fields = {}
    for (const [k, v] of Object.entries(value)) fields[k] = toFirestoreValue(v)
    return { mapValue: { fields } }
  }
  throw new Error(`Unsupported value: ${value}`)
}

async function api(token, method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`)
  }
  return data
}

async function listCollection(token, name) {
  const docs = []
  let pageToken
  do {
    const q = pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : ''
    const data = await api(token, 'GET', `/${name}${q}`)
    docs.push(...(data.documents ?? []))
    pageToken = data.nextPageToken
  } while (pageToken)
  return docs
}

async function main() {
  const token = loadAccessToken()
  console.log('🔑  Using Firebase CLI credentials\n')

  // 1) Delete all games
  const games = await listCollection(token, 'games')
  console.log(`🎮  Games found: ${games.length}`)
  for (const g of games) {
    const id = g.name.split('/').pop()
    await api(token, 'DELETE', `/games/${id}`)
    console.log(`   🗑️  deleted game ${id}`)
  }

  // 2) Zero out every player doc (keep profile identity fields)
  const players = await listCollection(token, 'players')
  console.log(`\n👤  Players found: ${players.length}`)

  const statsByMode = {}
  for (const mode of GAME_MODES) {
    statsByMode[mode] = EMPTY_STATS
  }

  for (const p of players) {
    const id = p.name.split('/').pop()
    const displayName = p.fields?.displayName?.stringValue ?? id

    // PATCH only numeric / competitive fields
    const fields = {
      statsByMode: toFirestoreValue(statsByMode),
      teamUsage: toFirestoreValue({}),
      badges: toFirestoreValue([]),
    }

    const mask = ['statsByMode', 'teamUsage', 'badges']
      .map((f) => `updateMask.fieldPaths=${f}`)
      .join('&')

    await api(token, 'PATCH', `/players/${id}?${mask}`, { fields })
    console.log(`   ✅  ${displayName} → stats 0, badges cleared, team usage cleared`)
  }

  console.log('\n🏁  Reset complete. All games deleted; all player numbers are 0.\n')
}

main().catch((err) => {
  console.error('\n❌  Reset failed:', err.message)
  process.exit(1)
})
