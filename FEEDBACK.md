# FEEDBACK — Duet build

## Phase: Foundation scaffold (2026-07-13)

| Check | Result |
|-------|--------|
| `npm test` privacy projection | PASS (3) |
| `npm run build` | PASS |
| Demo calendar shows Busy for partner private event | PASS (logic + UI class) |
| Mini-PRDs P0 written | PASS |
| Supabase live end-to-end | PENDING (needs project keys) |

### Next repair / build queue
1. Grok Build: F01 magic link + create household + invite
2. Grok Build: F03 event CRUD against Supabase
3. F04 recurrence expand in list API
4. F05 realtime subscriptions
5. Persist demo shopping/todos to Supabase when configured

## Incident: Demo 500 (2026-07-17)

| Check | Result |
|-------|--------|
| Symptom | `http://127.0.0.1:3010` returned **500 Internal Server Error** |
| Root cause | Stale/crashed **Next turbopack dev** process (`next dev -p 3010`) after UX sprint; build itself was healthy |
| Fix | Killed bad dev server; ran `npm run build` (PASS); started **production** `next start -p 3010 -H 0.0.0.0` |
| Verify | `/`, `/app`, `/app/calendar` all **HTTP 200** |
| URLs | Local: http://127.0.0.1:3010/app · LAN: http://10.0.0.213:3010/app |
| Tests | 21/21 PASS |

