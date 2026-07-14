# Product interview — Household Calendar

Status: **OPEN** — answers required before deep mini-PRDs and Grok Build execution.

Instructions: answer in chat (or edit this file). Prefer decisive choices; “unsure” is fine if you add constraints.

---

## A. Product identity

1. Working product name? (or “pick for me”)
2. Is this **couples-only (2 adults)** for v1, or must it support kids/viewers immediately?
3. Tone of UI: more **Cozi-homey**, **Apple-minimal**, or **premium productivity (Fantastical-like)**?

## B. Delivery to iPhones

4. v1 delivery preference:
   - **A)** Web app + PWA (Add to Home Screen) only
   - **B)** PWA first, then Capacitor App Store wrapper in phase 2
   - **C)** Native app required for v1 (App Store from day one)
5. Must push notifications work reliably on locked iPhones for v1? (Yes forces native shell sooner)
6. Will either of you use Android ever? (affects Google Cal federation priority)

## C. Source of truth & federation

7. Should Household Calendar be the **primary system of record**, or a **layer on top of Google/Apple calendars**?
8. Do you already live in Google Calendar, Apple Calendar, or Outlook for work?
9. Must work calendars appear as read-only overlays without leaking work details to the other partner incorrectly?

## D. Privacy between partners

10. Are **private events** allowed (hidden from spouse)?
11. If private events exist: completely invisible, or “busy” block only?
12. Should there be an audit log (“who changed the dentist appointment”)?

## E. Collaboration depth

13. Rank these P1 features (1=must, 5=later):  
    event comments · chore rotation · shopping lists · meal planner · AI email ingest
14. How do you coordinate today (texts, shared Google cal, paper, Cozi, other)?
15. Biggest current pain point in one sentence?

## F. Notifications & reminders

16. Preferred default reminder offsets for appointments?
17. Location-based “leave now” reminders needed in v1?
18. Quiet hours required?

## G. Lists & household ops

19. Shopping list: simple checkbox list, or aisle/category/pantry-aware?
20. Chores: assignable todos only, or automatic rotation schedules?
21. Meal planning in v1, later, or never?

## H. Capture UX

22. Natural language create (“Date night Saturday 7pm”) in v1?
23. Voice input in v1?
24. Photo/OCR of school flyers in v1 or later?

## I. Technical preferences

25. Hosting comfort: cloud SaaS (Supabase/Firebase/Vercel) OK? Any self-host requirement?
26. Account model: email/password, magic link, Sign in with Apple, Google?
27. Budget tolerance: free self-run only vs paid cloud (~$0–25/mo) vs willing to pay Apple developer ($99/yr) for App Store?

## J. Success & scope

28. MVP must-have checklist (edit freely):
   - [ ] Shared week/day views
   - [ ] Event create/edit/delete
   - [ ] Both see changes live
   - [ ] Reminders/push
   - [ ] Shared shopping or todos
   - [ ] Other: ________
29. Hard deadline? (none / date)
30. Wife available for a 15-min design preference pass later? (yes/no)

---

## Decisions log (filled by Hermes after answers)

| ID | Decision | Choice | Date |
|---|---|---|---|
| | | | |
