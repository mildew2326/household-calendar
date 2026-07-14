# Master PRD — Household Calendar

**Product codename:** Household Calendar (working title; rename later)  
**Repo:** https://github.com/mildew2326/household-calendar  
**Owner (orchestrator):** Hermes Agent  
**Executor:** Grok Build  
**Status:** Discovery / interview gate (v0.1)  
**Last updated:** 2026-07-13  

---

## 1. Vision

A shared household operating system for time: appointments, reminders, events, lists, and couple collaboration — optimized for **two iPhone users** first, with a **web-first** product that can be installed as a **PWA** and later wrapped as a native iOS app if needed.

Not “another Google Calendar clone.” Goal: the **default place both partners open** for household logistics, with reliability and feel that match or beat Cozi + TimeTree + Apple/Google strengths combined.

## 2. Primary users & jobs-to-be-done

| Persona | JTBD |
|---|---|
| Adult partner A (you) | See truth of household schedule; capture events fast; reduce nagging/coordination texts |
| Adult partner B (wife) | Same, with iPhone-native feel; low friction; trustworthy notifications |
| Future: kids / guests | View-only or limited write (optional phase 2) |

**Core jobs**
1. Know what is happening today / this week for the household.
2. Add something once so both people see it.
3. Split ownership of tasks/chores/shopping.
4. Get reminded at the right time without notification spam.
5. Resolve “who’s doing what” without a group chat archaeology dig.

## 3. Product principles

1. **Household-first default** — one shared calendar is home; personal overlays are secondary.
2. **Two-thumb capture** — creating an event must be faster than texting your partner.
3. **Trustworthy sync** — both phones converge in seconds; offline must not corrupt data.
4. **Glanceable** — week/day views readable in 2 seconds.
5. **Collaboration without social network bloat** — comments where useful; not a feed product.
6. **Privacy-respecting** — clear private vs shared boundaries.
7. **Ship web PWA first** — iPhone Home Screen install before native App Store unless blocked.

## 4. Delivery strategy (web → iPhone)

### Phase 0 — Foundation (now)
- Research + PRDs + repo scaffolding
- Interview gates closed

### Phase 1 — Web PWA MVP
- Auth (couple household)
- Shared calendar CRUD + views
- Real-time sync
- Push notifications (where supported)
- Shared lists (todos + shopping)
- Mobile-responsive UI that feels app-like on iPhone Safari

### Phase 2 — iPhone polish
- PWA install prompts, offline, better push path
- Optional Capacitor/React Native shell for App Store + reliable APNs + widgets

### Phase 3 — Intelligence & federation
- Natural language / voice
- Google/iCloud import
- AI suggestions, OCR flyer import
- Kitchen display mode

**Decision pending (interview):** pure PWA vs commit early to Capacitor wrapper.

## 5. Proposed tech stack (subject to interview)

| Layer | Proposal | Why |
|---|---|---|
| Web UI | Next.js (App Router) + TypeScript + Tailwind | Fast iteration; Grok Build fluency; great PWA story |
| State | TanStack Query + Zustand (or similar) | Server sync + local UI state |
| Backend | Supabase (Postgres + Auth + Realtime) **or** Firebase | Household realtime without heavy custom infra |
| Calendar engine | Custom model + `rrule` + date-fns-tz | Full control of household semantics |
| Push | Web Push + later APNs via native shell | iPhone web push is limited — native shell may be required for reliability |
| Hosting | Vercel (web) + Supabase cloud | Simple ops |
| Mobile shell (opt) | Capacitor | Reuse web UI; App Store path |

## 6. Feature modules (mini-PRD index)

Each feature has (or will have) a focused PRD under `docs/prd/features/`.

| ID | Feature | Mini-PRD | Priority |
|---|---|---|---|
| F01 | Household accounts & membership | stub | P0 |
| F02 | Shared calendar core & views | stub | P0 |
| F03 | Event model (CRUD, fields, timezone) | stub | P0 |
| F04 | Recurrence & exceptions | stub | P0 |
| F05 | Real-time sync & conflict resolution | stub | P0 |
| F06 | Notifications & reminders | stub | P0 |
| F07 | Collaboration (assignees, comments, activity) | stub | P1 |
| F08 | Shared todos / chores | stub | P1 |
| F09 | Shared shopping lists | stub | P1 |
| F10 | Capture UX (NL, templates, quick-add) | stub | P1 |
| F11 | PWA / offline / iPhone delivery | stub | P0 |
| F12 | External calendar federation | stub | P2 |
| F13 | AI assist (parse email/OCR/briefing) | stub | P2 |
| F14 | Privacy, export, admin | stub | P0 |
| F15 | Kitchen / wall display mode | stub | P2 |
| F16 | Meal planning (optional) | stub | P3 |

## 7. Non-goals (v1)

- Full workplace exchange replacement
- Public social network / family feed beyond event comments
- Complex multi-household enterprise tenancy
- Medical/HIPAA positioning

## 8. Success metrics

| Metric | Target (90 days of couple use) |
|---|---|
| Both partners weekly active | ≥ 4 days/week each |
| Events created in-app vs texted | Majority in-app |
| Notification usefulness | < 10% muted categories |
| Sync complaints | Near zero |
| Time-to-add event (mobile) | < 15 seconds median |

## 9. Risks

| Risk | Mitigation |
|---|---|
| iPhone web push unreliable | Capacitor/App Store path; SMS/email fallback |
| Partner adoption failure | Ruthless simplicity; Cozi-like defaults |
| Sync conflicts | CRDT or last-write with clear merge UI |
| Scope explosion | MVP cuts; mini-PRDs gated |
| Privacy fears | Clear private events policy; export/delete |

## 10. Interview gate

Implementation of mini-PRDs and Grok Build execution **blocked** on answers in:
`docs/prd/INTERVIEW.md`

## 11. Orchestration model

- **Hermes:** research, PRD depth, prioritization, Grok Build prompts, verification, product decisions synthesis
- **Grok Build:** implement feature mini-PRDs task-by-task with acceptance tests
- **Human (Carl + wife as needed):** product choices, design taste, private/shared policy, launch readiness

---

## Appendix — competitive summary

See `docs/research/competitive-feature-matrix.md` for full additive inventory and UX analysis.
