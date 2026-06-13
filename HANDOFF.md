# Mission Team Handoff

Last updated: 2026-06-12

## Current Workspace State

Root folder: `/Users/nich/Projects/MISSION_TEAM`

This repo contains:

- Internal product PDF (gitignored) — original concept document.
- `MISSION_TEAM_IMPLEMENTATION_PLAN.md` - product/buildout plan.
- `docs/firebase-setup.md` - Firebase Console steps for Google Auth and Firestore.
- Firebase backend scaffold:
  - `firebase.json`
  - `.firebaserc`
  - `firestore.rules`
  - `firestore.indexes.json`
  - `storage.rules`
  - `functions/`
- Expo mobile app:
  - `mobile/`

Note: The monorepo tracks `mobile/` from the repository root (single git history).

## Firebase Project

Firebase project id: set in `mobile/.env` (`EXPO_PUBLIC_FIREBASE_PROJECT_ID`) and `.firebaserc` (local, gitignored — copy from `.firebaserc.example`).

Firebase config loads via `mobile/app.config.js` from environment variables.

You still need to add to `.env`:

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (recommended for iPhone + Expo Go)
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` (required for standalone Android APK)

See `docs/firebase-setup.md` for exact Console steps.

## What Is Built Now

The mobile app includes:

- Google sign-in screen (requires OAuth client IDs in `app.json`)
- Profile onboarding writing to `users/{uid}`
- Private contacts CRUD under `users/{uid}/contacts`
- Status filters: follow up, faithful, forgotten, backburner
- Local follow-up reminders every 2 days
- Missed reminder strike logic (3 strikes moves contact to forgotten)

Important files:

- `mobile/App.tsx` - app shell with auth provider and navigation
- `mobile/src/navigation/RootNavigator.tsx` - login, onboarding, and main flows
- `mobile/src/screens/` - login, onboarding, home, contacts
- `mobile/src/services/contacts.ts` - Firestore contact CRUD
- `mobile/src/services/contactReminders.ts` - reminder domain logic
- `mobile/src/config/firebase.ts` - Firebase client initialization

## Run The App (Expo Go)

The project targets **Expo SDK 54** so it works with the App Store / Play Store version of Expo Go.

Always start from the `mobile/` folder:

```bash
cd /Users/nich/Projects/MISSION_TEAM/mobile
npm install
npx expo start --clear
```

Then:

1. Make sure your phone and computer are on the same Wi-Fi.
2. Open **Expo Go** on your phone.
3. Scan the QR code from the terminal.
4. Allow notifications when prompted (needed for follow-up reminders).

Do **not** run `npx expo start` from the repo root. There is no root `package.json`.

## Your Next Steps

### Step 1: Finish Firebase Console setup (about 10 minutes)

Follow `docs/firebase-setup.md`:

1. Enable Google Authentication.
2. Create Firestore in production mode.
3. Copy the Web client ID (and iOS client ID if testing on iPhone).
4. Paste them into `mobile/app.json`.
5. Deploy Firestore rules:

```bash
cd /Users/nich/Projects/MISSION_TEAM
firebase deploy --only firestore:rules
```

### Step 2: Launch on your phone

```bash
cd /Users/nich/Projects/MISSION_TEAM/mobile
npx expo start --clear
```

Scan the QR code in Expo Go.

### Step 3: Walk through the prototype flow

1. Tap **Continue with Google** and sign in.
2. Complete onboarding (first name, birthday as `YYYY-MM-DD`, gender).
3. Open **My contacts** and add a test contact.
4. Confirm the contact appears in Firebase Console under `users/{uid}/contacts`.
5. Tap the contact and try **Mark followed up** or **Mark faithful**.

### Step 4: Verify reminders

- Allow notification permission when asked.
- New contacts schedule a local reminder 2 days out.
- Pull to refresh on the contacts list to process overdue reminders.

## Still Deferred

- Communities create/join
- Faith Mode and live location sharing
- Firebase Storage (profile photos)
- Cloud Functions deploy (server-side reminders and community roles)
- UI component library (RNE UI) until core flow is stable on device

## TypeScript Check

```bash
cd mobile
npx tsc --noEmit
```
