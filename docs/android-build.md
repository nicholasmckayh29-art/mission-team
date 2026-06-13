# Android build — Mission Team

Build an installable **APK** for prototype testers via [EAS Build](https://expo.dev/eas). Fonts and icons are bundled in the app (no web hosting issues).

Package: `org.missionteam.app`

---

## One-time setup

### 1. Expo / EAS account

```bash
cd mobile
npm install -g eas-cli   # or use npx eas-cli
eas login
eas init                 # links this app to expo.dev
```

### 2. Firebase Android app (recommended)

1. [Firebase Console](https://console.firebase.google.com/) → **Add app** → **Android**
2. Package name: `org.missionteam.app`
3. Download `google-services.json` → save as `mobile/google-services.json` (gitignore if you prefer)
4. Copy the **Android app ID** if you later split Firebase config per platform

The app currently uses the Firebase **JS SDK** with config in `mobile/.env` via `app.config.js` — it runs without `google-services.json`, but registering Android in Firebase is good practice.

### 3. Google Sign-In — Android OAuth client

After your **first** EAS Android build, Expo creates a signing keystore. You need its **SHA-1**:

1. Open [expo.dev](https://expo.dev) → your project → **Credentials** → **Android**
2. Copy **SHA-1 fingerprint** (use the one for the build profile you ship, usually `preview`)

Re-check after a new keystore with:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
$ANDROID_HOME/build-tools/37.0.0/apksigner verify --print-certs /path/to/app.apk
```

Then in [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials):

1. Open (or create) **OAuth client ID** → **Android**
2. Package name: `org.missionteam.app`
3. SHA-1: paste from Expo credentials (must match the APK you ship)
4. Client ID → set `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` in `.env`

Also add the same SHA-1 in Firebase → Project settings → Your apps → Android (add Android app with package `org.missionteam.app` if missing).

Keep the existing **Web client ID** — Firebase still needs it for the ID token exchange.

5. Add testers on [OAuth consent screen → Test users](https://console.cloud.google.com/apis/credentials/consent) — **this is the only tester gate**; no app rebuild when you add someone.

**No APK rebuild** is required after fixing SHA-1 or adding OAuth test users — just try sign-in again.

---

## Build APK (internal testing)

```bash
cd mobile
npm run build:android
```

Or:

```bash
eas build --platform android --profile preview
```

- **preview** profile → **APK** (easy sideload / share link)
- Build runs on Expo servers (~10–20 min)
- When done, download the APK from the link in the terminal or [expo.dev](https://expo.dev)

Send testers the **install page** from your EAS build output (`eas build --platform android`).

They may need to allow “Install unknown apps” on Android.

### If testers “can’t open” the link

1. **Android phone only** — won’t work on iPhone or laptop.
2. **Open in Chrome** — from WhatsApp/iMessage: long-press link → **Open in Chrome**.
3. **Expo login** — Expo project settings → turn **on** “Unauthenticated access to internal builds”.
4. **Easier:** You download the APK from the build page → upload to **Google Drive** → share that link.

---

## Play Store (later)

```bash
npm run build:android:prod
```

Uses **AAB** (`app-bundle`) for Google Play. Requires Play Console setup, privacy policy, etc.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Link won’t open / nothing installs | Android + Chrome only; enable unauthenticated internal builds; or share APK via Google Drive |
| “App not installed” | Settings → allow Chrome/Files to install unknown apps; uninstall old Mission Team first |
| Google sign-in fails on APK | Use native Google Sign-In (rebuild after `@react-native-google-signin`); add Android OAuth client with correct **SHA-1** |
| `Access blocked: authorization error` on APK | Old builds used browser OAuth (`expo-auth-session`) — rebuild with native Google Sign-In; also verify SHA-1 + OAuth test users |
| `DEVELOPER_ERROR` on sign-in | SHA-1 / package name mismatch on Android OAuth client |
| Access blocked (Google) | Add email as OAuth **test user** (no rebuild) |

---

## What is different from web?

- No Firebase Hosting, tunnels, or `inject-web-fonts.mjs`
- Native `useFonts()` + Ionicons in the APK
- Google sign-in uses **expo-auth-session** (not Firebase popup)
