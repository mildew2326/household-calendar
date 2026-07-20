"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { usePlanningStore } from "@/lib/planning/store";
import { expandEvents, eventColor, isoDate, top3Items } from "@/lib/planning/types";
import type { DailyItem } from "@/lib/planning/types";
import {
  HourTimeline,
  itemsToBlocks,
  type TimelineBlock,
} from "@/components/planning/HourTimeline";

export default function TodayPage() {
  const selectedDate = usePlanningStore((s) => s.selectedDate);
  const setSelectedDate = usePlanningStore((s) => s.setSelectedDate);
  const dailyPlans = usePlanningStore((s) => s.dailyPlans);
  const events = usePlanningStore((s) => s.events);
  const members = usePlanningStore((s) => s.members);
  const groupColor = usePlanningStore((s) => s.groupColor);
  const seedDayFromCalendar = usePlanningStore((s) => s.seedDayFromCalendar);
  const ensureDailyPlan = usePlanningStore((s) => s.ensureDailyPlan);
  const setTop3 = usePlanningStore((s) => s.setTop3);
  const toggleDailyDone = usePlanningStore((s) => s.toggleDailyDone);
  const toggleDailySkipped = usePlanningStore((s) => s.toggleDailySkipped);
  const moveDailyItem = usePlanningStore((s) => s.moveDailyItem);
  const upsertDailyItem = usePlanningStore((s) => s.upsertDailyItem);
  const removeDailyItem = usePlanningStore((s) => s.removeDailyItem);

  const [customTitle, setCustomTitle] = useState("");
  const [customMins, setCustomMins] = useState(30);

  useEffect(() => {
    ensureDailyPlan(selectedDate);
  }, [selectedDate, ensureDailyPlan]);

  const plan = dailyPlans[selectedDate];
  const items = useMemo(() => {
    const list = plan?.items ?? [];
    return [...list].sort((a, b) => {
      const ta = a.startHour * 60 + a.startMinute;
      const tb = b.startHour * 60 + b.startMinute;
      return ta - tb;
    });
  }, [plan]);

  const tops = useMemo(() => top3Items(items), [items]);

  const dayEvents = useMemo(() => {
    const start = parseISO(selectedDate + "T00:00:00");
    const end = parseISO(selectedDate + "T23:59:59");
    return expandEvents(
      events.filter((e) => !e.deleted),
      start,
      end
    );
  }, [events, selectedDate]);

  const timelineBlocks: TimelineBlock[] = useMemo(() => {
    const fromPlan = itemsToBlocks(items);
    const planIds = new Set(items.map((i) => i.sourceId).filter(Boolean));
    const fromEvents: TimelineBlock[] = dayEvents
      .filter((e) => !e.goalId || !planIds.has(e.goalId))
      .map((e) => {
        const s = parseISO(e.occurrenceStart);
        const en = parseISO(e.occurrenceEnd);
        const startMin = s.getHours() * 60 + s.getMinutes();
        const durationMin = Math.max(
          15,
          Math.round((en.getTime() - s.getTime()) / 60000) || 60
        );
        return {
          id: `ev-${e.id}-${e.occurrenceStart}`,
          title: e.title,
          startMin: e.allDay ? 9 * 60 : startMin,
          durationMin: e.allDay ? 60 : durationMin,
          soft: !!(e.goalId && e.priority > 1),
          color: eventColor(e, members, groupColor),
          subtitle: e.allDay ? "All day" : undefined,
        };
      });
    // prefer plan items over duplicate calendar goal blocks
    return [...fromPlan, ...fromEvents];
  }, [items, dayEvents, members, groupColor]);

  // auto-expand visible range to cover blocks
  const { startHour, endHour } = useMemo(() => {
    let minH = 6;
    let maxH = 21;
    for (const b of timelineBlocks) {
      minH = Math.min(minH, Math.floor(b.startMin / 60));
      maxH = Math.max(
        maxH,
        Math.ceil((b.startMin + b.durationMin) / 60)
      );
    }
    return {
      startHour: Math.max(5, minH),
      endHour: Math.min(24, Math.max(maxH, minH + 1)),
    };
  }, [timelineBlocks]);

  function promoteTop3(id: string) {
    const current = items
      .filter((i) => i.isTop3)
      .sort((a, b) => (a.top3Rank ?? 9) - (b.top3Rank ?? 9))
      .map((i) => i.id);
    let next = current.filter((x) => x !== id);
    if (current.includes(id)) {
      setTop3(selectedDate, next);
      return;
    }
    next = [...next, id].slice(-3);
    setTop3(selectedDate, next);
  }

  function addCustom() {
    if (!customTitle.trim()) return;
    const item: DailyItem = {
      id: crypto.randomUUID(),
      sourceType: "custom",
      title: customTitle.trim(),
      startHour: 12,
      startMinute: 0,
      durationMinutes: Math.max(15, customMins),
      done: false,
      skipped: false,
      isTop3: false,
      top3Rank: null,
    };
    upsertDailyItem(selectedDate, item);
    setCustomTitle("");
  }

  function setDuration(id: string, minutes: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    upsertDailyItem(selectedDate, {
      ...item,
      durationMinutes: Math.max(15, minutes),
    });
  }

  const hours = Array.from({ length: 18 }, (_, i) => i + 5);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Today</h2>
          <p className="text-sm text-muted">
            Top 3 · proportional hour grid · flexible checklist
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-xl border border-black/10 px-2 py-1.5 text-xs"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
          onClick={() => setSelectedDate(isoDate())}
        >
          Jump to today
        </button>
        <button
          type="button"
          className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white"
          onClick={() => seedDayFromCalendar(selectedDate)}
        >
          Pull calendar + goals into day
        </button>
      </div>

      <section className="card p-4">
        <h3 className="text-sm font-semibold">Top 3 for the day</h3>
        <p className="mb-2 text-xs text-muted">
          Tap ★ on items below to set / clear priorities (max 3).
        </p>
        {tops.length === 0 ? (
          <p className="text-sm text-muted">No top priorities set yet.</p>
        ) : (
          <ol className="space-y-2">
            {tops.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2 text-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {t.top3Rank}
                </span>
                <span
                  className={`flex-1 font-semibold ${
                    t.done ? "text-muted line-through" : ""
                  }`}
                >
                  {t.title}
                </span>
                <span className="text-xs text-muted">{t.durationMinutes}m</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-accent"
                  onClick={() => toggleDailyDone(selectedDate, t.id)}
                >
                  {t.done ? "Undo" : "Done"}
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">
          Hour-by-hour ·{" "}
          {format(parseISO(selectedDate + "T12:00:00"), "EEE MMM d")}
        </h3>
        <p className="text-xs text-muted">
          Duration is drawn to scale. A 120‑minute block fills two hours of the
          grid, aligned to its start time.
        </p>
        <HourTimeline
          startHour={startHour}
          endHour={endHour}
          blocks={timelineBlocks}
          hoursForMove={hours}
          onMoveStartHour={(id, hour, minute) => {
            if (id.startsWith("ev-")) return; // calendar events moved via Cal
            moveDailyItem(selectedDate, id, hour, minute);
          }}
        />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Editable checklist</h3>
        <div className="flex flex-wrap gap-2">
          <input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Add custom item"
            className="min-w-[10rem] flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
          />
          <select
            value={customMins}
            onChange={(e) => setCustomMins(Number(e.target.value))}
            className="rounded-xl border border-black/10 px-2 text-xs font-semibold"
          >
            {[15, 30, 45, 60, 90, 120, 180].map((m) => (
              <option key={m} value={m}>
                {m}m
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addCustom}
            className="rounded-full bg-ink px-4 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="card flex items-start gap-2 p-3 text-sm">
              <button
                type="button"
                onClick={() => toggleDailyDone(selectedDate, i.id)}
                className={`mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 ${
                  i.done ? "border-accent bg-accent" : "border-black/20"
                }`}
                aria-label="Toggle done"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`font-semibold ${
                    i.done || i.skipped ? "text-muted line-through" : ""
                  }`}
                >
                  {i.title}
                </p>
                <p className="text-xs text-muted">
                  {String(i.startHour).padStart(2, "0")}:
                  {String(i.startMinute).padStart(2, "0")} →{" "}
                  {fmtEnd(i.startHour, i.startMinute, i.durationMinutes)} ·{" "}
                  {i.durationMinutes}m · {i.sourceType}
                  {i.skipped ? " · skipped" : ""}
                </p>
                <label className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                  Length
                  <select
                    value={i.durationMinutes}
                    onChange={(e) => setDuration(i.id, Number(e.target.value))}
                    className="rounded border border-black/10 px-1 py-0.5 text-[11px] font-semibold text-ink"
                  >
                    {[15, 30, 45, 60, 90, 120, 150, 180, 240].map((m) => (
                      <option key={m} value={m}>
                        {m}m
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => promoteTop3(i.id)}
                  className={`text-xs font-semibold ${
                    i.isTop3 ? "text-amber-600" : "text-muted"
                  }`}
                >
                  {i.isTop3 ? `★${i.top3Rank}` : "★ Top"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleDailySkipped(selectedDate, i.id)}
                  className="text-xs font-semibold text-muted"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => removeDailyItem(selectedDate, i.id)}
                  className="text-xs font-semibold text-red-700"
                >
                  Del
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function fmtEnd(h: number, m: number, dur: number) {
  const end = h * 60 + m + dur;
  const eh = Math.floor(end / 60) % 24;
  const em = end % 60;
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}
