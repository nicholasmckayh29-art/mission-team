# Mission Team — financial schema (upkeep & distribution)

**Purpose:** What the church organization pays to **run and ship** the app.  
**Important:** The app is **free to members**. There is no in-app billing, subscriptions, or member fees planned.

**Last updated:** June 2026 · Project: `your-firebase-project-id` · Stack: Expo + Firebase

---

## One-page summary (for church leadership)

| Who | What you pay | When | Typical cost |
|-----|----------------|------|--------------|
| **Apple** | Developer Program membership | **Every year** (if iPhone App Store / TestFlight) | **$99 USD / year** |
| **Google** | Play Console registration | **Once** (if Android Play Store) | **$25 USD one-time** |
| **Google Firebase** | Backend (auth, database, optional storage/functions) | **Monthly usage** (often **$0** at small scale) | **$0–$25+/mo** |
| **Expo (EAS)** | Cloud app **builds**, optional **OTA updates**, store submit | **Monthly** (often **$0** at small scale) | **$0–$19+/mo** |
| **Domain name** | Optional website (e.g. `missionteam.org`) | **Per year** | **~$12–$20/yr** |
| **GitHub** | Source code hosting | Usually free | **$0** |

**Prototype today (Android APK only):** Firebase Spark (free) + Expo Free builds ≈ **$0/month** recurring.  
**Full iOS + Android store release:** budget roughly **$125–$200 in year 1**, then **~$100–$150/year** after that (see scenarios below).

---

## What each service does (plain language)

### Apple — **$99 / year**

**You pay for:** Permission to distribute an iPhone app on the App Store and via **TestFlight** (beta testing).

**You do NOT pay Apple for:**
- Each user download (free apps have no per-download fee)
- Firebase or Expo
- Google sign-in

**Notes:**
- One account can publish **unlimited apps**.
- If membership lapses, the app can be removed from the store until renewed.
- Nonprofits, schools, and some government orgs may qualify for a **fee waiver** ([Apple enrollment](https://developer.apple.com/programs/enroll/)).
- Only needed when you move beyond “developer’s phone + sideload APK.”

---

### Google Play — **$25 one-time**

**You pay for:** A **Play Console** developer account to publish on the Google Play Store (including internal/closed testing tracks).

**You do NOT pay Google for:**
- Each Android install (free apps)
- Firebase (separate product, often free tier)
- OAuth / Google sign-in for your own app

**Alternative:** You can keep sharing **APK install links** (Expo internal builds) without Play Console — fine for a small trusted group, less polished for wider rollout.

---

### Firebase (Google Cloud) — **$0 to start, pay-as-you-go later**

**You pay for:** The live backend — who is signed in, contact/community data in Firestore, optional file storage, optional server jobs (Cloud Functions), optional web hosting.

**Mission Team uses today:**
| Product | Role | Prototype cost |
|---------|------|----------------|
| **Authentication** (Google sign-in) | Login | **Free** (email/Google providers) |
| **Cloud Firestore** | Contacts, profiles, communities | **Free tier** for small usage |
| **Cloud Storage** | Profile/community images in cloud | **Not enabled yet** (photos saved on device) |
| **Cloud Functions** | Server-side reminders, privileged actions | **Not required yet** |
| **Hosting** | Web version at `*.web.app` | **Paused** for prototype |
| **Analytics / Crashlytics** | Usage & crash reports | **Free** |

**Plans:**
- **Spark (free):** No credit card. Enough for early prototype **if** you stay within quotas and don’t need Storage/Functions.
- **Blaze (pay-as-you-go):** Requires a billing account. **Includes the same free quotas as Spark**, then charges only for usage **above** them. Needed for **Cloud Storage**, **Cloud Functions**, and higher limits.

**Firestore free tier (typical starting point):**
- 1 GiB stored data
- 50,000 reads / 20,000 writes / 20,000 deletes **per day**
- 10 GiB network egress per month  

For a **small church group** (tens of active users, modest contact lists), this often stays **$0/month** on Blaze if you enable billing only when needed and set **budget alerts**.

**When Firebase might cost money:**
- Many users syncing constantly (reads/writes add up)
- Cloud Storage for photos across devices
- Scheduled push/reminders via Cloud Functions
- Web hosting traffic if Firebase Hosting is re-enabled

**Control:** [Firebase Console → Usage and billing → Budget alerts](https://console.firebase.google.com/project/your-firebase-project-id/usage)

Pricing reference: [firebase.google.com/pricing](https://firebase.google.com/pricing)

---

### Expo (EAS) — **$0 to start; paid when you build/release more**

**Expo is not the app store.** It is the **build & delivery pipeline** for your React Native app.

**You pay Expo for:**

| EAS product | What it is | Why Mission Team uses it |
|-------------|------------|---------------------------|
| **EAS Build** | Compiles Android/iOS apps in the cloud (APK/AAB/IPA) | You already use this (`npm run build:android`) |
| **EAS Submit** | Upload builds to App Store / Play Store | Optional convenience for releases |
| **EAS Update** | Push **JavaScript-only** fixes without a full store rebuild | Optional later (bugfix speed) |
| **EAS Workflows / CI** | Automated pipelines | Optional |

**Free plan (what you use now):**
- **15 Android + 15 iOS cloud builds per month** (resets monthly)
- Low-priority build queue (can wait at peak times)
- **EAS Update:** 1,000 monthly active users (MAUs)
- App store submit tooling included

**When you might pay Expo:**
- More than ~30 cloud builds/month → **Starter ~$19/mo** (+ usage) for faster queue and **$45 build credit**
- Large user base needing OTA updates beyond free MAU limits
- Team wanting priority builds during heavy release weeks

**Typical build cost if you exceed credits:** about **$1–$4 per extra build** (Android/iOS, machine size).

**You do NOT need Expo subscription for:**
- Users running the installed app day-to-day
- Firebase login or data
- Google OAuth test users

Pricing reference: [expo.dev/pricing](https://expo.dev/pricing)

---

### Other (usually $0)

| Item | Cost | Notes |
|------|------|--------|
| **Google OAuth / Cloud Console** | $0 | Test users & OAuth clients for sign-in |
| **GitHub** (code repo) | $0 | Private repos on free tier |
| **Maps (react-native-maps)** | $0 at prototype | Uses Apple/Google maps on device; paid map APIs only if you add custom tiles/geocoding later |
| **Expo push notifications** | $0 | Local/scheduling via Expo; FCM included in Firebase free tier for remote push |

---

## Budget scenarios

### A — Prototype (now): Android APK testers only

| Item | Cost |
|------|------|
| Firebase Spark | $0 |
| Expo EAS Free (APK builds) | $0 |
| Google OAuth | $0 |
| **Monthly total** | **~$0** |
| **Year 1 total** | **~$0** |

*Limitation:* iPhone brothers need Expo Go, TestFlight, or a future App Store build.

---

### B — Internal beta: Android APK + iPhone TestFlight

| Item | Year 1 | Ongoing |
|------|--------|---------|
| Apple Developer Program | $99 | $99/year |
| Google Play (optional) | $0 or $25 one-time | $0 |
| Firebase (small group) | $0–$50 | $0–$25/mo if Blaze + Storage |
| Expo | $0–$228 ($19×12 if Starter) | $0–$19/mo |
| **Rough year 1** | **$100–$400** | **$100–$300/year** |

*Expo can stay **$0** if you stay within 15 iOS + 15 Android builds/month.*

---

### C — Final church v1.0: App Store + Play Store, ~50–150 active users

| Item | Estimate |
|------|----------|
| Apple Developer | **$99/year** |
| Google Play | **$25 one-time** (already paid if done once) |
| Firebase Blaze (Firestore + Storage + light Functions) | **$0–$25/month** with budget cap |
| Expo Free or Starter | **$0–$19/month** |
| Domain + privacy policy hosting (optional) | **~$15/year** |
| **Year 1 (all-in)** | **~$150–$500** |
| **Steady state (year 2+)** | **~$120–$400/year** |

*Assumes: free app, no in-app purchases (no Apple/Google commission on sales).*

---

### D — Growth: 500+ active users, cloud photos, server reminders

| Item | Estimate |
|------|----------|
| Firebase | **$25–$100+/month** (depends on reads, storage, functions) |
| Expo | **$19–$199/month** if frequent releases + OTA at scale |
| Apple + Google accounts | Same as above |
| **Review quarterly** | Set Firebase budget alert at **$50** and **$100** |

---

## What triggers a billing upgrade (decision tree)

```
Need iPhone TestFlight or App Store?
  └─ YES → Apple Developer $99/yr (required)

Need Play Store listing (not just APK link)?
  └─ YES → Google Play $25 once (required)

Need profile photos synced across devices?
  └─ YES → Firebase Blaze + Storage (usually still cheap at small scale)

Need server-scheduled reminders / admin-only server logic?
  └─ YES → Firebase Blaze + Cloud Functions

Building more than ~15 Android + 15 iOS apps per month in the cloud?
  └─ YES → Consider Expo Starter ($19/mo) or batch releases

Need hotfix JS updates without waiting for store review?
  └─ OPTIONAL → EAS Update (free up to 1k MAUs on Free plan)
```

---

## Recommended church operating model

1. **One organizational billing owner** (treasurer or designated brother) for Apple, Google Play, Firebase Blaze, and Expo — not personal cards long-term.
2. **Enable budget alerts** on Firebase before Blaze: e.g. notify at 50%, 90%, 100% of **$25/month** cap.
3. **No member pricing** — treat all costs as ministry overhead (aligned with implementation plan §9).
4. **Release cadence** — batch store releases (e.g. monthly) to stay on Expo Free tier longer.
5. **Nonprofit waiver** — if Mission Team qualifies as a church nonprofit, apply for [Apple fee waiver](https://developer.apple.com/support/enrollment/) before paying $99.

---

## Mission Team–specific checklist (final version)

| Capability | Service | Paid? |
|------------|---------|-------|
| Google sign-in | Firebase Auth + Google Cloud OAuth | No (test users while OAuth app in Testing) |
| Contact / community data | Firestore | Free tier → Blaze if needed |
| Android APK to testers | EAS Build (Free) | No (within monthly build quota) |
| iOS TestFlight / App Store | Apple + EAS Build iOS | **Apple $99/yr** |
| Play Store Android | Google Play + EAS | **$25 once** |
| Push notifications (future server-driven) | FCM + optional Functions | Blaze if using Functions |
| Profile photos in cloud (future) | Firebase Storage | Blaze |
| Web app hosting (future) | Firebase or Expo Hosting | Usually low / free tier |

---

## Links (verify pricing before budgeting)

- Apple Developer Program: [developer.apple.com/programs](https://developer.apple.com/programs/)
- Google Play Console: [play.google.com/console](https://play.google.com/console/)
- Firebase pricing: [firebase.google.com/pricing](https://firebase.google.com/pricing)
- Expo / EAS pricing: [expo.dev/pricing](https://expo.dev/pricing)
- Project Firebase console: [your-firebase-project-id](https://console.firebase.google.com/project/your-firebase-project-id/overview)
- Project Expo dashboard: [expo.dev — mission-team](https://expo.dev/accounts/YOUR_EXPO_ACCOUNT/projects/mission-team)

---

## Short talk-track for brothers

> “The app is free for everyone who uses it. The church pays the ‘utility bills’: Apple if we ship iPhone, Google once if we use the Play Store, and small cloud fees for login and data. Right now we’re on free tiers — about **zero dollars a month**. When we go to the App Store and turn on cloud photos and server reminders, expect roughly **one to four hundred dollars a year**, depending on how many brothers use it and how often we release updates. We’ll set spending caps so there are no surprises.”
