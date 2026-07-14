# Feature mini-PRD template (Grok Build ready)

Use one file per feature: `docs/prd/features/FXX-short-name.md`

```markdown
# FXX — Feature name

**Status:** draft | ready-for-build | building | done  
**Priority:** P0 | P1 | P2 | P3  
**Depends on:** F0Y, …  
**Master PRD:** ../MASTER_PRD.md  

## 1. Problem
One paragraph: user pain this solves.

## 2. User stories
- As <persona>, I want <action>, so that <outcome>.

## 3. Functional requirements
Numbered, testable, no ambiguity.
1. …
2. …

## 4. UX specification
- Entry points
- Primary screens / components
- Empty / loading / error states
- Mobile (iPhone) interactions
- Accessibility notes

## 5. Data model
Entities, fields, indexes, privacy flags.
Include TypeScript interface sketches when ready.

## 6. API / events
Endpoints or server actions; realtime channels; push triggers.

## 7. Business rules
Recurrence, permissions, notifications, conflicts.

## 8. Edge cases
List explicitly (timezones, offline, concurrent edits, DST, deleted users…).

## 9. Acceptance criteria (Grok Build)
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Automated test command: `…`
- [ ] Manual iPhone Safari check: `…`

## 10. Out of scope
What this feature must NOT do.

## 11. Open questions
Only unresolved items; link to INTERVIEW.md IDs.

## 12. Implementation notes for Grok Build
- Files to create/modify (absolute paths after scaffold)
- Libraries allowed
- Do not ask for confirmation; implement and test
```
