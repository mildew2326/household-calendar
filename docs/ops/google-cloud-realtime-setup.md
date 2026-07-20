# Google Cloud realtime sync for Duet

## Important architecture choice

| Need | Use |
|------|-----|
| Live calendar / goals / lists between two iPhones | **Cloud Firestore** (this guide) |
| Photos, receipt images, backups | **Firebase Storage** → sits on a **GCS bucket** |
| Raw GCS JSON files alone | **Not recommended** as primary DB (no realtime queries, painful concurrency) |

Duet ships a Firestore adapter. Optional GCS/Firebase Storage can be added for media without changing the sync core.

## 1. Create a Firebase project (free Spark tier is enough)

1. Open [Firebase Console](https://console.firebase.google.com/)
2. **Add project** → name e.g. `duet-household`
3. Disable Google Analytics if you want fewer prompts
4. Create project

## 2. Register a Web app

1. Project overview → **Web** (`</>`)
2. App nickname `Duet PWA`
3. Copy the `firebaseConfig` values

## 3. Enable Firestore

1. Build → **Firestore Database** → Create database
2. Start in **test mode** for couple prototype (lock rules before public URL)
3. Location: pick closest (e.g. `us-central1`)

### Security rules (couple prototype)

Paste in Firestore → Rules (tighten before wide sharing):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Demo: any client with the web config can read/write this household.
    // Production: require Firebase Auth + membership claim.
    match /households/{householdId} {
      allow read, write: if true;
    }
  }
}
```

Production hardening (later):
- Email magic link / Google Sign-In for you + spouse only
- `allow read, write: if request.auth != null && request.auth.token.email in [...]`

## 4. (Optional) Firebase Storage = GCS bucket

1. Build → **Storage** → Get started
2. This creates a **Google Cloud Storage** bucket (e.g. `duet-household.appspot.com`)
3. Use later for event photos; not required for calendar sync

## 5. Env vars for Duet

Create `.env.local` in the repo root (gitignored):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=duet-household.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=duet-household
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=duet-household.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...

# Same id on both phones so you share one household doc
NEXT_PUBLIC_DUET_HOUSEHOLD_ID=duet-home
```

Restart Next after editing env:

```bash
cd ~/Projects/household-calendar
npm run build
npm run start -- -p 3010 -H 0.0.0.0
```

## 6. Verify

1. Open http://127.0.0.1:3010/app — header badge should show **Live** (not Local only)
2. Settings → Realtime sync status
3. Add an event on one browser / phone
4. Second device with same env should update within ~1s

Firestore path: `households/{NEXT_PUBLIC_DUET_HOUSEHOLD_ID}`

## 7. Two iPhones

1. Host Duet (Vercel, home PC + Tailscale, or tunnel)
2. Both install PWA from that HTTPS URL
3. Same Firebase env baked into the build

## Cost (couple scale)

Firestore free tier is far above household calendar volume. GCS/Storage free tier covers light photo use.

## CLI alternative (optional)

If `gcloud` + Firebase CLI are installed:

```bash
npm i -g firebase-tools
firebase login
firebase projects:create duet-household
# then enable firestore in console (still easiest once)
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Badge stays **Local only** | Missing `NEXT_PUBLIC_FIREBASE_*` or server not restarted |
| **Sync error** permission | Publish Firestore rules allowing read/write |
| One phone not updating | Different `DUET_HOUSEHOLD_ID` or different Firebase project |
| Lost local demo data after first Live | First cloud doc wins; wipe Firestore doc to re-seed from a device |
