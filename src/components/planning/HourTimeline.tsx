"use client";

import { useMemo } from "react";
import type { DailyItem } from "@/lib/planning/types";

/** Pixels per minute. 60m = 64px, 120m = 128px (clear two-hour span). */
export const PX_PER_MIN = 64 / 60;

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
        done: !!i.done,
        skipped: !!i.skipped,
        isTop3: !!i.isTop3,
        top3Rank: i.top3Rank,
        soft: !!i.notes?.includes("soft"),
        editable: true,
        subtitle: `${fmt(startMin)}–${fmt(startMin + durationMin)} · ${formatDuration(durationMin)}`,
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
 * Google/Fantastical-style day column:
 * - vertical position = start time
 * - height = full duration (120m draws across two hour lines)
 * - true overlaps sit in side-by-side columns
 */
export function HourTimeline({
  startHour = 6,
  endHour = 22,
  blocks,
  onMoveStartHour,
  hoursForMove,
}: Props) {
  const rangeStart = startHour * 60;
  const rangeEnd = Math.max(rangeStart + 60, endHour * 60);
  const totalMin = rangeEnd - rangeStart;
  const heightPx = totalMin * PX_PER_MIN;

  const hours = Array.from(
    { length: Math.max(1, endHour - startHour) },
    (_, i) => startHour + i
  );
  const moveHours =
    hoursForMove ??
    Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const laid = useMemo(
    () => layoutOverlaps(blocks, rangeStart, rangeEnd),
    [blocks, rangeStart, rangeEnd]
  );

  return (
    <div className="rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-black/5 bg-[#faf9f6] px-3 py-2">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">
          Day column
        </span>
        <span className="text-[10px] text-muted">
          Height = duration · overlaps side-by-side
        </span>
      </div>

      {/* IMPORTANT: both columns share explicit height so absolute blocks paint fully */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "3.25rem 1fr",
          height: heightPx,
        }}
      >
        {/* time labels */}
        <div
          className="relative border-r border-black/10 bg-[#faf9f6]"
          style={{ height: heightPx }}
        >
          {hours.map((h, idx) => (
            <div
              key={h}
              className="absolute right-1.5 -translate-y-1/2 text-[11px] font-semibold tabular-nums text-muted"
              style={{ top: idx * 60 * PX_PER_MIN }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* event canvas — fixed height, not collapsed by absolute children */}
        <div className="relative" style={{ height: heightPx }}>
          {/* hour grid lines */}
          {hours.map((h, idx) => (
            <div
              key={`line-${h}`}
              className="pointer-events-none absolute left-0 right-0 border-t border-black/10"
              style={{ top: idx * 60 * PX_PER_MIN, height: 60 * PX_PER_MIN }}
            >
              <div
                className="absolute left-0 right-0 border-t border-dotted border-black/5"
                style={{ top: 30 * PX_PER_MIN }}
              />
            </div>
          ))}
          <div
            className="pointer-events-none absolute left-0 right-0 border-t border-black/15"
            style={{ top: heightPx - 1 }}
          />

          {/* blocks */}
          {laid.map((b) => {
            const top = (b.visStart - rangeStart) * PX_PER_MIN;
            const blockH = Math.max(
              20,
              (b.visEnd - b.visStart) * PX_PER_MIN - 2
            );
            // side-by-side columns for overlaps
            const gap = 3;
            const widthPct = 100 / b.colCount;
            const leftPct = b.col * widthPct;
            const endMin = b.startMin + b.durationMin;
            const bg = b.done
              ? "rgba(15,118,110,0.18)"
              : b.soft
                ? "rgba(148,163,184,0.28)"
                : "rgba(29,78,216,0.14)";
            const border = b.color || (b.isTop3 ? "#0f766e" : "#1d4ed8");

            return (
              <div
                key={b.id}
                className="absolute z-10 box-border overflow-hidden rounded-md border border-black/10 px-1.5 py-1 shadow-sm"
                style={{
                  top: top + 1,
                  height: blockH,
                  left: `calc(${leftPct}% + ${gap}px)`,
                  width: `calc(${widthPct}% - ${gap * 2}px)`,
                  background: bg,
                  opacity: b.soft ? 0.75 : 1,
                  borderLeft: `4px solid ${border}`,
                }}
                title={`${b.title}\n${fmt(b.startMin)} – ${fmt(endMin)} (${formatDuration(b.durationMin)})`}
              >
                <div className="flex h-full min-h-0 flex-col">
                  <div className="flex items-start justify-between gap-1">
                    <p
                      className={`line-clamp-2 text-[11px] font-semibold leading-tight ${
                        b.done ? "text-muted line-through" : "text-ink"
                      }`}
                    >
                      {b.isTop3 ? `★${b.top3Rank} ` : ""}
                      {b.title}
                    </p>
                    {onMoveStartHour && b.editable !== false && (
                      <select
                        value={Math.floor(b.startMin / 60)}
                        onChange={(e) =>
                          onMoveStartHour(
                            b.id,
                            Number(e.target.value),
                            b.startMin % 60
                          )
                        }
                        className="max-w-[3.4rem] shrink-0 rounded border border-black/10 bg-white/95 text-[9px]"
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
                    {fmt(b.startMin)}–{fmt(endMin)}
                    <span className="font-medium">
                      {" "}
                      · {formatDuration(b.durationMin)}
                    </span>
                  </p>
                  {blockH >= 70 && (
                    <p className="mt-auto text-[9px] text-muted">
                      Spans {Math.max(1, Math.round(b.durationMin / 60))}h of
                      grid
                      {b.colCount > 1 ? ` · col ${b.col + 1}/${b.colCount}` : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-black/5 px-3 py-2 text-[10px] leading-relaxed text-muted">
        Example: 10:00–12:00 (120m) draws from the 10:00 line down through 11:00
        to 12:00. Overlapping blocks share the row as columns.
      </div>
    </div>
  );
}

function formatDuration(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function fmt(min: number) {
  const m = ((Math.round(min) % (24 * 60)) + 24 * 60) % (24 * 60);
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

/** Assign side-by-side columns for overlapping intervals (interval graph coloring). */
export function layoutOverlaps(
  blocks: TimelineBlock[],
  rangeStart: number,
  rangeEnd: number
): Laid[] {
  const prepared = blocks
    .map((b) => {
      const durationMin = Math.max(15, Number(b.durationMin) || 30);
      const startMin = Number(b.startMin) || 0;
      const endMin = startMin + durationMin;
      const visStart = Math.max(startMin, rangeStart);
      const visEnd = Math.min(endMin, rangeEnd);
      return {
        ...b,
        startMin,
        durationMin,
        visStart,
        visEnd,
      };
    })
    .filter((b) => b.visEnd > b.visStart)
    .sort(
      (a, b) => a.visStart - b.visStart || b.durationMin - a.durationMin
    );

  // Track when each column becomes free
  const colFreeAt: number[] = [];
  const placed: (typeof prepared[0] & { col: number })[] = [];

  for (const b of prepared) {
    let col = 0;
    while (col < colFreeAt.length && colFreeAt[col] > b.visStart) {
      col++;
    }
    if (col === colFreeAt.length) colFreeAt.push(b.visEnd);
    else colFreeAt[col] = b.visEnd;
    placed.push({ ...b, col });
  }

  // For each cluster of mutually overlapping items, colCount = max cols used
  const result: Laid[] = [];
  let i = 0;
  while (i < placed.length) {
    let clusterEnd = placed[i].visEnd;
    let j = i + 1;
    while (j < placed.length && placed[j].visStart < clusterEnd) {
      clusterEnd = Math.max(clusterEnd, placed[j].visEnd);
      j++;
    }
    const cluster = placed.slice(i, j);
    const colCount = Math.max(1, ...cluster.map((c) => c.col + 1));
    for (const c of cluster) {
      result.push({ ...c, colCount });
    }
    i = j;
  }
  return result;
}
