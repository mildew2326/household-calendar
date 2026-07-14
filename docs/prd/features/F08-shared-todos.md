# F08 — Shared todos / chores

**Status:** ready-for-build  
**Priority:** P0 (MVP)  
**Depends on:** F01  
**Master PRD:** ../MASTER_PRD.md  

## 1. Problem
Tasks fall through cracks across apps; household needs assignable shared todos.

## 2. Functional requirements
1. Todo fields: title, notes, assignee_id nullable, due_at nullable, completed_at, priority enum(none,low,med,high), list_id optional, recurrence optional simple weekly.
2. Views: My open, Household open, Completed (filter).
3. Toggle complete; completed move to bottom or Completed tab.
4. Create from calendar event (“follow-up”) optional later.
5. Realtime sync with partner.

## 3. Data model
```sql
todos (
  id, household_id, title, notes, assignee_id, due_at,
  completed_at, priority, created_by, created_at, updated_at, deleted_at
)
```

## 4. Acceptance criteria
- [ ] CRUD + complete toggle
- [ ] Filter by assignee
- [ ] Partner sees new todo live
- [ ] Soft delete

## 5. Out of scope
Full Kanban, subtasks depth, points/gamification, automatic chore rotation (phase 2).
