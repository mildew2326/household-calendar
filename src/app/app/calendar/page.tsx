"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { usePlanningStore } from "@/lib/planning/store";
import {
  eventColor,
  expandEvents,
  isoDate,
  type CalendarView,
  type HouseholdEvent,
  type Priority,
} from "@/lib/planning/types";

export default function CalendarPage() {
  const events = usePlanningStore((s) => s.events);
  const members = usePlanningStore((s) => s.members);
  const groupColor = usePlanningStore((s) => s.groupColor);
  const setGroupColor = usePlanningStore((s) => s.setGroupColor);
  const view = usePlanningStore((s) => s.calendarView);
  const setView = usePlanningStore((s) => s.setCalendarView);
  const selectedDate = usePlanningStore((s) => s.selectedDate);
  const setSelectedDate = usePlanningStore((s) => s.setSelectedDate);
  const addEvent = usePlanningStore((s) => s.addEvent);
  const updateEvent = usePlanningStore((s) => s.updateEvent);
  const removeEvent = usePlanningStore((s) => s.removeEvent);
  const addEventComment = usePlanningStore((s) => s.addEventComment);
  const addEventFromNL = usePlanningStore((s) => s.addEventFromNL);

  const [mode, setMode] = useState<"grid" | "agenda">("grid");
  const [query, setQuery] = useState("");
  const [nl, setNl] = useState("");
  const [editing, setEditing] = useState<HouseholdEvent | null>(null);
  const [comment, setComment] = useState("");

  const anchor = useMemo(
    () => startOfDay(parseISO(selectedDate + "T12:00:00")),
    [selectedDate]
  );

  const views: { id: CalendarView; label: string }[] = [
    { id: "day", label: "Day" },
    { id: "threeDay", label: "3-day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
  ];

  function step(dir: -1 | 1) {
    const d = parseISO(selectedDate + "T12:00:00");
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else if (view === "threeDay") d.setDate(d.getDate() + dir * 3);
    else d.setDate(d.getDate() + dir);
    setSelectedDate(isoDate(d));
  }

  const range = useMemo(() => {
    if (view === "day") {
      return { start: anchor, end: addDays(anchor, 1) };
    }
    if (view === "threeDay") {
      return { start: anchor, end: addDays(anchor, 3) };
    }
    if (view === "week") {
      const s = startOfWeek(anchor, { weekStartsOn: 1 });
      return { start: s, end: addDays(s, 7) };
    }
    const s = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    const e = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
    return { start: s, end: e };
  }, [anchor, view]);

  const expanded = useMemo(
    () => expandEvents(events.filter((e) => !e.deleted), range.start, range.end),
    [events, range]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return expanded;
    return expanded.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q)
    );
  }, [expanded, query]);

  const dayList = useMemo(() => {
    if (view === "day") return [anchor];
    if (view === "threeDay")
      return Array.from({ length: 3 }, (_, i) => addDays(anchor, i));
    if (view === "week") {
      const s = startOfWeek(anchor, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(s, i));
    }
    return [];
  }, [anchor, view]);

  const monthDays = useMemo(() => {
    if (view !== "month") return [];
    return eachDayOfInterval({ start: range.start, end: range.end });
  }, [view, range]);

  function eventsOn(d: Date) {
    return filtered.filter((e) => isSameDay(parseISO(e.occurrenceStart), d));
  }

  function openNew() {
    const s = parseISO(selectedDate + "T10:00:00");
    const e = new Date(s);
    e.setHours(11);
    setEditing({
      id: "",
      title: "",
      startsAt: s.toISOString(),
      endsAt: e.toISOString(),
      allDay: false,
      memberId: null,
      kind: "group",
      priority: 3,
      notes: "",
      location: "",
      recurrence: null,
      reminderMinutes: [60, 1440],
      comments: [],
    });
  }

  function saveEditing() {
    if (!editing || !editing.title.trim()) return;
    if (!editing.id) {
      addEvent({
        title: editing.title.trim(),
        startsAt: editing.startsAt,
        endsAt: editing.endsAt,
        allDay: editing.allDay,
        memberId: editing.kind === "group" ? null : editing.memberId,
        kind: editing.kind,
        priority: editing.priority,
        notes: editing.notes,
        location: editing.location,
        recurrence: editing.recurrence,
        reminderMinutes: editing.reminderMinutes,
        comments: [],
      });
    } else {
      updateEvent(editing.id, {
        title: editing.title.trim(),
        startsAt: editing.startsAt,
        endsAt: editing.endsAt,
        allDay: editing.allDay,
        memberId: editing.kind === "group" ? null : editing.memberId,
        kind: editing.kind,
        priority: editing.priority,
        notes: editing.notes,
        location: editing.location,
        recurrence: editing.recurrence,
        reminderMinutes: editing.reminderMinutes,
      });
    }
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {format(anchor, "MMMM yyyy")}
          </h2>
          <p className="text-sm text-muted">Shared calendar · {view}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <button type="button" className="chip" onClick={() => setSelectedDate(isoDate())}>
            Today
          </button>
          <button type="button" className="chip" onClick={() => step(-1)}>
            ←
          </button>
          <button type="button" className="chip" onClick={() => step(1)}>
            →
          </button>
          <button type="button" className="chip-solid" onClick={openNew}>
            + Event
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={view === v.id ? "chip-solid" : "chip"}
          >
            {v.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMode(mode === "grid" ? "agenda" : "grid")}
          className="chip"
        >
          {mode === "grid" ? "Agenda" : "Grid"}
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search events, places, notes…"
        className="field"
      />

      <div className="flex gap-2">
        <input
          value={nl}
          onChange={(e) => setNl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && nl.trim()) {
              addEventFromNL(nl);
              setNl("");
            }
          }}
          placeholder='Natural language: "Dinner Friday 6:30pm"'
          className="field"
        />
        <button
          type="button"
          className="chip-solid shrink-0"
          onClick={() => {
            if (nl.trim()) {
              addEventFromNL(nl);
              setNl("");
            }
          }}
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {members.map((m) => (
          <span key={m.id} className="legend">
            <i style={{ background: m.color }} />
            {m.name}
          </span>
        ))}
        <label className="legend">
          <i style={{ background: groupColor }} />
          Group
          <input
            type="color"
            value={groupColor}
            onChange={(e) => setGroupColor(e.target.value)}
            className="ml-1 h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
      </div>

      {mode === "agenda" ? (
        <ul className="space-y-2">
          {filtered.length === 0 && (
            <li className="card p-4 text-sm text-muted">No matching events.</li>
          )}
          {filtered.map((e) => (
            <li key={e.id + e.occurrenceStart}>
              <button
                type="button"
                className="card w-full px-4 py-3 text-left"
                style={{
                  borderLeft: `4px solid ${eventColor(e, members, groupColor)}`,
                }}
                onClick={() => {
                  const base = events.find((x) => x.id === e.id);
                  if (base) setEditing({ ...base });
                }}
              >
                <p className="text-[11px] font-bold text-muted uppercase">
                  {format(parseISO(e.occurrenceStart), "EEE MMM d")}
                </p>
                <p className="font-semibold">{e.title}</p>
                <p className="text-xs text-muted">
                  {e.allDay
                    ? "All day"
                    : format(parseISO(e.occurrenceStart), "h:mm a")}
                  {e.location ? ` · ${e.location}` : ""}
                  {e.recurrence ? ` · repeats ${e.recurrence.toLowerCase()}` : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : view === "month" ? (
        <div className="card overflow-hidden p-2">
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((d) => {
              const list = eventsOn(d);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(isoDate(d));
                    setView("day");
                  }}
                  className={`min-h-[72px] rounded-xl border p-1 text-left ${
                    isSameDay(d, new Date())
                      ? "border-accent bg-accent/5"
                      : "border-black/5 bg-white"
                  } ${isSameMonth(d, anchor) ? "" : "opacity-40"}`}
                >
                  <div className="text-[11px] font-semibold">{format(d, "d")}</div>
                  <div className="mt-0.5 space-y-0.5">
                    {list.slice(0, 3).map((e) => (
                      <div
                        key={e.id + e.occurrenceStart}
                        className="truncate rounded px-0.5 text-[9px] font-medium text-white"
                        style={{ background: eventColor(e, members, groupColor) }}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className={`grid gap-3 ${
            view === "week"
              ? "sm:grid-cols-2"
              : view === "day"
                ? "grid-cols-1"
                : "sm:grid-cols-3"
          }`}
        >
          {dayList.map((d) => {
            const list = eventsOn(d);
            return (
              <section key={d.toISOString()} className="card p-3">
                <h3 className="mb-2 text-sm font-semibold">
                  {format(d, "EEE d")}
                  {isSameDay(d, new Date()) && (
                    <span className="ml-2 text-xs text-accent">Today</span>
                  )}
                </h3>
                {list.length === 0 ? (
                  <p className="text-sm text-muted">Free</p>
                ) : (
                  <ul className="space-y-2">
                    {list.map((e) => (
                      <li key={e.id + e.occurrenceStart}>
                        <button
                          type="button"
                          className="w-full rounded-xl bg-paper px-3 py-2 text-left text-sm"
                          style={{
                            borderLeft: `4px solid ${eventColor(e, members, groupColor)}`,
                          }}
                          onClick={() => {
                            const base = events.find((x) => x.id === e.id);
                            if (base) setEditing({ ...base });
                          }}
                        >
                          <div className="font-semibold">{e.title}</div>
                          <div className="text-xs text-muted">
                            {e.allDay
                              ? "All day"
                              : format(parseISO(e.occurrenceStart), "h:mm a")}
                            {e.kind === "group" ? " · Group" : ""}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 backdrop-blur-[2px] sm:items-center">
          <div className="card max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {editing.id ? "Edit event" : "New event"}
              </h3>
              <button
                type="button"
                className="text-xs font-semibold text-muted"
                onClick={() => setEditing(null)}
              >
                Close
              </button>
            </div>
            <input
              className="field"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Title"
            />
            <input
              className="field"
              value={editing.location || ""}
              onChange={(e) =>
                setEditing({ ...editing, location: e.target.value })
              }
              placeholder="Location"
            />
            <textarea
              className="field min-h-[72px]"
              value={editing.notes || ""}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              placeholder="Notes"
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-semibold text-muted">
                Start
                <input
                  type="datetime-local"
                  className="field mt-1"
                  value={toLocalInput(editing.startsAt)}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      startsAt: fromLocalInput(e.target.value),
                    })
                  }
                />
              </label>
              <label className="text-xs font-semibold text-muted">
                End
                <input
                  type="datetime-local"
                  className="field mt-1"
                  value={toLocalInput(editing.endsAt)}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      endsAt: fromLocalInput(e.target.value),
                    })
                  }
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="field"
                value={editing.kind}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    kind: e.target.value as "group" | "personal",
                  })
                }
              >
                <option value="group">Group</option>
                <option value="personal">Personal</option>
              </select>
              {editing.kind === "personal" && (
                <select
                  className="field"
                  value={editing.memberId ?? members[0]?.id}
                  onChange={(e) =>
                    setEditing({ ...editing, memberId: e.target.value })
                  }
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
              <select
                className="field"
                value={editing.recurrence || ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    recurrence: e.target.value || null,
                  })
                }
              >
                <option value="">No repeat</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
              <select
                className="field"
                value={editing.priority}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    priority: Number(e.target.value) as Priority,
                  })
                }
              >
                {[1, 2, 3, 4, 5].map((p) => (
                  <option key={p} value={p}>
                    Priority {p}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={!!editing.reminderMinutes?.includes(60)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    reminderMinutes: e.target.checked ? [60, 1440] : [],
                  })
                }
              />
              Remind 1 day + 1 hour before
            </label>

            {editing.id && (
              <div className="space-y-2 rounded-2xl bg-paper p-3">
                <p className="text-xs font-bold tracking-wide text-muted uppercase">
                  Comments
                </p>
                <ul className="space-y-1 text-sm">
                  {(editing.comments ?? []).map((c) => {
                    const who = members.find((m) => m.id === c.authorId)?.name;
                    return (
                      <li key={c.id}>
                        <span className="font-semibold">{who}: </span>
                        {c.body}
                      </li>
                    );
                  })}
                  {!editing.comments?.length && (
                    <li className="text-xs text-muted">No comments yet</li>
                  )}
                </ul>
                <div className="flex gap-2">
                  <input
                    className="field"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a note for your partner"
                  />
                  <button
                    type="button"
                    className="chip-solid"
                    onClick={() => {
                      addEventComment(editing.id, comment);
                      setComment("");
                      const fresh = usePlanningStore
                        .getState()
                        .events.find((x) => x.id === editing.id);
                      if (fresh) setEditing({ ...fresh });
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button type="button" className="chip-solid flex-1" onClick={saveEditing}>
                Save
              </button>
              {editing.id && (
                <button
                  type="button"
                  className="chip text-red-700"
                  onClick={() => {
                    removeEvent(editing.id);
                    setEditing(null);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string) {
  return new Date(v).toISOString();
}
