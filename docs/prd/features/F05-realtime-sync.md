# F05 — Real-time sync & conflict resolution

**Status:** ready-for-build  
**Priority:** P0  
**Depends on:** F01, F03  
**Master PRD:** ../MASTER_PRD.md  

## 1. Problem
Both partners edit from iPhones; changes must appear within seconds without corrupting data.

## 2. Functional requirements
1. Supabase Realtime on `events`, `todos`, `shopping_items`, `meal_plans` for household channel.
2. Client invalidates/refetches or patches local cache on change.
3. Optimistic UI for create/update with rollback on error.
4. Conflict policy v1: last-write-wins on `updated_at`; surface toast “Updated by [partner]”.
5. Presence optional later; not required v1.
6. Offline: queue mutations in IndexedDB; flush on reconnect (basic); if conflict, server wins + toast.

## 3. Acceptance criteria
- [ ] Two browser sessions: create in A appears in B without refresh
- [ ] Edit in A updates B
- [ ] Soft delete propagates
- [ ] Documented conflict behavior in README

## 12. Grok Build notes
TanStack Query + supabase channel subscribe. Filter by household_id.
