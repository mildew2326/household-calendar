"use client";

import { useMemo } from "react";
import type { DailyItem } from "@/lib/planning/types";

/** px per minute — 60m = 48px, 120m = 96px */
export const PX_PER_MIN = 0.9;

export type TimelineBlock = {
  id: string;
  title: string;
  startMin: number;
  durationMin: number;
  done?: boolean;
  skipped?: boolean;
  isTop3?: boolean;
  top3Rank?: number | null;
  soft?: boolean;
  color?: string;
  subtitle?: string;
  editable?: boolean;
};

export function itemsToBlocks(items: DailyItem[]): TimelineBlock[] {
  return items
    .filter((i) => !i.skipped)
    .map((i) => {
      const durationMin = Math.max(15, Number(i.durationMinutes) || 30);
      const startMin =
        (Number(i.startHour) || 0) * 60 + (Number(i.startMinute) || 0);
      return {
        id: i.id,
        title: i.title,
        startMin,
        durationMin,
        done: i.done,
        skipped: i.skipped,
        isTop3: i.isTop3,
        top3Rank: i.top3Rank,
        soft: !!i.notes?.includes("soft"),
        editable: true,
        subtitle: `${fmt(startMin)}–${fmt(startMin + durationMin)} · ${durationMin}m`,
      };
    });
}

type Props = {
  startHour?: number;
  endHour?: number;
  blocks: TimelineBlock[];
  onMoveStartHour?: (id: string, hour: number, minute: number) => void;
  hoursForMove?: number[];
};

/**
 * Classic calendar day column: each block's height = duration.
 * 120 minutes occupies exactly two hour rows.
 */
export function HourTimeline({
  startHour = 6,
  endHour = 22,
  blocks,
  onMoveStartHour,
  hoursForMove,
}: Props) {
  const rangeStart = startHour * 60;
  const rangeEnd = endHour * 60;
  const totalMin = rangeEnd - rangeStart;
  const heightPx = totalMin * PX_PER_MIN;
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i
  );
  const moveHours =
    hoursForMove ??
    Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const laid = useMemo(
    () => layoutDay(blocks, rangeStart, rangeEnd),
    [blocks, rangeStart, rangeEnd]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="flex border-b border-black/5 bg-paper/80 px-3 py-2 text-[11px] font-semibold text-muted">
        <span className="w-14">Time</span>
        <span className="flex-1">Schedule (height = duration)</span>
      </div>

      <div className="relative flex" style={{ height: heightPx }}>
        {/* time gutter */}
        <div className="relative w-14 shrink-0 border-r border-black/8 bg-[#faf9f6]">
          {hours.map((h, idx) => (
            <div
              key={h}
              className="absolute right-1 text-[11px] font-semibold tabular-nums text-muted"
              style={{ top: idx * 60 * PX_PER_MIN - 1 }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* grid + events */}
        <div className="relative min-w-0 flex-1">
          {/* hour lines */}
          {hours.map((h, idx) => (
            <div
              key={h}
              className="pointer-events-none absolute left-0 right-0 border-t border-black/10"
              style={{ top: idx * 60 * PX_PER_MIN, height: 60 * PX_PER_MIN }}
            >
              <div
                className="absolute left-0 right-0 border-t border-dotted border-black/5"
                style={{ top: 30 * PX_PER_MIN }}
              />
            </div>
          ))}

          {/* event layer */}
          {laid.map((b) => {
            const top = (b.visStart - rangeStart) * PX_PER_MIN;
            const hPx = Math.max(18, (b.visEnd - b.visStart) * PX_PER_MIN - 2);
            const colW = 100 / b.colCount;
            const left = b.col * colW;
            const endLabel = fmt(b.startMin + b.durationMin);

            return (
              <div
                key={b.id}
                className="absolute z-10 box-border overflow-hidden rounded-lg border border-black/10 px-2 py-1 shadow-sm"
                style={{
                  top: top + 1,
                  height: hPx,
                  left: `calc(${left}% + 3px)`,
                  width: `calc(${colW}% - 6px)`,
                  background: b.done
                    ? "rgba(15,118,110,0.14)"
                    : b.soft
                      ? "rgba(148,163,184,0.25)"
                      : "rgba(29,78,216,0.10)",
                  opacity: b.soft ? 0.72 : 1,
                  borderLeft: `4px solid ${
                    b.color || (b.isTop3 ? "#0f766e" : "#1d4ed8")
                  }`,
                }}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-1">
                    <p
                      className={`text-[12px] font-semibold leading-snug ${
                        b.done ? "text-muted line-through" : "text-ink"
                      }`}
                    >
                      {b.isTop3 ? `★${b.top3Rank} ` : ""}
                      {b.title}
                    </p>
                    {onMoveStartHour && b.editable && (
                      <select
                        value={Math.floor(b.startMin / 60)}
                        onChange={(e) =>
                          onMoveStartHour(
                            b.id,
                            Number(e.target.value),
                            b.startMin % 60
                          )
                        }
                        className="max-w-[3.6rem] shrink-0 rounded border border-black/10 bg-white text-[10px]"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        {moveHours.map((hh) => (
                          <option key={hh} value={hh}>
                            {hh}:00
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] font-semibold tabular-nums text-muted">
                    {fmt(b.startMin)} – {endLabel}
                    {b.durationMin >= 60
                      ? ` · ${formatDuration(b.durationMin)}`
                      : ` · ${b.durationMin}m`}
                  </p>
                  {hPx >= 56 && (
                    <p className="mt-auto text-[10px] text-muted">
                      Spans {Math.ceil(b.durationMin / 60)} hour row
                      {b.durationMin > 60 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-black/5 px-3 py-2 text-[10px] text-muted">
        Chronological day column — block height matches length (120m = 2 full
        hours).
      </div>
    </div>
  );
}

function formatDuration(m: number) {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function fmt(min: number) {
  const m = ((min % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

type Laid = TimelineBlock & {
  visStart: number;
  visEnd: number;
  col: number;
  colCount: number;
};

function layoutDay(
  blocks: TimelineBlock[],
  rangeStart: number,
  rangeEnd: number
): Laid[] {
  const clipped = blocks
    .map((b) => {
      const dur = Math.max(15, b.durationMin || 30);
      const start = b.startMin;
      const end = start + dur;
      return {
        ...b,
        durationMin: dur,
        startMin: start,
        visStart: Math.max(start, rangeStart),
        visEnd: Math.min(end, rangeEnd),
      };
    })
    .filter((b) => b.visEnd > b.visStart)
    .sort((a, b) => a.visStart - b.visStart || b.durationMin - a.durationMin);

  // column packing for true overlaps only
  const colEnds: number[] = [];
  const withCol: (typeof clipped[0] & { col: number })[] = [];

  for (const b of clipped) {
    let col = 0;
    while (col < colEnds.length && colEnds[col] > b.visStart) col++;
    if (col === colEnds.length) colEnds.push(b.visEnd);
    else colEnds[col] = b.visEnd;
    // reset finished columns
    for (let c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= b.visStart) {
        /* free */
      }
    }
    withCol.push({ ...b, col });
  }

  // recompute colCount per overlap cluster
  const result: Laid[] = [];
  let i = 0;
  while (i < withCol.length) {
    let clusterEnd = withCol[i].visEnd;
    let j = i + 1;
    while (j < withCol.length && withCol[j].visStart < clusterEnd) {
      clusterEnd = Math.max(clusterEnd, withCol[j].visEnd);
      j++;
    }
    const cluster = withCol.slice(i, j);
    const colCount = Math.max(1, ...cluster.map((c) => c.col + 1));
    for (const c of cluster) result.push({ ...c, colCount });
    i = j;
  }
  return result;
}
