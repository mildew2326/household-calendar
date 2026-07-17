# Duet competitive assessment & product recommendations

- **Date:** 2026-07-16  
- **Status:** decision draft for Carl (not yet implemented)  
- **Sources:** existing competitive matrix + 2026 roundups (Cozi, TimeTree, Google, Apple, FamilyWall, Fantastical, Maple/Sense-class AI)

---

## 1. What the market rewards (2026)

| Product | Wins on | Weak on |
|---------|---------|---------|
| **Cozi** | One household app: calendar + shopping + todos + meals; low friction for non-tech partners | Weak federation; free tier limited/ads; not premium calendar UX |
| **TimeTree** | Couple/small-group shared trees; **event comments/chat**; multiple shared calendars | Weak grocery/meals; not full household ops |
| **Google Calendar** | Reliability, invites/RSVP, ICS, multi-cal overlays, free default | Not household-native; lists elsewhere |
| **Apple Calendar + Family** | Zero-friction on iPhone; Siri/widgets/Focus | Weak web; no shopping/meals; Android spouse pain |
| **FamilyWall** | Calendar + location + messaging + lists | Heavier “family social network”; privacy feel |
| **Fantastical** | Premium NL create, design, multi-source personal calendar | Not a household product |
| **AI planners (Sense/Nori/Maple-class)** | Email→event, less manual entry, all-in-one ops | Trust, cost, inbox privacy |

**Pattern that wins for couples:**  
1) **Single shared truth** for home time  
2) **Lists that keep people opening the app** (shop/chores)  
3) **Fast capture** (faster than texting)  
4) **Reliable sync** both phones  
5) Optional: **event chat** (TimeTree) or **AI ingest** (Sense) — not both on day one

---

## 2. Duet inventory (what we already have)

### Strong / differentiators (keep & polish)
| Area | Status |
|------|--------|
| Shared household calendar multi-view (day / 3-day / week / month) | Demo |
| Color by person + group color | Demo |
| Quick add event | Demo |
| Private → Busy privacy projection (+ tests) | Demo / designed |
| Today planner (top 3 + hour grid + checklist) | Demo |
| Goals → schedule blocks onto calendar | Demo |
| Meals + portions → shopping rebuild | Demo |
| Macro tracking (MacroFactor-class) | Demo |
| Tasks / shop shell | Demo |
| PWA-oriented Next stack | Scaffold |
| Premium productivity positioning (Fantastical-like tone) | Direction locked |

### Thin / missing vs market MVP
| Area | Gap severity |
|------|--------------|
| Real multi-device sync (Supabase/auth) | **Critical** |
| Full event edit UI (location, notes, attach, delete, drag) | High |
| Recurrence expand + exceptions | High |
| Reminders / notifications | High |
| Event comments (“who’s driving?”) | Medium (TimeTree win) |
| Natural language create | Medium-high UX |
| External cal overlay (Google/Apple work) | Medium (phase 2 OK) |
| Search | Medium |
| Offline + conflict UI | Medium |
| Aisle categories on shop | Low-medium |
| Chore rotation | Low |
| Kitchen / wall mode | Low (later) |
| AI email ingest / OCR | Later |
| Location sharing of people | **Out of scope** (FamilyWall; privacy) |

---

## 3. Gap matrix (Duet vs popular products)

Legend: Y = strong · P = partial · N = missing · D = demo-only local

| Feature | Cozi | TimeTree | Google | Apple | Duet now | Recommendation |
|---------|------|----------|--------|-------|----------|----------------|
| Shared household default | Y | Y | P | P | D | **Keep as core** |
| Multi-view calendar | Y | Y | Y | Y | D | Improve polish + agenda view |
| Per-person colors | Y | Y | Y | Y | D | Keep |
| Realtime sync | Y | Y | Y | Y | N | **Add P0** |
| Recurrence | P | P | Y | Y | P (data only) | **Add P0** |
| NL create | N | N | Y | Y | N | Add P1 |
| Event comments | N | Y | N | N | N | Add P1 (lightweight) |
| Shopping list | Y | N | N | N | D | Keep; improve categories |
| Todos/chores | Y | P | P | Y | D | Keep; assignees + due dates |
| Meal planner | Y | N | N | N | D | Keep simplified |
| Macros / food log | N | N | N | N | D | **Differentiate OR park** |
| Goals → schedule | N | N | N | N | D | **Differentiate** |
| Today top-3 planner | P | N | N | N | D | **Differentiate** |
| Work cal federation | P | Y | Y | Y | N | Phase 2 |
| People location | N | N | N | Y | N | **Do not add** |
| Family social feed | N | P | N | N | N | **Do not add** |
| AI email→event | N | N | P | P | N | Phase 3 |
| PWA / web | Y | Y | Y | P | P | Finish install + offline |
| Push reminders | Y | Y | Y | Y | N | **Add P0** (email/web) |

---

## 4. Recommendations

### A. ADD (do these — ordered)

#### Tier 0 — Without these Duet is a demo, not a product
1. **Household auth + invite (F01)** — magic link, 2 adults  
2. **Event CRUD persisted + realtime (F03/F05)** — both phones  
3. **Reminders** — at least 1 day + 1 hour; email fallback if Web Push flaky  
4. **Recurrence that works in views (F04)** — weekly trash day must appear every week  

#### Tier 1 — Beats “just use Google + texts”
5. **Rich event sheet** — location, notes, who (you/partner/both), category, delete, edit this/all for series  
6. **Agenda / list view** — many partners prefer list over month grid on phone  
7. **Global search** — events + todos + shop items  
8. **Lightweight event notes thread** — TimeTree’s killer: 3–5 comments max, not a chat app  
9. **Natural language quick add** — “Dentist Tue 10am both”  
10. **Today home as default tab** — Cozi Today pattern: top 3 + next events + shop peek  

#### Tier 2 — Household depth (after couple uses weekly)
11. Shopping **aisle/categories** + share-to-text  
12. Todo **assignee + due + recurrence** (chores light)  
13. **Conflict banner** when both double-book evening  
14. **ICS export / Google read-only overlay** for work hours  
15. **Kitchen wall mode** (large week strip)  

### B. TAKE AWAY / PARK (reduce bloat)

| Item | Why | Action |
|------|-----|--------|
| **Full MacroFactor clone depth** | Market winners don’t need this for household calendar adoption; high complexity; dilutes “open for schedule” habit | **Park macros behind Settings → Labs** or separate “Health” area; don’t put in primary nav until calendar is live-synced |
| Nutrition as first-class 8th tab equal to Cal | Tab overload on iPhone | Nav: **Today · Cal · Lists · More** (Goals/Meals/Macros under More or Lists) |
| FamilyWall-style location / social feed | Privacy + scope | Never v1 |
| Enterprise multi-household | Not couple product | Never v1 |
| Perfect native push before usable sync | Wrong order | Sync first, push second |

### C. IMPROVE (already exist but weak vs leaders)

| Feature | Improve to |
|---------|------------|
| Quick add | Full sheet + NL; <15s create on phone |
| Calendar views | Denser week; all-day row; multi-day events spanning |
| Goals | Fewer fields default; “Schedule this week” one tap |
| Meals | Fewer screens; “this week dinners” list → shop in 1 tap |
| Shop | Categories; clear empty; share list |
| Privacy Busy | Surface in UI clearly (“Partner busy 2–3pm”) not only in code |
| Visual polish | Fantastical-like: large time labels, soft cards, less chrome, bottom sheet create |

### D. USER-FRIENDLINESS (UX system)

1. **Default landing = Today**, not month calendar  
2. **One primary FAB: +** → event / todo / shop item (3 choices max)  
3. **Color = person always**; legend sticky  
4. **Empty states teach**: “Add date night so both see it”  
5. **Partner activity toast**: “Alex added Dentist Tue” (builds trust in sync)  
6. **Reduce tabs from 8 → 4–5** primary  
7. **Couple onboarding 60s**: names, colors, invite link, sample events  
8. **No ads, no social feed** — premium calm  

---

## 5. Proposed product shape (post-decision)

### Positioning line
> **Duet is the household source of truth for time and lists — with a Today plan and goals that Google/Cozi don’t do well — without becoming a family social network or a diet app.**

### Nav (recommended)
1. **Today**  
2. **Calendar**  
3. **Lists** (Shop + Tasks + optional Meals entry)  
4. **More** (Goals, Macros/Labs, Settings, Invite)

### 90-day success (aligned with Master Projects)
- Both partners use Duet ≥4 days/week  
- Majority of household events created in Duet, not text  
- Shopping list used for ≥1 real grocery trip  
- Macros optional, not required for success  

---

## 6. Implementation sequence (once you approve)

| Sprint | Outcome |
|--------|---------|
| **S1** | F01 auth + household invite; collapse nav; Today as home |
| **S2** | F03 event CRUD cloud + F05 realtime; activity toasts |
| **S3** | F04 recurrence; reminders email/web |
| **S4** | Rich event sheet + agenda + search |
| **S5** | Event notes thread + NL quick add |
| **S6** | Shop categories + chore assignees; wall mode optional |

Macros stay available but **not** on the critical path.

---

## 7. Decision checklist for Carl

Please confirm or edit:

- [ ] **Park macros in Labs / More** (yes/no)  
- [ ] **Collapse nav to Today / Cal / Lists / More** (yes/no)  
- [ ] **P0 = auth + sync + recurrence + reminders** before more features (yes/no)  
- [ ] **Add TimeTree-style event comments** in P1 (yes/no)  
- [ ] **Explicitly exclude** people-location & family social feed (yes/no)  
- [ ] **Work calendar overlay** phase 2 only (yes/no)  

After answers → implement S1.

---

## Sources
- Repo: `docs/research/competitive-feature-matrix.md`, MASTER_PRD, INTERVIEW decisions  
- 2026 market: Cozi, TimeTree, Google, Apple, FamilyWall, Fantastical, Maple/Sense-class roundups  
