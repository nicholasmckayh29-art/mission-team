# Mission Team App Implementation Plan

Prepared from `MISSION TEAM APP (1).pdf` on 2026-06-12.

## 1. Product Summary

Mission Team is a mobile-first faith outreach coordination app for an internal church organization. It is not intended to be a public consumer app or a paid member-facing service. The primary users are trusted brothers/members in the church who need a practical tool for outreach, follow-up, studies, and local ministry coordination.

The app helps users:

- Sign in with Google and maintain a basic profile.
- Add and manage friends/contacts.
- Track follow-up status with timers and color-coded states.
- Track studies/appointments with progress states.
- Join, create, and manage communities.
- Temporarily broadcast "Faith Mode" availability and live location to trusted community members.
- Receive reminders, community challenges, invites, and faith-sharing alerts.
- Access a toolkit of guides, images, tips, and community knowledge.

The riskiest features are live location sharing, community permissions, contact privacy, notification fatigue, and complex future community operations like merge, adopt, split, and restricted duplicate. Even though the app is internal, these risks still matter because the app will store sensitive relationships, contact notes, community membership, and temporary location data.

Institutional assumptions:

- The church organization pays any required cloud, app store, or developer infrastructure costs.
- End users should not pay to use the app.
- Early access should be limited to a small trusted group before broader church rollout.
- The first prototype should prioritize usefulness over commercial polish.

## 2. Recommended Prototype Stack

Use a mobile-first stack that can ship quickly without committing the organization to production infrastructure too early.

| Layer | Prototype Choice | Why |
|---|---|---|
| App | Expo React Native | Fast iOS/Android development, easy local testing, supports notifications, maps, location, and OTA updates. |
| Language | TypeScript | Safer data modeling and faster refactors. |
| Backend | Firebase | Google Auth, Firestore, Cloud Functions, Storage, FCM, Analytics, Crashlytics, and security rules in one ecosystem. |
| Auth | Firebase Authentication with Google provider | Directly matches the concept document. |
| Database | Firestore | Real-time listeners work well for contacts, communities, invites, and live map presence. |
| Server logic | Firebase Cloud Functions | Handles timers, notifications, community role changes, admin handshakes, and cleanup jobs. |
| Push | Expo Notifications first; Firebase stores push tokens and Cloud Functions trigger sends | Best fit for the Expo prototype. FCM/OneSignal can be revisited later if notification needs grow. |
| Maps | Expo Location + react-native-maps using Apple/Google maps for prototype | Use Expo location APIs and native maps instead of recreating map behavior. |
| Images | Firebase Storage | Profile pics, community images, toolkit images. |
| Analytics | Firebase Analytics + Crashlytics | Free baseline telemetry and crash reporting. |
| Admin tools | Firebase console first; custom web admin later | Avoids building an admin panel before workflows are proven. |

Alternative production stack: Supabase + Postgres + PostGIS + Edge Functions + Expo. This gives stronger relational modeling for communities and permissions, but Firebase is faster for the prototype because auth, push, analytics, functions, and mobile SDKs are tightly integrated.

## 3. Prototype Scope

Build the prototype around the smallest internal ministry loop that proves the app is useful:

1. Google login and profile onboarding.
2. Home screen with modules and notification feed.
3. Add/manage contacts with follow-up states.
4. Reminder timer system.
5. Studies list tied to faithful contacts.
6. Basic communities: create, join by invite/code, members, roles.
7. Faith Mode with explicit safety modal, timed location sharing, and map pins for trusted community members.
8. Toolkit static content.

Defer advanced community actions:

- Merge communities.
- Adopt communities.
- Split communities.
- Restricted duplicate.
- Community-level reports beyond simple counts.
- In-app chat.
- SMS invites.
- AI-generated content.
- Any billing, monetization, or member payment logic.

## 4. Core Data Model

Use Firestore collections with security rules. Keep personal contacts private by default. Share aggregated counts only when needed.

### users/{userId}

Fields:

- `displayName`
- `firstName`
- `email`
- `birthday`
- `gender`
- `photoURL`
- `createdAt`
- `updatedAt`
- `lastActiveAt`
- `notificationSettings`
- `faithModeStatus`: `off | pending | active`

Implementation:

- Create this document after Google auth.
- Ask for birthday/gender after Google login because Google may not provide them.
- Never expose email/birthday/gender to other users except where explicitly required by community restrictions.

### users/{userId}/contacts/{contactId}

Fields:

- `name`
- `phone`
- `email`
- `notes`
- `status`: `follow_up | forgotten | faithful | backburner`
- `studyStatus`: `none | progressing | paused | stopped | finished`
- `strikeCount`
- `lastInteractionAt`
- `nextReminderAt`
- `createdAt`
- `updatedAt`

Implementation:

- New contacts start as `follow_up`.
- Every 2 days, remind the user.
- After 3 missed reminders or 6 days, turn `follow_up` into `forgotten`.
- If friend wants to connect/study, set `faithful`.
- If friend does not want to connect, set `backburner`.
- Use local notifications for personal reminders where possible and Cloud Functions for server-backed reminders.

### communities/{communityId}

Fields:

- `name`
- `description`
- `imageUrl`
- `createdBy`
- `communityCode`
- `restrictions`: `{ gender?: string, minimumAge?: number }`
- `memberCount`
- `createdAt`
- `updatedAt`

Subcollections:

- `members/{userId}`: role and status.
- `invites/{inviteId}`: invite lifecycle.
- `joinRequests/{requestId}`: optional moderation.
- `events/{eventId}`: future.

Member fields:

- `role`: `member | admin | super_admin`
- `status`: `active | invited | removed`
- `joinedAt`
- `invitedBy`

Implementation:

- Community creator becomes `super_admin`.
- Admins can invite/remove members and assign admins.
- Only super admins can initiate advanced actions later.
- Enforce all role logic in Cloud Functions and Firestore rules.

### faithPresence/{presenceId}

Fields:

- `userId`
- `communityIds`
- `lat`
- `lng`
- `geohash`
- `accuracy`
- `startedAt`
- `expiresAt`
- `lastUpdatedAt`
- `status`: `active | expired | cancelled`

Implementation:

- Presence expires automatically after a short TTL, for example 60 to 120 minutes.
- Do not store exact home-like recurring locations forever.
- Delete or anonymize old presence records.
- Only active members of selected communities can read active presence.
- Require warning acceptance every time Faith Mode is turned on.

### notifications/{notificationId}

Either top-level user-targeted docs or `users/{userId}/notifications`.

Fields:

- `type`: `follow_up | invite | challenge | faith_alert | admin_request`
- `title`
- `body`
- `targetUserId`
- `relatedEntity`
- `readAt`
- `createdAt`

Implementation:

- Store in-app notification records.
- Send push notification when appropriate.
- Rate-limit faith-sharing alerts and community challenges.

## 5. Screen-by-Screen Implementation

### Login/Register

Features:

- Google sign-in.
- Profile completion form for name, birthday, gender, profile picture.

Implementation steps:

1. Configure Firebase project and Google auth.
2. Add Expo auth session or Firebase Google provider.
3. On first login, create `users/{uid}`.
4. Show onboarding if required fields are missing.
5. Upload profile picture to Firebase Storage if changed.

Shortcoming:

- Google may not provide birthday/gender; app must ask for them.
- Birthday/gender are sensitive. Store only what is required and explain why.

### Home Screen

Features:

- Head banner with profile name/image.
- Add new contact button.
- Faith Mode toggle.
- Press-hold for live Faith-Sharing Map.
- Module cards/tabs: My Friends, My Studies, My Communities, My Toolkit.
- Notifications: follow-up reminders, community invites, challenges, faith-sharing alerts.

Implementation steps:

1. Build a tab navigator with Home plus module routes.
2. Query latest notifications from `users/{uid}/notifications`.
3. Add quick action button for new contact.
4. Add Faith Mode toggle with safety modal.
5. Add long-press gesture to navigate to map view.

Shortcoming:

- Too much functionality on home can become noisy. Prototype should keep the screen focused on the next action: follow-up, accept invite, or start Faith Mode.

### Faith Mode

Features:

- Requires device location permission.
- Shows safety warning before activation.
- Sends notification to community members.
- Posts message to community feed later if chat/feed is added.
- Places user pin on community live map.
- Removes user from map when turned off.

Implementation steps:

1. Request foreground location permission.
2. Show warning modal exactly before activation.
3. Ask user which communities can see this session.
4. Create `faithPresence` record with TTL.
5. Start foreground location updates only while active.
6. Update location at a controlled interval, for example every 30 to 60 seconds or significant movement.
7. Send push alert to selected community members.
8. Turn off on explicit toggle, app restart timeout, or expiration.

Safety requirements:

- Never activate from a silent background toggle.
- Always show who can see the user's location.
- Make the session time-limited.
- Include "Stop Sharing" one tap away.
- Consider a "hide exact location" mode that fuzzes coordinates to a block/neighborhood radius.

Shortcoming:

- Live location is the highest privacy and safety risk. The prototype should start with small trusted groups and time-boxed sessions only.

### Friends / Contacts

Features:

- Add new contact popup.
- List contacts.
- Tabs: all, follow-up/yellow, faithful/green, forgotten/orange, backburner/red.
- Sort alphabetically or most recent.
- Notes and reminders.

Implementation steps:

1. Build contact CRUD screens.
2. Store contacts under the user document to keep them private.
3. Add status filter tabs.
4. Add sort controls.
5. Add notes field and last interaction field.
6. Add swipe/press actions: mark contacted, mark faithful, mark backburner, delete.

Shortcoming:

- Contact phone numbers are sensitive. Do not expose user contacts to communities without explicit opt-in. Avoid uploading address book contacts in prototype.

### Contact Follow-Up System

Features:

- Newly saved contact starts yellow/follow-up.
- Reminder every 2 days.
- After 3 strikes / 6 days, contact turns orange/forgotten.
- User can mark whether friend wants to connect/study.
- Friend wants to connect -> green/faithful.
- Friend does not want to connect -> red/backburner.

Implementation steps:

1. Add `nextReminderAt` and `strikeCount`.
2. Use a scheduled Cloud Function to scan due reminders.
3. Create notification records and push messages.
4. When user opens a reminder, provide actions:
   - Mark followed up.
   - Snooze.
   - Mark faithful.
   - Move to backburner.
5. Increment strike count when due reminders are missed.
6. Change status to `forgotten` after threshold.

Shortcoming:

- "Convicting message" wording could feel harsh in practice. Use encouraging, user-configurable reminder copy.

### Studies / Appointments

Features:

- Shows faithful friends.
- Default status is progressing.
- Statuses: progressing, paused, stopped/abandoned, finished.
- Press-hold to change status.
- Press-hold to delete or move to backburner.

Implementation steps:

1. Query contacts where `status == faithful`.
2. Display study status chips.
3. Add status change sheet.
4. Add optional appointment date and notes.
5. Add archive behavior rather than destructive delete.

Shortcoming:

- The PDF blends "friend status" and "study status." Keep these as separate fields so a faithful friend can have a paused study without losing friend status.

### Communities

Features:

- Display all communities the user belongs to.
- Join community by name, ID, or map search.
- Create community with image, description, restrictions, minimum age.
- Manage communities.

Implementation steps:

1. Create community form.
2. Generate human-readable community code.
3. Add creator as `super_admin`.
4. Add join by code.
5. Add invite by user search or phone/email later.
6. Add role-based member list.
7. Add simple community detail screen.

Shortcoming:

- Searching by map requires defining whether communities have discoverable locations. For prototype, use join code first. Add location-based discovery only after privacy rules are clear.

### Manage Communities

Features:

- Edit name and description.
- Remove members.
- Invite members.
- Assign admins.
- Super admin rights.
- Admin rights.
- Summary report.

Implementation steps:

1. Build role guards in UI.
2. Enforce role guards in Cloud Functions and security rules.
3. Use invite records for role offers and member invites.
4. Add summary report as an aggregate count:
   - members count
   - active Faith Mode users
   - total faithful contacts if users explicitly share aggregate counts
5. Add audit log for admin actions.

Shortcoming:

- "Community has altogether X green contacts" requires access to private contacts. The safer version is opt-in aggregated reporting where users choose whether their counts contribute to community totals.

### Advanced Community Actions

Features from concept:

- Merge: unites two communities after admin handshake.
- Adopt: one community becomes overseer/parent of another.
- Split: separates members into sub-communities.
- Restricted duplicate: creates a filtered copy based on restrictions.

Implementation steps for later:

1. Model each action as an `adminActions/{actionId}` state machine.
2. Required states: `draft`, `requested`, `accepted`, `admin_selection`, `confirmed`, `executed`, `cancelled`.
3. Require both communities' super admins to accept.
4. Require both to agree on final super admin where needed.
5. Validate restrictions before merge.
6. Execute action in a transaction or idempotent Cloud Function.
7. Write audit log and notify affected members.

Shortcoming:

- These operations are complex and can damage trust if built early. They require strong audit logs, undo strategy, member consent rules, and careful data migration. Defer until basic communities are stable.

### Toolkit

Features:

- First Principles Bible study guides.
- Helpful images.
- Outreach playbook.
- Psychology tips from community/family.

Implementation steps:

1. Start as static curated content bundled in the app.
2. Add Firebase-hosted content later.
3. Allow community admins to submit tips later.
4. Review all user-submitted toolkit content before it becomes visible to the broader church group.

Shortcoming:

- User-generated advice can become inconsistent or sensitive. Keep prototype content curated.

## 6. Notifications Plan

Notification types:

- Follow-up reminders.
- Community invites.
- Community challenges.
- Faith-sharing alerts.
- Admin requests.

Implementation:

1. Store device push tokens under `users/{uid}/pushTokens`.
2. Use FCM/APNs through Expo Notifications or native Firebase Messaging.
3. Store every important notification as an in-app record.
4. Add notification preferences:
   - faith alerts
   - follow-up reminders
   - community invites
   - challenges
5. Add quiet hours.
6. Rate-limit community-wide alerts.

Prototype shortcut:

- Use Expo Notifications locally and Firebase Functions for server-triggered pushes.

## 7. Security and Privacy Rules

Non-negotiables:

- Contacts are private to the owning user.
- Location is shared only during active Faith Mode.
- Faith Mode requires explicit acceptance every time.
- Community membership controls access to community data.
- Role-changing actions must run through Cloud Functions.
- Admin actions must be audited.
- Old presence records must expire or be deleted.

Implementation:

1. Write Firestore rules before building screens that expose data.
2. Add unit tests for security rules.
3. Use Cloud Functions for:
   - role changes
   - invites
   - advanced community actions
   - scheduled reminders
   - presence cleanup
4. Use Firebase App Check before internal beta.

## 8. Free Prototype Resources

| Need | Free/Low-Cost Resource |
|---|---|
| App framework | Expo, React Native, TypeScript |
| Backend | Firebase Spark plan, then Blaze only when Cloud Functions or larger quotas are required |
| Auth | Firebase Google Auth |
| Database | Firestore free tier |
| Push | Expo Notifications, with Firebase storing tokens |
| Maps | react-native-maps with native Apple/Google map rendering for prototype |
| Crash reporting | Firebase Crashlytics |
| Analytics | Firebase Analytics |
| Design | Figma free tier, Canva free tier |
| Project management | GitHub Projects, Linear free tier, or Notion free tier |
| Repo and CI | GitHub free tier |
| Testing | Jest, React Native Testing Library, Detox later |
| Icons | Lucide, Expo vector icons |
| Static content | Markdown/JSON bundled with app |

Prototype principle:

- Use free tiers and local development tools until the main deliverables are proven useful to the brothers using the app.
- Do not introduce member billing, paid plans, or any user-facing subscription logic.
- Treat all future costs as organizational operating overhead, not product revenue planning.

## 9. Future Organizational Overhead

This app is not planned as a paid service, and there should be no member-facing pricing model. The items below are only future infrastructure and distribution categories the church organization may need to cover as usage grows.

| Service Category | Prototype Position | When It Becomes Needed | Notes |
|---|---|---|---|
| Apple developer account | Defer unless needed for TestFlight | Real iOS TestFlight/App Store distribution | Required for normal iOS distribution outside local development. |
| Google Play account | Defer unless needed for internal Android testing through Play | Android Play Store/internal testing distribution | Required for normal Android Play distribution. |
| Firebase free tier | Use first | Early prototype | Best fit for validating the main deliverables. |
| Firebase paid billing | Defer until needed | Scheduled Cloud Functions, higher quotas, production backend | Enable with strict budget alerts. |
| Web hosting | Defer | Internal landing page or web admin | Not required for the mobile prototype. |
| Advanced notification service | Defer | Complex journeys, segmentation, or non-technical notification management | FCM is enough for prototype. |
| Map API provider | Defer | Polished map UX, advanced styling, geocoding/search | Native map rendering may be enough for the prototype. |
| SMS provider | Avoid in prototype | SMS invites or phone verification | Push/email/invite codes are cheaper and simpler. |
| AI API provider | Avoid in prototype | AI-generated tips, summaries, coaching, moderation | Not needed until the core workflow is validated. |

Internal prototype recommendation:

- Phase 1: Firebase free tier + Expo + GitHub + Figma/Canva free resources.
- Phase 2: Enable Firebase Blaze only when scheduled Cloud Functions, production push workflows, or larger quotas are required.
- Internal beta: Pay Apple Developer and Google Play fees only when distributing through TestFlight, internal testing, or app stores becomes necessary.
- Full church rollout: Add Mapbox/Google Maps paid APIs only if native map rendering is insufficient.

**Detailed budget scenarios:** see [`docs/financial-schema.md`](financial-schema.md).

## 10. Suggested MVP Milestones

### Milestone 0: Product Decisions

Duration: 2-3 days.

Deliverables:

- Final MVP scope.
- Privacy policy draft.
- Faith Mode safety rules.
- Data model confirmed.
- Wireframes for core screens.

Implementation checklist:

- Define exact contact status transitions.
- Define whether communities can see any contact data.
- Define Faith Mode TTL and audience selection.
- Define community restrictions and enforcement rules.

### Milestone 1: App Foundation

Duration: 3-5 days.

Deliverables:

- Expo TypeScript app.
- Navigation shell.
- Firebase project.
- Google auth.
- Profile onboarding.
- Basic design system.

Implementation checklist:

- Create app with Expo.
- Add Firebase config.
- Add auth state provider.
- Add tab navigation.
- Add reusable components: buttons, lists, status chips, modal sheets.
- Add environment config.

### Milestone 2: Contacts and Follow-Up

Duration: 1-2 weeks.

Deliverables:

- Add/edit/delete contacts.
- Status tabs.
- Sorting.
- Notes.
- Follow-up timer fields.
- Local reminders.

Implementation checklist:

- Create `contacts` subcollection.
- Implement contact form validation.
- Add contact list filters.
- Add status transitions.
- Add local notification scheduling.
- Add tests for transition logic.

### Milestone 3: Studies

Duration: 3-5 days.

Deliverables:

- Faithful contacts list.
- Study statuses.
- Status change actions.
- Study notes.

Implementation checklist:

- Reuse contact records.
- Add `studyStatus`.
- Add status update action sheet.
- Add appointment date later if needed.

### Milestone 4: Communities

Duration: 1-2 weeks.

Deliverables:

- Create community.
- Join by code.
- Member list.
- Roles.
- Invites.
- Basic manage screen.

Implementation checklist:

- Create `communities` collection.
- Add membership subcollection.
- Add Cloud Function for create/join/invite.
- Add security rules for member-only read.
- Add admin-only write operations.
- Add audit log.

### Milestone 5: Faith Mode and Live Map

Duration: 1-2 weeks.

Deliverables:

- Location permission flow.
- Safety modal.
- Audience selection.
- Live presence record.
- Map pins.
- Stop sharing.
- Presence expiration.

Implementation checklist:

- Add Expo Location.
- Add map screen.
- Add `faithPresence` collection.
- Add TTL cleanup function.
- Add Firestore geohash or bounding query support.
- Add push alert when user activates.
- Add safety tests and permission edge cases.

### Milestone 6: Notifications

Duration: 3-7 days.

Deliverables:

- Push token registration.
- In-app notification center.
- Follow-up reminder pushes.
- Invite pushes.
- Faith Mode alert pushes.
- Notification settings.

Implementation checklist:

- Add Expo Notifications.
- Store push tokens.
- Add send notification Cloud Function.
- Add scheduled function for reminders.
- Add rate limits.

### Milestone 7: Toolkit

Duration: 2-4 days.

Deliverables:

- Static toolkit sections.
- First Principles links/content.
- Outreach playbook.
- Illustrations.
- Tips.

Implementation checklist:

- Model content as local JSON/Markdown.
- Build section list and detail screens.
- Add remote content later.

### Milestone 8: Hardening and Beta

Duration: 1-2 weeks.

Deliverables:

- Security rules tests.
- Crash reporting.
- Analytics events.
- Privacy policy.
- TestFlight/internal Android build.
- Beta feedback loop.

Implementation checklist:

- Add Firebase emulator tests.
- Add budget alerts.
- Add App Check.
- Add delete account flow.
- Add data export/delete process.
- Add beta onboarding.

## 11. Engineering Backlog

Priority 0:

- Auth and profile onboarding.
- Private contacts.
- Follow-up timer.
- Community create/join.
- Faith Mode safety modal.
- Time-limited live location.
- Notification preferences.

Priority 1:

- Study tracking.
- Admin role management.
- Community invites.
- In-app notifications.
- Toolkit content.
- Audit logs.

Priority 2:

- Community reports.
- Community challenges.
- Community feed/chat.
- Map-based community discovery.
- SMS invites.
- Advanced admin handshakes.

Priority 3:

- Merge/adopt/split.
- Restricted duplicate.
- AI-assisted toolkit/tips.
- Web admin dashboard.
- Optional institution-only admin tools.

## 12. Implementation Notes for the Engineer

Project structure:

```text
src/
  app/
    navigation/
    providers/
  features/
    auth/
    profile/
    home/
    contacts/
    studies/
    communities/
    faith-mode/
    notifications/
    toolkit/
  services/
    firebase/
    location/
    notifications/
  shared/
    components/
    hooks/
    theme/
    utils/
functions/
  src/
    reminders.ts
    communities.ts
    faithPresence.ts
    notifications.ts
firestore.rules
storage.rules
```

Recommended coding approach:

1. Build pure TypeScript domain functions for status transitions.
2. Unit test those functions outside React Native.
3. Keep Firestore access behind service modules.
4. Use optimistic UI sparingly for admin actions.
5. Treat Cloud Functions as the authority for role changes and cross-user writes.
6. Build with Firebase Emulator Suite before using production data.

Critical tests:

- A user cannot read another user's contacts.
- A non-member cannot read community members.
- A member cannot assign admins.
- An admin cannot assign super admin unless allowed.
- Faith presence is readable only by selected communities.
- Expired faith presence is not shown.
- Missed follow-up reminders correctly move contacts to forgotten.

## 13. Known Shortcomings and Product Risks

1. Live location can create real-world safety risks.
   Mitigation: opt-in every session, limited audience, TTL, stop button, approximate location option, clear warnings.

2. Contact privacy is sensitive.
   Mitigation: contacts private by default, aggregate reports opt-in only, no address book upload in MVP.

3. Community power structures can get complicated.
   Mitigation: start with simple roles; defer merge/adopt/split until audit logs and member consent are designed.

4. Notification overload can make users ignore the app.
   Mitigation: notification settings, quiet hours, rate limits, digest options.

5. The PDF does not define legal/privacy requirements.
   Mitigation: write privacy policy early, add account deletion, minimize stored personal data.

6. The PDF does not define moderation.
   Mitigation: keep toolkit curated and avoid broad community discovery until reporting/blocking is implemented.

7. "Gender" and "age minimum" community restrictions require careful handling.
   Mitigation: explain why data is collected, keep restrictions simple, avoid exposing sensitive profile fields.

8. Advanced community actions are under-specified.
   Mitigation: build them as explicit state machines later, not as direct mutations.

## 14. Recommended First Build Sprint

Sprint goal: prove the personal follow-up loop and basic community context without taking on live location risk immediately.

Build in this order:

1. Expo app shell.
2. Firebase Google auth.
3. Profile onboarding.
4. Contact CRUD.
5. Contact statuses and filters.
6. Reminder scheduling locally.
7. Study status on faithful contacts.
8. Basic community create/join.
9. Static toolkit.
10. Only then implement Faith Mode behind a development feature flag.

Why:

- Contacts and reminders are the core daily utility.
- Communities give the app social value.
- Faith Mode is powerful but high-risk, so it should be built after auth, roles, and privacy rules are trustworthy.

## 15. Definition of Done for Prototype

The prototype is ready for a small trusted internal beta when:

- Users can sign in and complete profiles.
- Users can add contacts and receive follow-up reminders.
- Contact statuses change correctly.
- Faithful contacts appear in studies.
- Users can create and join communities.
- Community roles are enforced server-side.
- Faith Mode can be activated and stopped safely.
- Location sharing expires automatically.
- Push notifications work for at least reminders and Faith Mode alerts.
- Firestore rules have tests for private data.
- Account deletion exists.
- Privacy policy exists.
