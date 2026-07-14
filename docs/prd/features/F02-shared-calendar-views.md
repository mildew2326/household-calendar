# F02 — Shared calendar core & views

**Status:** ready-for-build  
**Priority:** P0  
**Depends on:** F01, F03  
**Master PRD:** ../MASTER_PRD.md  

## 1. Problem
Partners need a single glanceable household time surface with premium feel.

## 2. Functional requirements
1. Default home `/app` = household shared calendar.
2. Views: `day` | `threeDay` | `week` | `month` | `agenda`. Mobile default `threeDay` or `agenda`; desktop `week`.
3. Today indicator; jump-to-date control; prev/next navigation.
4. Events colored by creator/assignee profile color; private events as neutral “Busy” blocks for non-owners.
5. Click empty slot → create; click event → detail/edit.
6. Drag to create range on desktop week/day (nice-to-have if timeboxed; click create is required).
7. Fantastical-like density: elegant typography, subtle grid, high contrast now/next.
8. Performance: render 500 expanded occurrences without jank.

## 3. UX
- Top bar: view switcher, household name, today button, quick-add `+`.
- Bottom nav mobile: Calendar | Tasks | Shop | Meals | Settings.
- Skeleton loaders; empty state “Nothing planned — tap +”.

## 4. Acceptance criteria
- [ ] All five views render events in range
- [ ] Mobile bottom nav works
- [ ] Quick-add creates event and shows in view
- [ ] Private busy blocks without titles for partner
- [ ] Keyboard: t = today (desktop)

## 5. Out of scope
Year view heatmap, resource calendars, availability scheduling links.
