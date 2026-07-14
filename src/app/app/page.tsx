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
import { eventColor, type CalendarView, type HouseholdEvent } from "@/lib/planning/types";
import { isoDate } from "@/lib/planning/types";

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

  const anchor = useMemo(
    () => startOfDay(parseISO(selectedDate + "T12:00:00")),
    [selectedDate]
  );

  const [draftTitle, setDraftTitle] = useState("");
  const [draftKind, setDraftKind] = useState<"personal" | "group">("group");
  const [draftMember, setDraftMember] = useState(members[0]?.id ?? "");
  const [draftHour, setDraftHour] = useState(10);

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
    const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [anchor, view]);

  function eventsOn(d: Date): HouseholdEvent[] {
    return events
      .filter((e) => isSameDay(parseISO(e.startsAt), d))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  function createQuick() {
    if (!draftTitle.trim()) return;
    const s = parseISO(selectedDate + "T12:00:00");
    s.setHours(draftHour, 0, 0, 0);
    const e = new Date(s);
    e.setHours(draftHour + 1, 0, 0, 0);
    addEvent({
      title: draftTitle.trim(),
      startsAt: s.toISOString(),
      endsAt: e.toISOString(),
      allDay: false,
      memberId: draftKind === "group" ? null : draftMember,
      kind: draftKind,
      priority: 3,
    });
    setDraftTitle("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {format(anchor, "MMMM yyyy")}
          </h2>
          <p className="text-sm text-muted">
            Color-coded household calendar · {view}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
            onClick={() => setSelectedDate(isoDate())}
          >
            Today
          </button>
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
            onClick={() => step(-1)}
          >
            ←
          </button>
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
            onClick={() => step(1)}
          >
            →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              view === v.id
                ? "bg-ink text-white"
                : "border border-black/10 bg-white text-muted"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {members.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-2.5 py-1 text-xs font-semibold"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: m.color }}
            />
            {m.name}
          </span>
        ))}
        <label className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-2.5 py-1 text-xs font-semibold">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: groupColor }}
          />
          Group
          <input
            type="color"
            value={groupColor}
            onChange={(e) => setGroupColor(e.target.value)}
            className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
            title="Customize group color"
          />
        </label>
      </div>

      {view === "month" ? (
        <div className="card overflow-hidden p-2">
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((d) => {
              const list = eventsOn(d);
              const inMonth = isSameMonth(d, anchor);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(isoDate(d));
                    setView("day");
                  }}
                  className={`min-h-[72px] rounded-lg border p-1 text-left ${
                    isSameDay(d, new Date())
                      ? "border-accent bg-accent/5"
                      : "border-black/5 bg-white"
                  } ${inMonth ? "" : "opacity-40"}`}
                >
                  <div className="text-[11px] font-semibold">
                    {format(d, "d")}
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {list.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className="truncate rounded px-0.5 text-[9px] font-medium text-white"
                        style={{
                          background: eventColor(e, members, groupColor),
                        }}
                      >
                        {e.title}
                      </div>
                    ))}
                    {list.length > 3 && (
                      <div className="text-[9px] text-muted">
                        +{list.length - 3}
                      </div>
                    )}
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
              ? "md:grid-cols-2"
              : view === "day"
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-3"
          }`}
        >
          {dayList.map((d) => {
            const list = eventsOn(d);
            return (
              <section key={d.toISOString()} className="card p-3">
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold">
                    {format(d, "EEE d")}
                    {isSameDay(d, new Date()) && (
                      <span className="ml-2 text-xs text-accent">Today</span>
                    )}
                  </h3>
                  <button
                    type="button"
                    className="text-xs font-semibold text-accent"
                    onClick={() => setSelectedDate(isoDate(d))}
                  >
                    Plan day
                  </button>
                </div>
                {view === "day" ? (
                  <DayHourGrid
                    date={d}
                    events={list}
                    members={members}
                    groupColor={groupColor}
                  />
                ) : list.length === 0 ? (
                  <p className="text-sm text-muted">Nothing planned</p>
                ) : (
                  <ul className="space-y-2">
                    {list.map((e) => (
                      <li
                        key={e.id}
                        className="rounded-xl bg-paper px-3 py-2 text-sm"
                        style={{
                          borderLeft: `4px solid ${eventColor(e, members, groupColor)}`,
                        }}
                      >
                        <div className="font-semibold">{e.title}</div>
                        <div className="text-xs text-muted">
                          {e.allDay
                            ? "All day"
                            : `${format(parseISO(e.startsAt), "h:mm a")} – ${format(
                                parseISO(e.endsAt),
                                "h:mm a"
                              )}`}
                          {e.kind === "group" ? " · Group" : ""}
                          {` · P${e.priority}`}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <div className="card space-y-2 p-4">
        <p className="text-sm font-semibold">Quick add event</p>
        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={draftKind}
            onChange={(e) =>
              setDraftKind(e.target.value as "personal" | "group")
            }
            className="rounded-xl border border-black/10 px-2 py-2 text-xs"
          >
            <option value="group">Group</option>
            <option value="personal">Personal</option>
          </select>
          {draftKind === "personal" && (
            <select
              value={draftMember}
              onChange={(e) => setDraftMember(e.target.value)}
              className="rounded-xl border border-black/10 px-2 py-2 text-xs"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
          <select
            value={draftHour}
            onChange={(e) => setDraftHour(Number(e.target.value))}
            className="rounded-xl border border-black/10 px-2 py-2 text-xs"
          >
            {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => (
              <option key={h} value={h}>
                {h}:00
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={createQuick}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
          >
            Add to {selectedDate}
          </button>
        </div>
      </div>
    </div>
  );
}

function DayHourGrid({
  events,
  members,
  groupColor,
}: {
  date?: Date;
  events: HouseholdEvent[];
  members: ReturnType<typeof usePlanningStore.getState>["members"];
  groupColor: string;
}) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6-20
  return (
    <div className="space-y-1">
      {hours.map((h) => {
        const slot = events.filter((e) => {
          if (e.allDay) return h === 6;
          return parseISO(e.startsAt).getHours() === h;
        });
        const label = `${h > 12 ? h - 12 : h}${h >= 12 ? "p" : "a"}`;
        return (
          <div key={h} className="flex gap-2 text-xs">
            <div className="w-10 shrink-0 pt-1 text-muted">{label}</div>
            <div className="min-h-[36px] flex-1 rounded-lg border border-dashed border-black/10 bg-white p-1">
              {slot.map((e) => (
                <div
                  key={e.id}
                  className="mb-1 rounded-md px-2 py-1 font-semibold text-white"
                  style={{
                    background: eventColor(e, members, groupColor),
                  }}
                >
                  {e.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
