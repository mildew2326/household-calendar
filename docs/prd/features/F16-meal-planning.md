# F16 — Meal planning

**Status:** ready-for-build  
**Priority:** P0 (MVP per interview D5)  
**Depends on:** F01, F09  
**Master PRD:** ../MASTER_PRD.md  

## 1. Problem
Meals are unplanned or not shared; want week meal slots linked to shopping.

## 2. Functional requirements
1. Week grid: days × optional slots (Breakfast/Lunch/Dinner/Other) — v1 default Dinner only + free text.
2. Meal entry: title, notes, optional recipe_url, optional ingredients text list.
3. “Add ingredients to shopping list” parses lines → shopping_items.
4. Meals can optionally create/link calendar event (Dinner at 6:30).
5. Navigate prev/next week.

## 3. Data model
```sql
meal_plans (id, household_id, week_start date) -- week_start = Monday
meals (id, meal_plan_id, day date, slot text, title, notes, recipe_url, ingredients text, event_id null)
```

## 4. Acceptance criteria
- [ ] Plan dinners for a week
- [ ] Push ingredients to shopping list
- [ ] Partner sees plan live
- [ ] Empty slots editable on mobile

## 5. Out of scope
Full recipe DB, nutrition macros, auto meal suggestions AI (phase 3).
