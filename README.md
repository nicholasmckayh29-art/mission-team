# Mission Team

Mobile app for outreach follow-up, Bible study tracking, and small-group communities.

Built with Expo (React Native), Firebase, and TypeScript.

## About

Mission Team supports a simple ministry workflow:

- Sign in with Google
- Maintain a private contact list with follow-up status
- Track study progress for contacts marked faithful
- Join or create communities with role-based access

Contact data is private to each user. Communities use Firestore security rules for membership and permissions.

## Features

- Google sign-in (Firebase Auth)
- Contact statuses: follow up, faithful, forgotten, backburner
- Study status for faithful contacts
- Communities with join codes and admin roles
- Local follow-up reminders (2-day cycle, strike logic)
- Android builds via EAS with native Google Sign-In

## Development

```bash
git clone https://github.com/nicholasmckayh29-art/mission-team.git
cd mission-team/mobile
cp .env.example .env
# Add Firebase and Google OAuth values (see docs/firebase-setup.md)

npm install
npx expo start
```

Android APK builds: [`docs/android-build.md`](docs/android-build.md)

## Repository layout

```text
mobile/           React Native app (Expo)
functions/        Firebase Cloud Functions
firestore.rules   Firestore security rules
docs/             Setup and deployment notes
```

## Documentation

- [`docs/firebase-setup.md`](docs/firebase-setup.md) — Firebase Auth, Firestore, OAuth
- [`docs/android-build.md`](docs/android-build.md) — EAS Android builds
- [`docs/android-emulator.md`](docs/android-emulator.md) — Emulator testing
- [`docs/deployment-notes.md`](docs/deployment-notes.md) — Web vs native deployment
- [`docs/financial-schema.md`](docs/financial-schema.md) — Infrastructure costs
- [`MISSION_TEAM_IMPLEMENTATION_PLAN.md`](MISSION_TEAM_IMPLEMENTATION_PLAN.md) — Product and technical plan

## Configuration

Runtime config lives in `mobile/.env` (not committed). Copy from `mobile/.env.example`.

Firebase CLI project id: copy `.firebaserc.example` to `.firebaserc`.
