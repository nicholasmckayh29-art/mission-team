/**
 * Expo config. Secrets load from mobile/.env (gitignored).
 * Copy .env.example → .env before running locally.
 */
function deriveIosUrlScheme(iosClientId) {
  if (!iosClientId) {
    return 'com.googleusercontent.apps.YOUR_IOS_CLIENT_ID';
  }

  const idPart = iosClientId.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${idPart}`;
}

function requireEnv(name) {
  return process.env[name]?.trim() ?? '';
}

export default {
  expo: {
    name: 'Mission Team',
    slug: 'mission-team',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'missionteam',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    backgroundColor: '#EEF3F8',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'org.missionteam.app',
    },
    android: {
      package: 'org.missionteam.app',
      versionCode: 3,
      adaptiveIcon: {
        backgroundColor: '#fafafa',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.READ_CONTACTS',
        'android.permission.WRITE_CONTACTS',
      ],
    },
    plugins: [
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: deriveIosUrlScheme(requireEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID')),
        },
      ],
      'expo-notifications',
      'expo-web-browser',
      'expo-font',
      [
        'expo-image-picker',
        {
          photosPermission:
            'Mission Team uses your photo library so you can set a profile picture.',
        },
      ],
      [
        'expo-contacts',
        {
          contactsPermission:
            'Mission Team lets you search and import contacts you choose for follow-up.',
        },
      ],
    ],
    extra: {
      firebase: {
        apiKey: requireEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
        authDomain: requireEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
        projectId: requireEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
        storageBucket: requireEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: requireEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
        appId: requireEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
        measurementId: requireEnv('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'),
        googleWebClientId: requireEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
        googleIosClientId: requireEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'),
        googleAndroidClientId: requireEnv('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'),
      },
      eas: {
        projectId: requireEnv('EAS_PROJECT_ID'),
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    owner: requireEnv('EXPO_OWNER') || undefined,
  },
};
