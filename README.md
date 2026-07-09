# Send It!

Squad Madden tracker — log games, leaderboards, head-to-head, trends, badges, and weekly recaps.

**Stack:** React + TypeScript + Vite · Tailwind CSS · Firebase (Auth, Firestore, Storage) · PWA

## Setup

```bash
cd "/Users/user/Claude/Projects/Madden Tracker"
npm install
cp .env.example .env   # fill in Firebase web app config
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Oxlint |
| `node scripts/seedUsers.mjs` | Seed squad auth users + player docs |

## Squad / auth

Players are a closed roster in `src/constants/squad.ts`. Sign-in is email/password with fake emails (`name@madden.local`).

1. Enable **Email/Password** in Firebase Auth.
2. Fill `.env` from the Firebase console.
3. Run `node scripts/seedUsers.mjs`.

**First login:** password is `123456` (Firebase requires at least 6 characters — `1234` is rejected). The app then forces a password change before entering the app.

## Deploy

Hosting is configured for the `dist` folder (`firebase.json`). After `npm run build`:

```bash
npx firebase deploy
```

Project id: see `.firebaserc` (`send-it-d654a`).

## Project layout

```
src/
  auth/          Sign-in gate, password change
  profile/       Player profile create / update
  games/         Log / edit games, reactions, clips
  dashboard/     Feed, leaderboard, H2H, trends, recap
  achievements/  Badges
  stories/       Recap copy + share images
  components/    Shared UI
  constants/     Squad roster, NFL teams
public/          Icons, logo, favicon
scripts/         One-off seed utilities
```
