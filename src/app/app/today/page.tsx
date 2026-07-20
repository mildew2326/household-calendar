"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { usePlanningStore } from "@/lib/planning/store";
import { isoDate, top3Items } from "@/lib/planning/types";
import type { DailyItem } from "@/lib/planning/types";
import {
  HourTimeline,
  itemsToBlocks,
} from "@/components/planning/HourTimeline";

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
  const [customMins, setCustomMins] = useState(120);
  const [customHour, setCustomHour] = useState(10);
  const [pullStart, setPullStart] = useState(9);
  const [pullEnd, setPullEnd] = useState(17);
  const [msg, setMsg] = useState<string | null>(null);

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
  const timelineBlocks = useMemo(() => itemsToBlocks(items), [items]);

  const { startHour, endHour } = useMemo(() => {
    if (!timelineBlocks.length) return { startHour: 6, endHour: 22 };
    let minM = Infinity;
    let maxM = -Infinity;
    for (const b of timelineBlocks) {
      minM = Math.min(minM, b.startMin);
      maxM = Math.max(maxM, b.startMin + b.durationMin);
    }
    const startHour = Math.max(0, Math.floor(minM / 60) - 1);
    const endHour = Math.min(24, Math.ceil(maxM / 60) + 1);
    return {
      startHour: Math.min(startHour, 6),
      endHour: Math.max(endHour, 22),
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

  function pullDay() {
    const n = seedDayFromCalendar(selectedDate, pullStart, pullEnd);
    setMsg(
      `Pulled ${n} timed block(s) into ${String(pullStart).padStart(2, "0")}:00–${String(pullEnd).padStart(2, "0")}:00. Goals packed into free gaps with real durations — not stacked in one hour.`
    );
  }

  function addCustom() {
    if (!customTitle.trim()) return;
    const item: DailyItem = {
      id: crypto.randomUUID(),
      sourceType: "custom",
      title: customTitle.trim(),
      startHour: customHour,
      startMinute: 0,
      durationMinutes: Math.max(15, customMins),
      done: false,
      skipped: false,
      isTop3: false,
      top3Rank: null,
    };
    upsertDailyItem(selectedDate, item);
    setCustomTitle("");
    setMsg(
      `Added “${item.title}” ${fmtRange(customHour, 0, customMins)} (${customMins}m spans the grid).`
    );
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
            Chronological day column — block height = duration
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-xl border border-black/10 px-2 py-1.5 text-xs"
        />
      </div>

      <section className="card space-y-3 p-4">
        <div>
          <h3 className="text-sm font-semibold">
            Pull calendar + goals into day
          </h3>
          <p className="text-xs text-muted">
            Required: choose the focus window. Calendar events keep their real
            start/end. Goals are triaged into free time with allocated minutes
            (balanced so nothing monopolizes the window).
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-muted">
            Window from
            <select
              className="field mt-1"
              value={pullStart}
              onChange={(e) => setPullStart(Number(e.target.value))}
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-muted">
            to
            <select
              className="field mt-1"
              value={pullEnd}
              onChange={(e) => setPullEnd(Number(e.target.value))}
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
              <option value={22}>22:00</option>
              <option value={23}>23:00</option>
              <option value={24}>24:00</option>
            </select>
          </label>
          <button
            type="button"
            className="rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-white"
            onClick={pullDay}
          >
            Pull & allocate
          </button>
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-3 py-2.5 text-xs font-semibold"
            onClick={() => setSelectedDate(isoDate())}
          >
            Jump to today
          </button>
        </div>
        {msg && (
          <p className="rounded-xl bg-accent/10 px-3 py-2 text-xs font-medium">
            {msg}
          </p>
        )}
      </section>

      <section className="card p-4">
        <h3 className="text-sm font-semibold">Top 3 for the day</h3>
        {tops.length === 0 ? (
          <p className="mt-1 text-sm text-muted">No top priorities set yet.</p>
        ) : (
          <ol className="mt-2 space-y-2">
            {tops.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2 text-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {t.top3Rank}
                </span>
                <span className="flex-1 font-semibold">{t.title}</span>
                <span className="text-xs text-muted">
                  {fmtRange(t.startHour, t.startMinute, t.durationMinutes)} ·{" "}
                  {t.durationMinutes}m
                </span>
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
          A 120‑minute block is drawn across two hour rows (start → end), like a
          normal calendar.
        </p>
        {timelineBlocks.length === 0 ? (
          <div className="card p-4 text-sm text-muted">
            Empty. Set a window and tap <strong>Pull & allocate</strong>, or add
            a custom block below (try 120m).
          </div>
        ) : (
          <HourTimeline
            startHour={startHour}
            endHour={endHour}
            blocks={timelineBlocks}
            hoursForMove={hours}
            onMoveStartHour={(id, hour, minute) =>
              moveDailyItem(selectedDate, id, hour, minute)
            }
          />
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Editable checklist</h3>
        <div className="flex flex-wrap gap-2">
          <input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Add timed block"
            className="min-w-[10rem] flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
          />
          <select
            value={customHour}
            onChange={(e) => setCustomHour(Number(e.target.value))}
            className="rounded-xl border border-black/10 px-2 text-xs font-semibold"
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                Start {h}:00
              </option>
            ))}
          </select>
          <select
            value={customMins}
            onChange={(e) => setCustomMins(Number(e.target.value))}
            className="rounded-xl border border-black/10 px-2 text-xs font-semibold"
          >
            {[15, 30, 45, 60, 90, 120, 150, 180, 240].map((m) => (
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
                <p className="text-xs font-semibold text-muted">
                  {fmtRange(i.startHour, i.startMinute, i.durationMinutes)} ·{" "}
                  {i.durationMinutes}m · {i.sourceType}
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                  <label className="flex items-center gap-1 text-muted">
                    Start
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
                      className="rounded border border-black/10 px-1 py-0.5 font-semibold text-ink"
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}:00
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-1 text-muted">
                    Length
                    <select
                      value={i.durationMinutes}
                      onChange={(e) =>
                        setDuration(i.id, Number(e.target.value))
                      }
                      className="rounded border border-black/10 px-1 py-0.5 font-semibold text-ink"
                    >
                      {[15, 30, 45, 60, 90, 120, 150, 180, 240].map((m) => (
                        <option key={m} value={m}>
                          {m}m
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
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

function fmtRange(h: number, m: number, dur: number) {
  const start = h * 60 + m;
  const end = start + dur;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(start / 60))}:${pad(start % 60)}–${pad(
    Math.floor(end / 60) % 24
  )}:${pad(end % 60)}`;
}
