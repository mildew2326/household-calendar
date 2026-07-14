# F18 — Family goals, calendar views, projects & daily planner

**Status:** implementing  
**Priority:** P0 (user request)  
**Master PRD:** ../MASTER_PRD.md  

## 1. Family macros + meals + shopping portions
- Each household member has individual nutrition goals (kcal/P/C/F).
- Household combined targets = sum of active members for meal planning scale.
- Weekly meals list servings + optional per-member portion fractions.
- “Build shopping list” multiplies recipe ingredients by total servings and tags distribution notes (e.g. “You 40% / Partner 60%” or equal split).

## 2. Calendar views
- Views: **day | 3-day | week | month**
- Events color-coded by owner/assignee; **group** events use household/group color and customizable label.
- Create/edit demo events with type: personal | partner | group.

## 3. Goals / larger projects
- Goals have title, description, status, priority, target date, linked member(s).
- From a goal: generate schedule blocks (preferred days + time windows + duration).
- Blocks appear as calendar events and feed the daily planner.

## 4. Daily schedule & top 3
- Per day: select which events/tasks/goal blocks matter today.
- Mark **Top 3** priorities (ordered).
- Optional **hour-by-hour** grid (editable times).
- Checklist mode: complete/skip/reschedule when the day slips; flexible reorder.

## Acceptance (demo)
- [ ] Switch day / 3-day / week / month
- [ ] Color legend by member + group
- [ ] Goals CRUD + plan blocks
- [ ] Today: top 3 + hour grid + checklist edits
- [ ] Family combined macros shown; meal → portioned shopping
