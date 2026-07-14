# F04 — Recurrence & exceptions

**Status:** ready-for-build  
**Priority:** P0  
**Depends on:** F03  
**Master PRD:** ../MASTER_PRD.md  

## 1. Problem
Household routines (trash, school, date nights) need reliable recurrence with “this / following / all” edits.

## 2. Functional requirements
1. Support RRULE subset: FREQ=DAILY|WEEKLY|MONTHLY|YEARLY; INTERVAL; BYDAY; COUNT or UNTIL; WKST.
2. Store master event with `recurrence_rule`; expand occurrences in range client or server for display.
3. Edit modes: this event only (create exception), this and following (split series), all events.
4. Delete modes: this / following / all.
5. Exceptions table or child events with `recurrence_parent_id` + `original_starts_at`.

## 3. Acceptance criteria
- [ ] Weekly event expands correctly across a month view
- [ ] Exception does not appear at original time
- [ ] Edit-all updates future titles
- [ ] Tests for expand + exception with `rrule` library

## 4. Out of scope
RDATE/EXDATE full RFC complexity beyond exceptions; BYSETPOS advanced cases.

## 12. Grok Build notes
Library: `rrule`. Expand server-side for list API to keep mobile light.
