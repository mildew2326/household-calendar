# Duet

Premium shared household calendar for couples — events, tasks, shopping, meals.
iPhone-first **PWA**. Hermes orchestrates; Grok Build implements feature mini-PRDs.

**Repo:** https://github.com/mildew2326/household-calendar

## Quick start (demo mode — no cloud required)

```bash
cd /home/carl/Projects/household-calendar
npm install
npm run dev -- -p 3010 -H 127.0.0.1
# open http://127.0.0.1:3010/app
```

```bash
npm test
npm run build
npm run start -- -p 3010 -H 0.0.0.0
```

## Realtime sync (Google Cloud / Firebase)

**Do not use raw GCS buckets as the calendar database.**  
Use **Cloud Firestore** for live sync. **Firebase Storage** (GCS-backed) is optional for photos later.

1. Follow **[docs/ops/google-cloud-realtime-setup.md](docs/ops/google-cloud-realtime-setup.md)**
2. Copy `.env.example` → `.env.local` and fill `NEXT_PUBLIC_FIREBASE_*`
3. Set the same `NEXT_PUBLIC_DUET_HOUSEHOLD_ID` on both phones
4. Restart Next — header badge shows **Live**

Data path: `households/{householdId}` with `onSnapshot` + debounced writes.

## Supabase (optional alternate)

1. Create a Supabase project.
2. Run SQL in `supabase/migrations/20260713_init.sql`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Product docs

| Doc | Purpose |
|-----|---------|
| [docs/prd/MASTER_PRD.md](docs/prd/MASTER_PRD.md) | Master PRD |
| [docs/prd/INTERVIEW.md](docs/prd/INTERVIEW.md) | Locked decisions |
| [docs/ops/google-cloud-realtime-setup.md](docs/ops/google-cloud-realtime-setup.md) | Firebase/Firestore setup |
| [docs/prd/features/](docs/prd/features/) | Mini-PRDs |

## Stack

Next.js 15 · TypeScript · Tailwind 4 · Firebase/Firestore · Supabase (optional) · Zustand · Vitest

## iPhone

Safari → Share → **Add to Home Screen**. Manifest at `/manifest.webmanifest`.

## Status

- ✅ Today planner (proportional day column, pull window allocator)
- ✅ Multi-view calendar, goals triage, lists, macros lab
- ✅ Firestore realtime adapter + sync badge
- ⏳ Firebase Auth lock-down + Storage attachments
- ⏳ Production host (Vercel) with shared env
