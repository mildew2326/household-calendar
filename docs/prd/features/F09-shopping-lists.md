# F09 — Shared shopping lists

**Status:** ready-for-build  
**Priority:** P0 (MVP)  
**Depends on:** F01  
**Master PRD:** ../MASTER_PRD.md  

## 1. Problem
Shopping lists get lost in texts; need shared checkbox list both can edit in store.

## 2. Functional requirements
1. One default “Groceries” list per household; allow multiple named lists.
2. Item fields: name, quantity text, category/aisle optional, checked boolean, added_by, sort_order.
3. Check/uncheck; “Clear checked” action.
4. Quick add from meal planner (F16) adds ingredients unchecked.
5. Realtime: checkmarks sync for partner in store.

## 3. Data model
```sql
shopping_lists (id, household_id, name, created_at)
shopping_items (id, list_id, name, quantity, category, is_checked, sort_order, added_by, created_at, updated_at)
```

## 4. Acceptance criteria
- [ ] Add/check/clear items
- [ ] Multiple lists
- [ ] Live sync of checks
- [ ] Mobile-friendly large check targets

## 5. Out of scope
Store price APIs, barcode scan, pantry inventory.
