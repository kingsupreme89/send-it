/**
 * Seed script — creates Firebase Email/Password auth users + Firestore Player docs
 * for every name in the SQUAD constant.
 *
 * Prerequisites:
 *   1. Enable "Email/Password" in Firebase Console → Authentication → Sign-in method
 *   2. Copy .env.example → .env and fill in your Firebase project config
 *   3. npm install
 *
 * Usage:
 *   node scripts/seedUsers.mjs
 *
 * Re-run after adding a new name to src/constants/squad.ts — existing auth users
 * are left alone; player docs are created only if missing (stats are not wiped).
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

// ── Load .env from project root ────────────────────────────────────────────
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
try {
  for (const line of readFileSync(resolve(root, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
} catch {
  // .env optional if vars are already in the environment
}

// Firebase Auth requires ≥6 characters — "1234" is rejected as weak-password.
const DEFAULT_PASSWORD = '123456'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌  Missing Firebase env vars. Copy .env.example → .env and fill in values.')
  process.exit(1)
}

// Keep in sync with src/constants/squad.ts
const SQUAD = ['PRINC3ofd3NITE', 'BlackonBothSides', 'KingSupreme']

const GAME_MODES = ['1v1_regular', '2v2_regular', '1v1_mut']

function emptyPlayerStats() {
  return {
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
}

function emailForUsername(name) {
  return `${name.toLowerCase()}@madden.local`
}

async function main() {
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  for (const name of SQUAD) {
    const email = emailForUsername(name)
    console.log(`\n👤  Seeding "${name}" (${email})…`)

    let uid
    let justCreated = false
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD)
      uid = cred.user.uid
      justCreated = true
      console.log(`   ✅  Auth user created (uid: ${uid}) with default password`)
      // Stay signed in — Firestore rules require auth for player writes
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log('   ⏭️  Auth user already exists — signing in to get uid')
        try {
          const cred = await signInWithEmailAndPassword(auth, email, DEFAULT_PASSWORD)
          uid = cred.user.uid
          console.log(`   ✅  Signed in with default password (uid: ${uid})`)
        } catch (signErr) {
          console.error(
            `   ❌  Could not sign in with default password "${DEFAULT_PASSWORD}".`,
            'If this user already changed their password, set mustChangePassword manually in Firestore',
            `or reset the password in Firebase Console → Authentication.`,
            `\n      Detail: ${signErr.message}`,
          )
          continue
        }
      } else {
        console.error('   ❌  Auth error:', err.message)
        continue
      }
    }

    try {
      const playerRef = doc(db, 'players', uid)
      const existing = await getDoc(playerRef)

      if (existing.exists()) {
        // If we could sign in with the default password, force a change on next app login.
        // (Does not wipe stats / profile fields.)
        await setDoc(playerRef, { mustChangePassword: true }, { merge: true })
        console.log(
          justCreated
            ? '   ✅  Player doc exists — flagged mustChangePassword for first login'
            : '   ✅  Player doc exists — re-flagged mustChangePassword (still on default password)',
        )
      } else {
        const statsByMode = {}
        for (const mode of GAME_MODES) {
          statsByMode[mode] = emptyPlayerStats()
        }

        await setDoc(playerRef, {
          uid,
          displayName: name,
          photoURL: null,
          googleEmail: email,
          favoriteTeam: null,
          hometown: '',
          statsByMode,
          teamUsage: {},
          badges: [],
          mustChangePassword: true,
          createdAt: serverTimestamp(),
        })
        console.log('   ✅  Player doc written (mustChangePassword: true)')
      }
    } finally {
      await signOut(auth)
    }
  }

  console.log(`\n🏁  Done! First login password is "${DEFAULT_PASSWORD}" — app will force a password change.\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
