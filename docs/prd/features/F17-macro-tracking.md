# F17 — Macro tracking (MacroFactor-class)

**Status:** ready-for-build / implementing  
**Priority:** P0 (user request)  
**Depends on:** F16 meals  
**Inspiration:** MacroFactor and peers (MyFitnessPal, Cronometer, Carbon)

## Feature parity targets

| Area | MacroFactor-class capability | Duet v1 |
|------|------------------------------|---------|
| Food diary | Log by meal period | Yes |
| Macros | Calories, protein, carbs, fat | Yes |
| Micros (subset) | Fiber, sodium, sugar, water | Yes |
| Food search | Searchable DB | Yes (seeded local DB) |
| Custom foods | User-defined | Yes |
| Recipes / meals | Multi-ingredient composite | Yes (simple recipe foods) |
| Portions | Grams, servings, household units | Yes |
| Daily targets | kcal + P/C/F grams | Yes |
| Target engine | Goal-based (cut/maintain/bulk) + activity | Yes (Mifflin-St Jeor + activity) |
| Adaptive TDEE | Rolling expenditure estimate | Yes (simplified: weight trend adjust) |
| Weight log | Daily weigh-ins | Yes |
| Trends | 7/14/30d charts | Yes (spark + table) |
| Remaining macros | Live remaining/over | Yes |
| Copy previous day | Quick re-log | Yes |
| Quick-add favorites | Star foods | Yes |
| Water | Glasses / ml | Yes |
| Barcode | Camera scan | Stub (manual entry; API later) |
| Nutrition labels | Per item breakdown | Yes |
| Weekly review | Avg adherence | Yes |
| Household | Per-person private logs | Yes (profile selector in demo) |
| Meal planner link | Planned dinner → log template | Yes |

## Out of scope v1
True continuous glucose, coach coaching network, full USDA API live sync, App Store barcode SDK.
