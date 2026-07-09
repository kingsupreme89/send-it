/**
 * Seed script — creates Firebase Email/Password auth users + Firestore Player docs
 * for every name in the SQUAD constant.
 *
 * Prerequisites:
 *   1. Enable "Email/Password" in Firebase Console → Authentication → Sign-in method
 *   2. Copy .env.example → .env and fill in your Firebase project config
 *   3. npm install (devDependencies include firebase)
 *
 * Usage:
 *   node scripts/seedUsers.mjs
 *
 * Re-run after adding a new name to src/constants/squad.ts — it will skip
 * users that already exist (auth create throws "email-already-in-use").
 */

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'

// ── Same config the app uses (read from .env via process.env) ──────────────
const firebaseConfig = {
  apiKey:        process.env.VITE_FIREBASE_API_KEY,
  authDomain:    process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:     process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:         process.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌  Missing Firebase env vars. Copy .env.example → .env and fill in values.')
  process.exit(1)
}

// ── Squad roster (mirror of src/constants/squad.ts) ───────────────────────
const SQUAD = ['PRINC3ofd3NITE', 'BlackonBothSides', 'KingSupreme']

const DEFAULT_PASSWORD = '1234'

const GAME_MODES = ['1v1_regular', '2v2_regular', '1v1_mut']

function emptyPlayerStats() {
  return {
    wins: 0, losses: 0,
    passingYds: 0, rushingYds: 0,
    interceptions: 0, sacks: 0,
    interceptionTDs: 0, kickReturnTDs: 0, puntReturnTDs: 0,
    currentStreak: 0, bestStreak: 0,
  }
}

function emailForUsername(name) {
  return `${name.toLowerCase()}@madden.local`
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db   = getFirestore(app)

  for (const name of SQUAD) {
    const email = emailForUsername(name)
    console.log(`\n👤  Seeding "${name}" (${email})…`)

    // 1. Create auth user
    let uid
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD)
      uid = cred.user.uid
      console.log(`   ✅  Auth user created (uid: ${uid})`)
      await signOut(auth)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log('   ⏭️  Auth user already exists — skipping auth creation')
        // We can't get the UID without signing in, so sign in briefly
        const cred = await signInWithEmailAndPassword(auth, email, DEFAULT_PASSWORD)
        uid = cred.user.uid
        await signOut(auth)
      } else {
        console.error('   ❌  Auth error:', err.message)
        continue
      }
    }

    // 2. Write Player doc (idempotent — overwrites if exists)
    const statsByMode = {}
    for (const mode of GAME_MODES) {
      statsByMode[mode] = emptyPlayerStats()
    }

    await setDoc(doc(db, 'players', uid), {
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
    console.log('   ✅  Player doc written')
  }

  console.log('\n🏁  Done! Each user can now sign in with password "1234" and will be prompted to change it.\n')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})