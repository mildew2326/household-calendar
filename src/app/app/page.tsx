"use client";

import { useEffect, useMemo } from "react";
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

export default function TodayHomePage() {
  const selectedDate = usePlanningStore((s) => s.selectedDate);
  const setSelectedDate = usePlanningStore((s) => s.setSelectedDate);
  const events = usePlanningStore((s) => s.events);
  const members = usePlanningStore((s) => s.members);
  const groupColor = usePlanningStore((s) => s.groupColor);
  const dailyPlans = usePlanningStore((s) => s.dailyPlans);
  const seedDayFromCalendar = usePlanningStore((s) => s.seedDayFromCalendar);
  const ensureDailyPlan = usePlanningStore((s) => s.ensureDailyPlan);
  const toggleDailyDone = usePlanningStore((s) => s.toggleDailyDone);
  const setTop3 = usePlanningStore((s) => s.setTop3);
  const activity = usePlanningStore((s) => s.activity);
  const shoppingExtra = usePlanningStore((s) => s.shoppingExtra);

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
      (a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute)
    );
  }, [dailyPlans, selectedDate]);

  const tops = useMemo(() => top3Items(planItems), [planItems]);
  const openShop = shoppingExtra.filter((s) => !s.checked).length;
  const reminders = useMemo(
    () => upcomingReminders(events.filter((e) => !e.deleted), new Date(), 60 * 12),
    [events]
  );

  const isToday = selectedDate === isoDate();

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
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold"
            >
              Build day plan
            </button>
          </div>
        </div>
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
            No top 3 yet. Build day plan, then star items in the planner.
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
              .slice(0, 4)
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
          <h3 className="text-sm font-semibold">Schedule</h3>
          <Link
            href="/app/calendar"
            className="text-xs font-semibold text-accent"
          >
            Calendar
          </Link>
        </div>
        {dayEvents.length === 0 ? (
          <p className="text-sm text-muted">Nothing on the calendar.</p>
        ) : (
          <ul className="space-y-2">
            {dayEvents.map((e) => (
              <li
                key={e.id + e.occurrenceStart}
                className="rounded-2xl bg-paper px-3 py-2.5"
                style={{
                  borderLeft: `4px solid ${eventColor(e, members, groupColor)}`,
                }}
              >
                <p className="text-sm font-semibold">{e.title}</p>
                <p className="text-xs text-muted">
                  {e.allDay
                    ? "All day"
                    : `${format(parseISO(e.occurrenceStart), "h:mm a")} – ${format(
                        parseISO(e.occurrenceEnd),
                        "h:mm a"
                      )}`}
                  {e.location ? ` · ${e.location}` : ""}
                  {e.recurrence ? ` · ${e.recurrence.toLowerCase()}` : ""}
                  {e.kind === "group" ? " · Group" : ""}
                </p>
              </li>
            ))}
          </ul>
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
        <Link
          href="/app/lists"
          className="card px-4 py-4 text-sm font-semibold"
        >
          Lists & shopping →
        </Link>
        <Link
          href="/app/more"
          className="card px-4 py-4 text-sm font-semibold"
        >
          Goals & labs →
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
