# Android emulator on Mac (Mission Team)

## 1. Install Android Studio

If not installed yet:

```bash
brew install --cask android-studio
```

Or download from [developer.android.com/studio](https://developer.android.com/studio).

Open **Android Studio** and complete the first-run wizard (install **Android SDK**, **SDK Platform**, **Android Emulator**).

---

## 2. Create a virtual device

1. Android Studio → **More Actions** → **Virtual Device Manager** (or **Tools → Device Manager**)
2. **Create Device**
3. Phone: **Pixel 7** (or any phone)
4. System image: **API 34** or **35** with **Google Play** (needed for Google sign-in testing)
5. Finish → click **▶** to start the emulator

---

## 3. Shell environment (one time)

Add to `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

Then:

```bash
source ~/.zshrc
```

Verify:

```bash
adb devices
```

You should see an emulator listed as `device`.

---

## 4. Run Mission Team on the emulator

**Option A — Expo Go (fastest for UI preview)**

1. Start the emulator (Android Studio Device Manager ▶)
2. On the emulator, open **Play Store** → install **Expo Go**
3. In the project:

```bash
cd mobile
npx expo start
```

Press **`a`** to open in the Android emulator, or scan the QR in Expo Go.

**Option B — Native dev build (closer to production APK)**

Requires a completed EAS or local native build:

```bash
cd mobile
npx expo run:android
```

First run generates the `android/` folder and takes several minutes.

---

## 5. Google sign-in on emulator

- **Expo Go:** uses the Web OAuth client; add `exp://` / Expo redirect URIs if sign-in fails (see `docs/firebase-setup.md`).
- Native `@react-native-google-signin/google-signin` (see `docs/android-build.md`).

Test accounts must be on Google OAuth **test users** only — there is no in-app allowlist.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `adb: command not found` | Set `ANDROID_HOME` and PATH (step 3) |
| No devices | Start emulator from Device Manager first |
| Expo `a` does nothing | Run `adb devices`; restart adb: `adb kill-server && adb start-server` |
| Emulator slow | Use arm64 image on Apple Silicon; enable hardware acceleration in AVD settings |
| Play Store missing | Recreate AVD with a **Google Play** system image |
