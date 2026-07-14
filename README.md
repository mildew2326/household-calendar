# Duet

Premium shared household calendar for couples — events, tasks, shopping, meals.
iPhone-first **PWA**. Hermes orchestrates; Grok Build implements feature mini-PRDs.

**Repo:** https://github.com/mildew2326/household-calendar

## Quick start (demo mode — no cloud required)

```bash
cd /home/carl/Projects/household-calendar
npm install
npm run dev
# open http://localhost:3000 → Open demo app
```

```bash
npm test    # privacy projection unit tests
npm run build
```

## Supabase (live auth + sync)

1. Create a Supabase project.
2. Run SQL in `supabase/migrations/20260713_init.sql`.
3. Copy `.env.example` → `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Enable Auth → Email magic links.
5. `npm run dev`

## Product docs

| Doc | Purpose |
|-----|---------|
| [docs/prd/MASTER_PRD.md](docs/prd/MASTER_PRD.md) | Master PRD |
| [docs/prd/INTERVIEW.md](docs/prd/INTERVIEW.md) | Locked decisions |
| [docs/research/competitive-feature-matrix.md](docs/research/competitive-feature-matrix.md) | Market matrix |
| [docs/prd/features/](docs/prd/features/) | Grok Build mini-PRDs |

## Stack

Next.js 15 · TypeScript · Tailwind 4 · Supabase · date-fns · rrule · Vitest

## iPhone

Safari → Share → **Add to Home Screen**. Manifest at `/manifest.webmanifest`.

## Status

- ✅ Macro tracking (MacroFactor-class): diary, search, custom foods, rings, adaptive targets, weight, water, trends, meal→log

- ✅ Demo UI shell: Calendar / Tasks / Shop / Meals / Settings
- ✅ Busy privacy projection + tests
- ✅ SQL schema + RLS sketch
- ⏳ Wire create/edit to Supabase (F01/F03)
- ⏳ Realtime (F05), recurrence expand (F04)
