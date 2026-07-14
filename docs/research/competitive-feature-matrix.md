# Competitive feature matrix — household / couple calendars (2026)

Research synthesized from product sites, review roundups (2026), and X discussion.
Products covered: **Cozi**, **TimeTree**, **Google Calendar**, **Apple Calendar (+ Family Sharing)**, **FamilyWall**, **Nori/Sense-class AI planners**, **Fantastical** (premium front-end), **physical hubs** (Skylight/Hearth — pattern only).

Legend: `Y` = strong/native · `P` = partial/limited · `N` = weak/absent · `*` = paid tier

| Feature area | Cozi | TimeTree | Google Cal | Apple Cal | FamilyWall | AI planners (Nori/Sense) | Fantastical |
|---|---|---|---|---|---|---|---|
| **Shared household calendar** | Y | Y | Y | Y | Y | Y | Y |
| Single “family” view (not N individual cals) | Y | Y | P | P | Y | Y | P |
| Multi-calendar layers (work/home/kids) | P | Y | Y | Y | Y | Y | Y |
| Per-person color coding | Y | Y | Y | Y | Y | Y | Y |
| Real-time multi-device sync | Y | Y | Y | Y | Y | Y | Y |
| Recurring events (complex RRULE) | P | P | Y | Y | P | P | Y |
| Natural-language event create | N | N | Y | Y (Siri) | N | Y | Y |
| Event comments / chat thread | N | Y | N | N | Y | P | N |
| Event attachments / photos | P | P | Y | Y | Y | P | Y |
| Location + maps + travel time | P | P | Y | Y | P | P | Y |
| Time-zone handling | P | P | Y | Y | P | P | Y |
| Availability / free-busy | N | P | Y | Y | P | P | Y |
| Conflict detection | N | P | P | P | P | Y | Y |
| Invitations / RSVP (email/ICS) | N | P | Y | Y | P | P | Y |
| Push notifications + quiet hours | Y | Y | Y | Y | Y | Y | Y |
| Widgets / lock screen | Y | Y | Y | Y | Y | P | Y |
| Shared to-do / chores | Y | P | P (Tasks) | Y (Reminders) | Y | Y | P |
| Shared shopping / grocery list | Y | N | N | N | Y | Y | N |
| Meal planning | Y* | N | N | N | P | Y | N |
| Recipe box / journal | Y* | N | N | N | P | P | N |
| Role-based / kids accounts | P | P | P | Y (Family) | Y | P | N |
| Location sharing of people | N | N | N | Y (Find My) | Y | P | N |
| AI auto-ingest from email/SMS | N | N | P | P | N | Y | P |
| Voice add | P | N | P | Y | N | Y | Y |
| Cross-platform web | Y | Y | Y | P (iCloud.com) | Y | Y | N (Apple-first) |
| Offline support | P | P | P | Y | P | P | Y |
| Privacy / local-first posture | P | P | P | Y | P | P | P |
| Home display / wall mode | N | N | P | P | N | N | N |
| Import ICS / Google / iCloud | P | Y | Y | Y | P | P | Y |
| API / integrations | N | N | Y | P | N | P | Y |

## Implementation & UX notes (feel / usefulness)

### Cozi
- **Feel:** Household command center, not a “power calendar.” Low cognitive load for non-tech partners.
- **UX:** One shared calendar first; lists and meal planner as sibling tabs. Color-by-person is primary navigation metaphor.
- **Strength:** Adoption by whole household. Grocery + chores keep people opening the app.
- **Gap:** Weaker complex recurrence, weak external calendar federation, free tier ads, Google sync often one-way.

### TimeTree
- **Feel:** Social shared calendar — “calendar as a group chat about time.”
- **UX:** Create a Tree (shared space); events can have comments; diaries/notes per event.
- **Strength:** Couple/small-group coordination when plans change frequently.
- **Gap:** Weaker household ops (shopping/meals) than Cozi; ads on free.

### Google Calendar
- **Feel:** Industry default for reliability and federation.
- **UX:** Multiple calendars overlaid; powerful web UI; excellent invite/RSVP and 3rd-party embed.
- **Strength:** Cross-platform truth source; ICS/API; natural language on web/mobile improving.
- **Gap:** Household UX is multi-calendar gymnastics; chores/lists live elsewhere (Tasks/Keep); not family-native.

### Apple Calendar + Family Sharing
- **Feel:** Invisible infrastructure for iPhone households.
- **UX:** Best system integration (Siri, widgets, Lock Screen, Focus). Family calendar is convenient but limited vs dedicated apps.
- **Strength:** Zero extra-app friction for all-Apple couples.
- **Gap:** Weak web story; poor Android spouse support; lists split into Reminders; no grocery/meals.

### FamilyWall
- **Feel:** Family social network + organizer.
- **UX:** Calendar alongside location, messaging, lists.
- **Strength:** Safety/location + organization bundle.
- **Gap:** Heavier than many couples want; privacy tradeoffs.

### AI planners (Nori / Sense-class)
- **Feel:** “Assistant reduces the calendar,” not “you fill the calendar.”
- **UX:** Chat/voice first; proactive nudges; email→event extraction.
- **Strength:** Reduces mental load; great for busy dual-career couples.
- **Gap:** Trust, false positives, subscription cost, privacy of inbox access.

### Fantastical
- **Feel:** Premium personal calendar front-end.
- **UX:** Best-in-class natural language, sets, calendar sets, design.
- **Strength:** Superb day-to-day UX on Apple.
- **Gap:** Not a household product; per-seat cost; not the collaboration layer.

### Physical hubs (Skylight / Hearth)
- **Feel:** Kitchen source of truth.
- **Pattern to steal:** Large always-on “household wall mode,” glanceable week, photo of event, kid-friendly.

## Additive master feature inventory (do-not-miss list)

### A. Core calendar
1. Shared household calendar as default home
2. Personal overlay calendars (optional work feeds)
3. Multi-view: day / 3-day / week / month / agenda / year
4. Event CRUD with rich fields (title, when, where, people, notes, attachments)
5. Timezone-aware create/edit/display
6. Complex recurrence + exceptions (edit this/following/all)
7. All-day, multi-day, floating events
8. Travel time / buffer before/after
9. Color by person, by category, or by calendar
10. Templates (school drop-off, date night, trash day)
11. Drag-resize on web; long-press create on mobile
12. Undo / trash / archive
13. Search across events, lists, notes
14. ICS import/export + subscribe URL
15. External calendar connect (Google / iCloud / Outlook) with selective sync

### B. Collaboration
16. Household members with roles (owner/adult/kid/viewer)
17. Event assignment (“who is responsible”)
18. Per-event comments / activity feed
19. Mentions / notify specific person
20. RSVP for optional invitees
21. Change notifications with digest mode
22. Conflict warnings when two adults double-book key resource (car, babysitter)

### C. Reminders & notifications
23. Multi-offset reminders (1d, 1h, leave-now)
24. Location-based reminders (geofence)
25. Shared vs private reminders
26. Quiet hours / Do Not Disturb respect
27. Escalation (if unacked chore)
28. Email/SMS optional fallback

### D. Lists & household ops
29. Shared to-do with assignees, due dates, recurrence
30. Shopping lists with aisles/categories, quantity, checked state
31. Meal planner linked to calendar + shopping auto-add
32. Chore rotation schedules
33. Notes / household wiki snippets
34. File/photo attachments on events and lists

### E. AI & capture
35. Natural language create (“Dinner with parents Sat 6pm at home — both”)
36. Voice capture
37. Forward email / parse invite → draft event
38. Photo of flyer/paper calendar → OCR draft event
39. Smart suggestions (conflicts, travel, routines)
40. Weekly household briefing summary

### F. Mobile / delivery
41. Responsive web app (PWA install on iPhone Home Screen)
42. Push notifications (Web Push / APNs via wrapper)
43. Offline-first cache with conflict resolution
44. Home screen widgets (if native shell later)
45. Deep links from notifications to event

### G. Trust, privacy, admin
46. End-to-end or strong transport encryption posture documented
47. Private events hidden from partner (optional — product decision)
48. Audit log of who changed what
49. Data export / delete household
50. 2FA for account security

### H. Presentation modes
51. Kitchen / wall display mode (large type, week strip)
52. Printable week/month
53. Partner “today” dashboard

## Sources (representative)
- Web comparison roundups 2026: Cozi, TimeTree, Google, Apple, FamilyWall, AI planners, physical hubs
- X discourse: Cozi for lists+calendar; Apple/Google for default iPhone couples; AI planners for mental-load reduction; TimeTree for event chat
