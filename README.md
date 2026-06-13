# Mission Team

Mobile ministry app for contact follow-up, Bible study tracking, and small-group communities. Built with **Expo (React Native)**, **Firebase**, and **TypeScript**.

Portfolio snapshot — production Firebase credentials and internal docs are **not** in this repo. Clone and add your own `.env` (see setup below).

## Features

- Google sign-in (Firebase Auth)
- Contact pipeline: follow-up → faithful → backburner / forgotten
- Study status tracking for faithful contacts
- Communities with join codes, roles, and Firestore security rules
- Local follow-up reminders (Expo Notifications)
- Android APK builds via EAS; native Google Sign-In on standalone builds

## Stack

| Layer | Tech |
|-------|------|
| Mobile | Expo SDK 54, React Native, TypeScript |
| Backend | Firebase Auth, Firestore, Storage (optional), Cloud Functions (stub) |
| Build | EAS Build |
| Maps | react-native-maps |

## Quick start

```bash
git clone https://github.com/nicholasmckayh29-art/mission-team.git
cd mission-team/mobile
cp .env.example .env
# Fill .env from your Firebase / Google Cloud console (see docs/firebase-setup.md)

npm install
npx expo start
```

For Android APK builds, see [`docs/android-build.md`](docs/android-build.md).

## Project layout

```text
mobile/           Expo React Native app
functions/        Firebase Cloud Functions (optional)
firestore.rules   Firestore security rules
docs/             Setup, deployment, and cost notes
```

## Documentation

- [`docs/firebase-setup.md`](docs/firebase-setup.md) — Auth, Firestore, OAuth
- [`docs/android-build.md`](docs/android-build.md) — EAS APK for testers
- [`docs/financial-schema.md`](docs/financial-schema.md) — Apple / Firebase / Expo costs
- [`HANDOFF.md`](HANDOFF.md) — Prototype walkthrough

## Security note

Firebase client API keys in `.env` are restricted by **Firestore rules** and **OAuth** configuration. Never commit `.env`, service account JSON, or signing keystores.

## License

Private / portfolio use — contact the author for reuse.
