# Mission Team — deployment notes

**Status (Jun 2026):** Prototype testing uses **local hosting** (`expo start --web` / Expo Go). **Firebase Hosting is paused** until web export + font delivery is stable.

---

## Prototype: run locally (current approach)

### Web (browser on your machine)

```bash
cd mobile
npx expo start --web
```

Open the URL shown in the terminal (usually `http://localhost:8081`).

### Phone (Expo Go)

```bash
cd mobile
npx expo start
```

Scan the QR code. Google sign-in uses the Web OAuth client; add `localhost` redirect URIs (see `docs/firebase-setup.md`).

### Share with a remote tester without Firebase Hosting

#### Option B — browser link via tunnel (recommended)

**Terminal 1** — keep this running:

```bash
cd mobile
npx expo start --web --port 8081
```

**Terminal 2** — pick one tunnel:

**ngrok** (stable; free account required once):

1. Sign up at [ngrok.com](https://dashboard.ngrok.com/signup)
2. Copy your authtoken from [dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Run once: `ngrok config add-authtoken YOUR_TOKEN`
4. Start tunnel: `npm run tunnel:ngrok` (from `mobile/`)

**localtunnel** (no signup; URL changes each run):

```bash
cd mobile
npm run tunnel:lt
```

Share the **https://** URL from terminal 2 (not `localhost:8081`).

**Before testers sign in**, add the tunnel hostname to [Firebase → Authentication → Authorized domains](https://console.firebase.google.com/project/your-firebase-project-id/authentication/settings) — e.g. `abc123.ngrok-free.app` or `fifty-teeth-smoke.loca.lt` (hostname only, no `https://`).

Add each tester on [OAuth test users](https://console.cloud.google.com/apis/credentials/consent) only — no app rebuild.

**localtunnel note:** First visit may show a “Click to continue” page — click through once.

#### Other options

- **Expo tunnel:** `npx expo start --tunnel` (Expo Go on their phone)
- **Same Wi‑Fi:** `npx expo start --lan` and share your LAN URL
- Do **not** rely on `your-firebase-project-id.web.app` for the prototype until web hosting is re-enabled

---

## What went wrong with Firebase Hosting (web only)

This does **not** apply to Android/iOS native builds.

| Issue | Cause | Affects Android? |
|-------|--------|------------------|
| Square icons | Ionicons are a **font file**, not PNGs. Browser had no icon font loaded. | **No** — fonts ship inside the APK |
| Wrong text font | Plus Jakarta loaded via JS after first paint on static web | **No** — `useFonts()` loads into the native runtime |
| Missing assets | `firebase.json` had `"**/node_modules/**"` in hosting `ignore`, which skipped `dist/assets/node_modules/...` (where Expo puts `.ttf` files) | **No** — no Firebase Hosting on Android |
| SPA rewrite | `"**" → index.html` served HTML instead of `.ttf` when assets were missing | **No** |

### Web hosting checklist (when we turn Firebase Hosting back on)

1. **Never** ignore `assets/node_modules/**` in hosting `ignore` — Expo web export stores fonts there.
2. Always run `npm run export:web` (includes `scripts/inject-web-fonts.mjs`) before deploy.
3. Confirm deploy uploads **~48 files**, not 4.
4. Verify a font URL returns `content-type: font/ttf`, not HTML:
   `https://…/assets/node_modules/.../Ionicons.*.ttf`
5. Keep `index.html` on `Cache-Control: no-cache` so testers get fresh shells.
6. Web sign-in: Firebase popup auth + authorized domains (not custom redirect URIs for the hosting URL).

---

## Android release (future) — different concerns

See **`docs/android-build.md`** for EAS Build steps, APK sharing, and Google Android OAuth setup.

The font/icon bugs above are **static web hosting** problems. An Android build bundles fonts and icons into the app binary.

### Android-specific checklist

| Item | Notes |
|------|--------|
| **Package name** | `org.missionteam.app` (`app.json` → `android.package`) |
| **Google Sign-In** | Create an **Android** OAuth client in Google Cloud with package name + **SHA-1** from your keystore (debug + release) |
| **Firebase Android app** | Register Android app in Firebase; download `google-services.json` if using native Firebase SDK features |
| **Fonts / icons** | `useFonts()` + `@expo/vector-icons` — no `inject-web-fonts.mjs`; that script is web-export only |
| **Build** | EAS Build or `expo run:android` — not `expo export --platform web` |
| **OAuth test users** | Required while Google OAuth app is in **Testing** mode — add emails in Google Cloud; no rebuild |
| **In-app allowlist** | None — any Google account that passes OAuth can use the app |

### Do not copy web hosting fixes to Android

- `scripts/inject-web-fonts.mjs` → web static export only
- `signInWithGoogleOnWeb()` / Firebase popup → web only; native uses `@react-native-google-signin/google-signin`
- `firebase.json` hosting headers/rewrites → irrelevant to Play Store builds

---

## Commands reference

```bash
# Local web (prototype)
cd mobile && npx expo start --web

# Firestore rules only (still used in prototype)
cd .. && npx firebase-tools deploy --only firestore:rules

# Web hosting (PAUSED — use checklist above before re-enabling)
cd mobile && npm run export:web
cd .. && npx firebase-tools deploy --only hosting
```
