# Mission Team Backend Prototype

This backend uses Firebase Auth, Firestore, Cloud Functions, Storage, and Expo push notifications.

## Setup

1. Create a Firebase project.
2. Update `.firebaserc` with the real project id.
3. From `functions/`, run `npm install`.
4. Run `npm run build`.
5. Run the emulator from the repository root:

```bash
firebase emulators:start
```

## Client Access Pattern

The Expo mobile app in `mobile/` should use Firestore SDK directly for private user-owned data:

- `users/{uid}`
- `users/{uid}/contacts/{contactId}`
- `users/{uid}/notifications/{notificationId}` read state
- `users/{uid}/pushTokens/{tokenId}`

The mobile app should use callable Cloud Functions for shared or privileged actions:

- `createUserProfile`
- `createCommunity`
- `joinCommunity`
- `inviteMember`
- `updateMemberRole`
- `removeMember`
- `activateFaithMode`
- `updateFaithLocation`
- `deactivateFaithMode`

## Expo Notification Flow

The mobile app uses `expo-notifications` to request permission and create an Expo push token. Store each token under:

```text
users/{uid}/pushTokens/{tokenId}
```

Use local Expo notifications first for personal contact reminders. Use Cloud Functions to send Expo push notifications for shared events like community invites and Faith Mode alerts.

## Privacy Defaults

- Personal contacts are never visible to community leaders.
- Faith Mode stores approximate coordinates only.
- Faith Mode is time-limited.
- New open-signup users can use private tools but cannot browse communities, people, or map presence until they join a community.
- Admin/community actions are server-controlled and audit logged.
