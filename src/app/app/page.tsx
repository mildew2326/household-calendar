"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  format,
  isSameDay,
  startOfDay,
  parseISO,
} from "date-fns";
import { demoEvents, DEMO_VIEWER, demoMembers } from "@/lib/demo-data";
import { projectEventsForViewer, type ProjectedEvent } from "@/lib/types";

export default function CalendarPage() {
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const days = useMemo(
    () => Array.from({ length: 3 }, (_, i) => addDays(anchor, i)),
    [anchor]
  );

  const projected = useMemo(
    () => projectEventsForViewer(demoEvents, DEMO_VIEWER),
    []
  );

  function eventsForDay(d: Date): ProjectedEvent[] {
    return projected
      .filter((e) => isSameDay(parseISO(e.starts_at), d))
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {format(anchor, "MMMM yyyy")}
          </h2>
          <p className="text-sm text-muted">3-day household view · demo data</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
            onClick={() => setAnchor(startOfDay(new Date()))}
          >
            Today
          </button>
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
            onClick={() => setAnchor((d) => addDays(d, -3))}
          >
            ←
          </button>
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
            onClick={() => setAnchor((d) => addDays(d, 3))}
          >
            →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {demoMembers.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold border border-black/5"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: m.color }}
            />
            {m.display_name}
          </span>
        ))}
      </div>

      <div className="grid gap-3">
        {days.map((d) => {
          const list = eventsForDay(d);
          return (
            <section key={d.toISOString()} className="card p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">
                  {format(d, "EEE d")}
                  {isSameDay(d, new Date()) && (
                    <span className="ml-2 text-xs font-semibold text-accent">
                      Today
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  className="text-xs font-semibold text-accent"
                  onClick={() =>
                    alert("Create flow wires to Supabase in next build slice.")
                  }
                >
                  + Add
                </button>
              </div>
              {list.length === 0 ? (
                <p className="text-sm text-muted">Nothing planned</p>
              ) : (
                <ul className="space-y-2">
                  {list.map((e) => {
                    const busy = "isBusy" in e && e.isBusy;
                    const member = demoMembers.find(
                      (m) => "created_by" in e && m.id === e.created_by
                    );
                    return (
                      <li
                        key={e.id}
                        className={`rounded-xl px-3 py-2.5 text-sm ${
                          busy ? "busy-block" : "bg-paper"
                        }`}
                        style={
                          !busy && member
                            ? { borderLeft: `4px solid ${member.color}` }
                            : undefined
                        }
                      >
                        <div className="font-semibold">{e.title}</div>
                        <div className="text-xs text-muted">
                          {e.all_day
                            ? "All day"
                            : `${format(parseISO(e.starts_at), "h:mm a")} – ${format(
                                parseISO(e.ends_at),
                                "h:mm a"
                              )}`}
                          {"location" in e && e.location
                            ? ` · ${e.location}`
                            : ""}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
