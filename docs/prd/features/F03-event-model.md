# F03 — Event model (CRUD, fields, timezone)

**Status:** ready-for-build  
**Priority:** P0  
**Depends on:** F01, F02  
**Master PRD:** ../MASTER_PRD.md  

## 1. Problem
Household needs a rich, shared event object both partners can create/edit with clear ownership and privacy.

## 2. User stories
- As an adult, I want to create an appointment with time, place, and assignee so both of us know the plan.
- As an adult, I want a private event that only shows as Busy to my partner.
- As an adult, I want to edit/delete events with undo-friendly trash.

## 3. Functional requirements
1. Event fields: `title` (required), `description`, `location`, `starts_at`, `ends_at`, `all_day`, `timezone` (IANA), `created_by`, `assignee_ids[]`, `category`, `color_override`, `visibility` enum(`shared`,`private`), `status` enum(`confirmed`,`tentative`,`cancelled`), `reminders[]` offsets minutes, `recurrence_rule` nullable (see F04).
2. CRUD UI: create modal/sheet, edit page/sheet, delete → soft-delete (`deleted_at`).
3. Private events: partner queries return only `{ id, starts_at, ends_at, all_day, visibility:'private' }` as Busy (no title/details).
4. Timezone: store UTC timestamptz; display in household default TZ or event TZ.
5. Validation: end > start; title non-empty; max length title 200.
6. Activity: write `event_activity` row on create/update/delete (actor, action, at).

## 4. UX
- Quick-add on calendar click/drag; full form for details.
- Privacy toggle: Shared | Private (Busy).
- Assignee chips for household members.
- iPhone: bottom sheet form, large tap targets.

## 5. Data model
```sql
events (
  id uuid pk,
  household_id uuid not null,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean default false,
  timezone text not null default 'America/New_York',
  created_by uuid not null,
  visibility text not null default 'shared', -- shared | private
  status text not null default 'confirmed',
  category text,
  color_override text,
  recurrence_rule text, -- RRULE string, nullable
  recurrence_parent_id uuid null,
  deleted_at timestamptz null,
  created_at, updated_at
)
event_assignees (event_id, user_id)
event_reminders (id, event_id, offset_minutes int, channel text default 'email')
event_activity (id, event_id, actor_id, action text, payload jsonb, created_at)
```

## 6. API
- listEvents(rangeStart, rangeEnd) — applies privacy projection
- getEvent(id) — 404 if private and not owner
- createEvent, updateEvent, softDeleteEvent

## 7. Business rules
- Only household members can mutate.
- Private event details only for `created_by` (or assignees if we decide; v1: creator only).
- Soft-deleted excluded from default list.

## 8. Edge cases
DST transitions, multi-day all-day, zero-duration reject, concurrent edit last-write-wins + activity log.

## 9. Acceptance criteria
- [ ] Create/edit/delete (soft) works
- [ ] Partner sees Busy only for private events
- [ ] Range query returns events overlapping window
- [ ] Unit tests for privacy projection
- [ ] Smoke: create event appears on week view

## 10. Out of scope
Attachments, RSVP guests outside household, complex conference links.

## 12. Grok Build notes
Use date-fns-tz. Privacy filter must be server-side (RLS + view or RPC).
