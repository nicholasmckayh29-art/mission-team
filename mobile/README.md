# Mission Team Mobile App

This is the Expo React Native app for Mission Team. It pairs with the Firebase backend in the repository root.

## Setup

```bash
cd mobile
npm install
npx expo start --clear
```

Scan the QR code with Expo Go on your phone. Do not run Expo from the repo root.

Before Google sign-in works, complete `../docs/firebase-setup.md`, copy `.env.example` to `.env`, and fill in your Firebase / OAuth values.

Use Expo Go from the App Store or Play Store (SDK 54). Use an EAS development build for standalone Android/iOS testing and native Google Sign-In.

## App Flow

1. Google sign-in
2. Profile onboarding (`users/{uid}`)
3. Home screen
4. Private contacts CRUD with status filters
5. Local follow-up reminders every 2 days

## Firebase Config

Copy `.env.example` to `.env` and fill in values from your Firebase project console.

The client SDK reads config via `app.config.js` → `src/config/firebase.ts`.

## Expo Features Included

- `expo-notifications` for local reminders and Expo push tokens.
- `expo-location` for approximate Faith Mode location.
- `react-native-maps` for map screens.
- `firebase` for Auth, Firestore, Functions, and Storage client access.

## Notification Plan

Use local notifications first for personal reminders:

- Contact follow-up reminders.
- Study reminders.
- Personal task reminders.

Use backend-triggered push notifications later for shared events:

- Community invites.
- Faith Mode alerts.
- Admin actions.
- Community challenges.

The helper functions live in `src/services/notifications.ts`.

