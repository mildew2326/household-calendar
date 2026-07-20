"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { usePlanningStore } from "@/lib/planning/store";
import {
  expandEvents,
  eventColor,
  isoDate,
  top3Items,
  upcomingReminders,
} from "@/lib/planning/types";
import { goalPercent, remainingMinutes } from "@/lib/planning/goal-math";
import {
  HourTimeline,
  itemsToBlocks,
} from "@/components/planning/HourTimeline";

export default function TodayHomePage() {
  const selectedDate = usePlanningStore((s) => s.selectedDate);
  const setSelectedDate = usePlanningStore((s) => s.setSelectedDate);
  const events = usePlanningStore((s) => s.events);
  const members = usePlanningStore((s) => s.members);
  const groupColor = usePlanningStore((s) => s.groupColor);
  const dailyPlans = usePlanningStore((s) => s.dailyPlans);
  const goals = usePlanningStore((s) => s.goals);
  const seedDayFromCalendar = usePlanningStore((s) => s.seedDayFromCalendar);
  const ensureDailyPlan = usePlanningStore((s) => s.ensureDailyPlan);
  const toggleDailyDone = usePlanningStore((s) => s.toggleDailyDone);
  const setTop3 = usePlanningStore((s) => s.setTop3);
  const activity = usePlanningStore((s) => s.activity);
  const shoppingExtra = usePlanningStore((s) => s.shoppingExtra);
  const activeMemberId = usePlanningStore((s) => s.activeMemberId);

  const [winStart, setWinStart] = useState(9);
  const [winEnd, setWinEnd] = useState(17);
  const [allocMsg, setAllocMsg] = useState<string | null>(null);

  useEffect(() => {
    ensureDailyPlan(selectedDate);
  }, [selectedDate, ensureDailyPlan]);

  const dayStart = useMemo(
    () => parseISO(selectedDate + "T00:00:00"),
    [selectedDate]
  );
  const dayEnd = useMemo(
    () => parseISO(selectedDate + "T23:59:59"),
    [selectedDate]
  );

  const dayEvents = useMemo(
    () =>
      expandEvents(
        events.filter((e) => !e.deleted),
        dayStart,
        dayEnd
      ),
    [events, dayStart, dayEnd]
  );

  const planItems = useMemo(() => {
    const items = dailyPlans[selectedDate]?.items ?? [];
    return [...items].sort(
      (a, b) =>
        a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute)
    );
  }, [dailyPlans, selectedDate]);

  const tops = useMemo(() => top3Items(planItems), [planItems]);
  const openShop = shoppingExtra.filter((s) => !s.checked).length;
  const reminders = useMemo(
    () =>
      upcomingReminders(
        events.filter((e) => !e.deleted),
        new Date(),
        60 * 12
      ),
    [events]
  );

  const myGoals = useMemo(
    () =>
      goals.filter(
        (g) =>
          g.status === "active" &&
          (!g.memberIds.length || g.memberIds.includes(activeMemberId))
      ),
    [goals, activeMemberId]
  );

  const isToday = selectedDate === isoDate();

  function runDayAlloc() {
    // Full pull: calendar events keep true times; goals fill free window time
    const n = seedDayFromCalendar(selectedDate, winStart, winEnd);
    setAllocMsg(
      n
        ? `Allocated ${n} timed block(s) into ${winStart}:00–${winEnd}:00. Events keep real start/end; goals packed into free gaps by remaining work + progress.`
        : "Nothing to schedule — free the window or add goals/events."
    );
  }

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[28px] bg-ink px-5 py-5 text-white shadow-xl shadow-black/10">
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-accent/30 blur-2xl" />
        <div className="relative">
          <p className="text-[11px] font-bold tracking-[0.14em] text-white/60 uppercase">
            {isToday ? "Today" : "Selected day"}
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">
            {format(dayStart, "EEEE")}
          </h2>
          <p className="text-sm text-white/70">
            {format(dayStart, "MMMM d, yyyy")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white"
            />
            <button
              type="button"
              onClick={() => setSelectedDate(isoDate())}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold"
            >
              Jump to today
            </button>
            <button
              type="button"
              onClick={() => seedDayFromCalendar(selectedDate)}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold"
            >
              Pull calendar
            </button>
          </div>
        </div>
      </section>

      <section className="card space-y-3 p-4">
        <div>
          <h3 className="text-sm font-semibold">Create today&apos;s schedule</h3>
          <p className="text-xs text-muted">
            Pick a focus window (required). Calendar events keep real start/end
            times. Goals fill free gaps with allocated minutes from remaining
            work + progress — never stacked into one hour.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-muted">
            From
            <select
              className="field mt-1"
              value={winStart}
              onChange={(e) => setWinStart(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-muted">
            To
            <select
              className="field mt-1"
              value={winEnd}
              onChange={(e) => setWinEnd(Number(e.target.value))}
            >
              {Array.from({ length: 25 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={runDayAlloc}
            className="rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-white"
          >
            Create schedule
          </button>
        </div>
        {myGoals.length > 0 && (
          <ul className="space-y-1.5 border-t border-black/5 pt-3">
            {myGoals.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="font-semibold">{g.title}</span>
                <span className="text-muted">
                  {goalPercent({ ...g, sections: g.sections ?? [] })}% ·{" "}
                  {remainingMinutes({ ...g, sections: g.sections ?? [] })}m left
                  {g.priority === 1 ? " · P1" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        {allocMsg && (
          <p className="rounded-xl bg-accent/10 px-3 py-2 text-xs font-medium">
            {allocMsg}
          </p>
        )}
      </section>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Events" value={String(dayEvents.length)} />
        <Stat label="Top 3" value={String(tops.length)} />
        <Stat label="Shop left" value={String(openShop)} />
      </div>

      {reminders.length > 0 && (
        <section className="card border-accent/20 p-4">
          <h3 className="text-xs font-bold tracking-wide text-accent uppercase">
            Coming up
          </h3>
          <ul className="mt-2 space-y-2">
            {reminders.slice(0, 3).map((r, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="font-semibold">{r.event.title}</span>
                <span className="text-xs text-muted">
                  {r.minutesBefore >= 60
                    ? `${Math.round(r.minutesBefore / 60)}h before`
                    : `${r.minutesBefore}m before`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Top 3 priorities</h3>
          <Link href="/app/today" className="text-xs font-semibold text-accent">
            Full planner
          </Link>
        </div>
        {tops.length === 0 ? (
          <p className="text-sm text-muted">
            Create a schedule or pull calendar, then star up to 3 items.
          </p>
        ) : (
          <ol className="space-y-2">
            {tops.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-2xl bg-paper px-3 py-2.5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {t.top3Rank}
                </span>
                <span
                  className={`flex-1 text-sm font-semibold ${
                    t.done ? "text-muted line-through" : ""
                  }`}
                >
                  {t.title}
                </span>
                <button
                  type="button"
                  onClick={() => toggleDailyDone(selectedDate, t.id)}
                  className="text-xs font-semibold text-accent"
                >
                  {t.done ? "Undo" : "Done"}
                </button>
              </li>
            ))}
          </ol>
        )}
        {planItems.length > 0 && tops.length < 3 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {planItems
              .filter((i) => !i.isTop3 && !i.skipped)
              .slice(0, 6)
              .map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => {
                    const current = planItems
                      .filter((x) => x.isTop3)
                      .sort((a, b) => (a.top3Rank ?? 9) - (b.top3Rank ?? 9))
                      .map((x) => x.id);
                    setTop3(selectedDate, [...current, i.id].slice(0, 3));
                  }}
                  className="rounded-full border border-black/8 bg-white px-2.5 py-1 text-[11px] font-semibold text-muted"
                >
                  ★ {i.title}
                </button>
              ))}
          </div>
        )}
      </section>

      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Day schedule</h3>
          <Link href="/app/today" className="text-xs font-semibold text-accent">
            Full planner
          </Link>
        </div>
        {planItems.length === 0 ? (
          <p className="text-sm text-muted">
            Empty — set a window above and Create schedule.
          </p>
        ) : (
          <HourTimeline
            startHour={Math.max(
              0,
              Math.min(6, ...planItems.map((i) => i.startHour))
            )}
            endHour={Math.min(
              24,
              Math.max(
                22,
                ...planItems.map((i) =>
                  Math.ceil(
                    (i.startHour * 60 +
                      i.startMinute +
                      Math.max(15, i.durationMinutes)) /
                      60
                  )
                )
              ) + 1
            )}
            blocks={itemsToBlocks(planItems)}
          />
        )}
      </section>

      <section className="card p-4">
        <h3 className="mb-2 text-sm font-semibold">Household pulse</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-muted">No activity yet.</p>
        ) : (
          <ul className="space-y-2">
            {activity.slice(0, 5).map((a) => {
              const who = members.find((m) => m.id === a.actorId);
              return (
                <li key={a.id} className="flex items-start gap-2 text-sm">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: who?.color ?? "#94a3b8" }}
                  />
                  <div>
                    <p className="font-medium">{a.message}</p>
                    <p className="text-[11px] text-muted">
                      {format(parseISO(a.at), "MMM d · h:mm a")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-2 gap-2 pb-2">
        <Link href="/app/goals" className="card px-4 py-4 text-sm font-semibold">
          Goals & milestones →
        </Link>
        <Link href="/app/lists" className="card px-4 py-4 text-sm font-semibold">
          Lists & shopping →
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-3 py-3 text-center">
      <p className="text-xl font-semibold tracking-tight">{value}</p>
      <p className="text-[10px] font-bold tracking-wide text-muted uppercase">
        {label}
      </p>
    </div>
  );
}
