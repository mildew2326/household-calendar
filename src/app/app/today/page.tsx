"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { usePlanningStore } from "@/lib/planning/store";
import { isoDate, top3Items } from "@/lib/planning/types";
import type { DailyItem } from "@/lib/planning/types";

export default function TodayPage() {
  const selectedDate = usePlanningStore((s) => s.selectedDate);
  const setSelectedDate = usePlanningStore((s) => s.setSelectedDate);
  const dailyPlans = usePlanningStore((s) => s.dailyPlans);
  const seedDayFromCalendar = usePlanningStore((s) => s.seedDayFromCalendar);
  const ensureDailyPlan = usePlanningStore((s) => s.ensureDailyPlan);
  const setTop3 = usePlanningStore((s) => s.setTop3);
  const toggleDailyDone = usePlanningStore((s) => s.toggleDailyDone);
  const toggleDailySkipped = usePlanningStore((s) => s.toggleDailySkipped);
  const moveDailyItem = usePlanningStore((s) => s.moveDailyItem);
  const upsertDailyItem = usePlanningStore((s) => s.upsertDailyItem);
  const removeDailyItem = usePlanningStore((s) => s.removeDailyItem);

  const [customTitle, setCustomTitle] = useState("");

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
      durationMinutes: 30,
      done: false,
      skipped: false,
      isTop3: false,
      top3Rank: null,
    };
    upsertDailyItem(selectedDate, item);
    setCustomTitle("");
  }

  const hours = Array.from({ length: 15 }, (_, i) => i + 6);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Today</h2>
          <p className="text-sm text-muted">
            Top 3 · hour grid · flexible checklist
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

      <section className="card p-4">
        <h3 className="mb-2 text-sm font-semibold">
          Hour-by-hour · {format(parseISO(selectedDate + "T12:00:00"), "EEE MMM d")}
        </h3>
        <div className="space-y-1">
          {hours.map((h) => {
            const slot = items.filter(
              (i) => !i.skipped && i.startHour === h
            );
            return (
              <div key={h} className="flex gap-2 text-xs">
                <div className="w-10 shrink-0 pt-2 text-muted">{h}:00</div>
                <div className="min-h-[40px] flex-1 space-y-1 rounded-lg border border-dashed border-black/10 bg-white p-1">
                  {slot.map((i) => (
                    <div
                      key={i.id}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                        i.done ? "bg-accent/15" : "bg-paper"
                      }`}
                    >
                      <span
                        className={`flex-1 font-semibold ${
                          i.done ? "line-through text-muted" : ""
                        }`}
                      >
                        {i.isTop3 ? `★${i.top3Rank} ` : ""}
                        {i.title}
                        <span className="ml-1 font-normal text-muted">
                          {i.durationMinutes}m
                        </span>
                      </span>
                      <select
                        value={i.startHour}
                        onChange={(e) =>
                          moveDailyItem(
                            selectedDate,
                            i.id,
                            Number(e.target.value),
                            i.startMinute
                          )
                        }
                        className="rounded border border-black/10 text-[10px]"
                      >
                        {hours.map((hh) => (
                          <option key={hh} value={hh}>
                            {hh}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Editable checklist</h3>
        <div className="flex gap-2">
          <input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Add custom item"
            className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
          />
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
                  {i.startHour}:{String(i.startMinute).padStart(2, "0")} ·{" "}
                  {i.durationMinutes}m · {i.sourceType}
                  {i.skipped ? " · skipped" : ""}
                </p>
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
