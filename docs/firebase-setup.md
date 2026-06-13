# Firebase setup for Mission Team

Complete these steps once in the [Firebase Console](https://console.firebase.google.com/) before testing Google sign-in on your phone.

Project id: `your-firebase-project-id` (set in `.firebaserc` and `mobile/.env`)

## 1. Enable Google Authentication

1. Open **Authentication → Sign-in method**.
2. Enable **Google**.
3. Set a support email and save.
4. Copy the **Web client ID** shown in the Google provider settings.

Optional for a future **development build** (not Expo Go):

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **iOS** OAuth client with bundle ID **`org.missionteam.app`**.
3. Enter your **Apple Team ID** (10 characters from [Apple Developer → Membership](https://developer.apple.com/account)).
4. Leave **App Store ID** blank if the app is not published yet.
5. Copy the iOS client ID into `googleIosClientId` in `app.json`.

You do **not** need a separate iOS OAuth client for Expo Go. The app uses the Web client there.

## 1b. OAuth consent screen (required)

If Google shows **Access blocked: auth error**, your app is probably in Testing mode.

1. Open [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent).
2. Finish the app name, support email, and developer contact.
3. Open **Audience** (or **Test users** on older UI).
4. Click **Add users** and add the **exact Gmail address** you use to sign in.
5. Save and wait a minute, then try again.

Only emails listed as test users can sign in while the app is in **Testing** mode.

**Adding a tester (no app rebuild):**

1. Open [OAuth consent screen → Test users](https://console.cloud.google.com/apis/credentials/consent).
2. Click **Add users** and enter their **exact Google email**.
3. Save, wait ~1 minute, share the APK install link — they can sign in.

There is **no in-app email allowlist**. If Google accepts their account, Firebase sign-in succeeds and they can use the app.

**Example testers (add your own addresses in OAuth → Test users):**

| Email | Notes |
|-------|--------|
| `you@example.com` | Project owner |
| `tester@example.com` | Prototype tester |

When you publish the OAuth app to **Production**, Google’s test-user cap goes away — use that only when you are ready for broader access.

## 2. Add OAuth client IDs to the app

Edit `mobile/app.json` and add the IDs under `expo.extra.firebase`:

```json
"googleWebClientId": "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
"googleIosClientId": "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
```

`googleWebClientId` is required. `googleIosClientId` is recommended for iPhone testing in Expo Go.

## 3. Create Firestore

1. Open **Firestore Database**.
2. Click **Create database**.
3. Choose **Production mode** (security rules are already in `firestore.rules`).
4. Pick a region close to your users.

Deploy rules from the repo root when ready:

```bash
cd /Users/nich/Projects/MISSION_TEAM
firebase deploy --only firestore:rules
```

## 4. Firebase Hosting (paused — use local web for prototype)

> **Jun 2026:** We rolled back to **local hosting** for prototype testing. Firebase Hosting is configured but **not the supported tester path** until web font delivery is verified end-to-end. See [`docs/deployment-notes.md`](deployment-notes.md).

**Live URL (do not share with testers for now):** [https://your-firebase-project-id.web.app](https://your-firebase-project-id.web.app)

### Prototype: share via local dev instead

```bash
cd /Users/nich/Projects/MISSION_TEAM/mobile
npx expo start --web          # browser on your machine
npx expo start --tunnel       # Expo Go for remote testers
```

### When re-enabling Firebase Hosting

Read **`docs/deployment-notes.md`** first. Critical rules:

- Do not add `**/node_modules/**` to hosting `ignore` (Expo fonts live under `assets/node_modules/`).
- Always `npm run export:web` (includes font injection into `index.html`).
- Confirm deploy uploads ~48 files, not 4.

### One-time OAuth setup for hosting (when re-enabled)

Hosted web sign-in uses **Firebase popup auth** (no manual redirect URIs on the hosting URL).

1. Open [Firebase Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/your-firebase-project-id/authentication/settings).
2. Confirm these domains are listed (Hosting usually adds them automatically):
   - `your-firebase-project-id.web.app`
   - `your-firebase-project-id.firebaseapp.com`
3. Add prototype testers on the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) (see §1b).

For **local dev** (`localhost:8081`), keep redirect URIs on your [Web OAuth client](https://console.cloud.google.com/apis/credentials):

```text
http://localhost:8081
http://127.0.0.1:8081
```

### Build and deploy (when re-enabled)

From the repo root:

```bash
cd /Users/nich/Projects/MISSION_TEAM/mobile
npm run export:web

cd ..
npx firebase-tools deploy --only hosting
```

Send testers the install link. They sign in with **Continue with Google** (must be on OAuth test users — see §1b).

## Web testing (local dev — primary for prototype)

Google sign-in on a phone in Expo Go is blocked by OAuth redirect rules. Use the browser instead.

### Google Cloud Web client settings (local)

Open your [Web OAuth client](https://console.cloud.google.com/apis/credentials) and add:

**Authorized JavaScript origins**

```text
http://localhost:8081
http://127.0.0.1:8081
```

Hosted web (`your-firebase-project-id.web.app`) uses Firebase popup sign-in — no extra redirect URIs needed for the hosting URL.

Also add your Gmail as a **test user** on the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent).

### Run locally in the browser

```bash
cd /Users/nich/Projects/MISSION_TEAM/mobile
npx expo start --web
```

Or press **`w`** in an existing Expo terminal.

Then open **Continue with Google** and walk through onboarding and contacts.

## 5. Test checklist

1. Run the app from `mobile/`.
2. Sign in with Google.
3. Complete onboarding (first name, birthday, gender).
4. Add a contact and confirm it appears in Firestore under `users/{uid}/contacts`.
5. Allow notifications on your phone and confirm a follow-up reminder is scheduled.

## Common errors

| Symptom | Fix |
|---------|-----|
| `Add googleWebClientId to app.json` | Complete step 2 |
| `Google sign-in did not return an ID token` | Confirm Google provider is enabled and Web client ID is correct |
| Firestore permission denied | Create the database and deploy `firestore.rules` |
| `Access blocked: auth error` | Add your Gmail as a **test user** on OAuth consent screen; confirm iOS client bundle ID is `host.exp.Exponent` |
| `redirect_uri_mismatch` | Add hosting URLs and localhost (see §4) to the Web OAuth client |

## Deferred for now

- **Firebase Hosting for prototype testers** — use local web / Expo tunnel instead (`docs/deployment-notes.md`).
- Firebase Storage (profile photo cloud sync) requires linking a billing account in Google Cloud, even on the free tier. Profile photos currently save **locally on the device** (or in browser storage on web) until Storage is enabled.
- Cloud Functions (server-side reminders, communities) require billing upgrade.
- Push notifications beyond local reminders may require an Expo development build.
