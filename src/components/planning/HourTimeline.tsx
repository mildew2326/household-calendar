"use client";

import { useMemo } from "react";
import type { DailyItem } from "@/lib/planning/types";

const HOUR_PX = 56; // pixels per hour — visual scale

export type TimelineBlock = {
  id: string;
  title: string;
  startMin: number; // minutes from midnight
  durationMin: number;
  done?: boolean;
  skipped?: boolean;
  isTop3?: boolean;
  top3Rank?: number | null;
  soft?: boolean;
  color?: string;
  subtitle?: string;
};

export function itemsToBlocks(items: DailyItem[]): TimelineBlock[] {
  return items
    .filter((i) => !i.skipped)
    .map((i) => ({
      id: i.id,
      title: i.title,
      startMin: i.startHour * 60 + (i.startMinute || 0),
      durationMin: Math.max(15, i.durationMinutes || 30),
      done: i.done,
      skipped: i.skipped,
      isTop3: i.isTop3,
      top3Rank: i.top3Rank,
      soft: i.notes?.includes("soft") || false,
      subtitle: `${i.durationMinutes}m · ${i.sourceType}`,
    }));
}

type Props = {
  /** first hour shown (inclusive) */
  startHour?: number;
  /** last hour shown (exclusive), e.g. 21 = up to 21:00 */
  endHour?: number;
  blocks: TimelineBlock[];
  /** optional: move item by new start hour */
  onMoveStartHour?: (id: string, hour: number, minute: number) => void;
  hoursForMove?: number[];
};

/**
 * Proportional day timeline: a 120m block spans 2 hour rows, not one chip.
 */
export function HourTimeline({
  startHour = 6,
  endHour = 21,
  blocks,
  onMoveStartHour,
  hoursForMove,
}: Props) {
  const rangeStart = startHour * 60;
  const rangeEnd = endHour * 60;
  const totalMin = Math.max(60, rangeEnd - rangeStart);
  const height = (totalMin / 60) * HOUR_PX;
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i
  );
  const moveHours =
    hoursForMove ??
    Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // layout columns for overlaps (simple greedy)
  const laidOut = useMemo(() => layoutColumns(blocks, rangeStart, rangeEnd), [
    blocks,
    rangeStart,
    rangeEnd,
  ]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/8 bg-white">
      {/* hour rails */}
      <div className="relative" style={{ height }}>
        {hours.map((h, idx) => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-dashed border-black/8"
            style={{ top: idx * HOUR_PX }}
          >
            <span className="absolute left-2 top-1 text-[10px] font-semibold text-muted">
              {String(h).padStart(2, "0")}:00
            </span>
            {/* half-hour tick */}
            <div
              className="absolute left-12 right-2 border-t border-dotted border-black/5"
              style={{ top: HOUR_PX / 2 }}
            />
          </div>
        ))}
        {/* end line */}
        <div
          className="absolute left-0 right-0 border-t border-black/10"
          style={{ top: height - 1 }}
        />

        {/* blocks */}
        <div className="absolute bottom-0 left-12 right-2 top-0">
          {laidOut.map((b) => {
            const top =
              ((Math.max(b.visStart, rangeStart) - rangeStart) / 60) * HOUR_PX;
            const hPx = Math.max(
              22,
              ((b.visEnd - b.visStart) / 60) * HOUR_PX - 3
            );
            const widthPct = 100 / b.colCount;
            const leftPct = b.col * widthPct;
            const startsBefore = b.startMin < rangeStart;
            const endsAfter = b.startMin + b.durationMin > rangeEnd;

            return (
              <div
                key={b.id}
                className={`absolute overflow-hidden rounded-xl border px-2 py-1 shadow-sm ${
                  b.done
                    ? "border-accent/30 bg-accent/15"
                    : b.soft
                      ? "border-dashed border-black/15 bg-slate-100/80"
                      : "border-black/8 bg-paper"
                }`}
                style={{
                  top,
                  height: hPx,
                  left: `calc(${leftPct}% + 2px)`,
                  width: `calc(${widthPct}% - 4px)`,
                  opacity: b.soft ? 0.55 : 1,
                  borderLeftWidth: 4,
                  borderLeftColor: b.color || (b.isTop3 ? "#0f766e" : "#1d4ed8"),
                }}
                title={`${fmt(b.startMin)}–${fmt(b.startMin + b.durationMin)} · ${b.durationMin}m`}
              >
                <div className="flex h-full min-h-0 flex-col">
                  <div className="flex items-start justify-between gap-1">
                    <p
                      className={`text-[11px] font-semibold leading-tight ${
                        b.done ? "text-muted line-through" : "text-ink"
                      }`}
                    >
                      {b.isTop3 ? `★${b.top3Rank} ` : ""}
                      {b.title}
                    </p>
                    {onMoveStartHour && (
                      <select
                        value={Math.floor(b.startMin / 60)}
                        onChange={(e) =>
                          onMoveStartHour(
                            b.id,
                            Number(e.target.value),
                            b.startMin % 60
                          )
                        }
                        className="max-w-[4.2rem] shrink-0 rounded border border-black/10 bg-white/90 text-[9px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {moveHours.map((hh) => (
                          <option key={hh} value={hh}>
                            {hh}:00
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] font-medium text-muted">
                    {fmt(b.startMin)}–{fmt(b.startMin + b.durationMin)}
                    {startsBefore || endsAfter ? " · clipped" : ""}
                    {b.durationMin >= 60
                      ? ` · ${Math.round((b.durationMin / 60) * 10) / 10}h`
                      : ` · ${b.durationMin}m`}
                  </p>
                  {hPx > 48 && b.subtitle && (
                    <p className="mt-auto truncate text-[10px] text-muted">
                      {b.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t border-black/5 px-3 py-1.5 text-[10px] text-muted">
        Blocks scale to duration — e.g. 120m spans two hour rows.
      </div>
    </div>
  );
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

function layoutColumns(
  blocks: TimelineBlock[],
  rangeStart: number,
  rangeEnd: number
): Laid[] {
  const clipped = blocks
    .map((b) => {
      const end = b.startMin + b.durationMin;
      const visStart = Math.max(b.startMin, rangeStart);
      const visEnd = Math.min(end, rangeEnd);
      return { ...b, visStart, visEnd };
    })
    .filter((b) => b.visEnd > b.visStart)
    .sort((a, b) => a.visStart - b.visStart || b.durationMin - a.durationMin);

  // assign columns
  const colEnds: number[] = [];
  const withCol: (typeof clipped[0] & { col: number })[] = [];
  for (const b of clipped) {
    let col = colEnds.findIndex((end) => end <= b.visStart);
    if (col === -1) {
      col = colEnds.length;
      colEnds.push(b.visEnd);
    } else {
      colEnds[col] = b.visEnd;
    }
    withCol.push({ ...b, col });
  }

  // cluster overlapping groups for colCount
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
    for (const c of cluster) {
      result.push({ ...c, colCount });
    }
    i = j;
  }
  return result;
}

/** Compact duration editor used under checklist */
export function DurationHint({ minutes }: { minutes: number }) {
  if (minutes < 60) return <span>{minutes}m</span>;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return (
    <span>
      {h}h{m ? ` ${m}m` : ""}
    </span>
  );
}
