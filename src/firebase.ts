import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// True once real Firebase project credentials are in .env (see .env.example).
// Until then, getAuth()/getFirestore() throw, so we skip calling them entirely
// and let App.tsx show setup instructions instead of crashing to a blank screen.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const app = initializeApp(firebaseConfig)
export const auth: Auth = isFirebaseConfigured ? getAuth(app) : (null as unknown as Auth)
export const db: Firestore = isFirebaseConfigured ? getFirestore(app) : (null as unknown as Firestore)
export const storage: FirebaseStorage = isFirebaseConfigured ? getStorage(app) : (null as unknown as FirebaseStorage)