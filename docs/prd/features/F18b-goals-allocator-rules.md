# F18b — Goals allocator rules (interview-locked)

## Scheduling
- User sets **target end date** on each goal.
- User paints **per-day focus windows** for the week.
- Duet **works backward from target date**, packing sessions into free space inside windows.
- **P1 = protected** (full opacity, hard hold unless user moves).
- **P2–P5 = soft** (always on calendar, **faded**; yield to real events).
- Real events never auto-move; goal blocks shift/skip on conflict.
- Today only receives goal sessions after **Pull goals into Today**.
- Goal completion = **milestone checklist**, not session count alone.
- Sessions mostly **individual** owner.

## Rendering
- Soft goal blocks: faded/opacity ~0.45–0.55, dashed border optional.
- Protected: solid member color, same weight as appointments.

## Create today's schedule (day goals)
- User selects a **focus window** for that day (start–end hour).
- User runs **Create today's schedule**.
- Duet allocates the window across **all active goals** (for the acting person):
  - Weight by **remaining minutes**, **lagging progress** (low % / near deadline gets more time), and priority.
  - **Minimum share** so one goal cannot monopolize while others stall.
  - **Never overwrite** real calendar events inside the window (pack free gaps only).
- P1 blocks protected; soft blocks still scheduled but faded on calendar.
- Allocations land on **Today hour plan** + faded/soft calendar events for the day.
