"use client";

import { useMemo, useState } from "react";
import { useNutritionStore } from "@/lib/nutrition/store";
import { shiftDateISO, todayISO } from "@/lib/nutrition/math";

export function WeightPanel() {
  const weights = useNutritionStore((s) => s.weights);
  const logWeight = useNutritionStore((s) => s.logWeight);

  const latest = useMemo(() => {
    const w = [...weights].sort((a, b) => b.date.localeCompare(a.date))[0];
    return w?.kg ?? 80;
  }, [weights]);

  const [kg, setKg] = useState(String(latest));

  const sorted = useMemo(
    () => [...weights].sort((a, b) => a.date.localeCompare(b.date)).slice(-14),
    [weights]
  );

  const min = Math.min(...sorted.map((w) => w.kg), latest);
  const max = Math.max(...sorted.map((w) => w.kg), latest);
  const span = Math.max(0.5, max - min);

  return (
    <div className="space-y-3">
      <div className="card p-4">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          Latest weight
        </p>
        <p className="text-3xl font-semibold">{latest} kg</p>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            step="0.1"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="rounded-full bg-ink px-4 text-sm font-semibold text-white"
            onClick={() => {
              const n = Number(kg);
              if (n > 0) logWeight(n);
            }}
          >
            Log today
          </button>
        </div>
      </div>

      <div className="card p-4">
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
          14-day trend
        </p>
        <div className="flex h-28 items-end gap-1">
          {sorted.map((w) => {
            const h = ((w.kg - min) / span) * 100;
            return (
              <div key={w.id} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-accent/80"
                  style={{ height: `${Math.max(8, h)}%` }}
                  title={`${w.date}: ${w.kg}kg`}
                />
              </div>
            );
          })}
        </div>
        <ul className="mt-3 max-h-32 space-y-1 overflow-y-auto text-xs text-muted">
          {[...sorted].reverse().map((w) => (
            <li key={w.id} className="flex justify-between">
              <span>{w.date}</span>
              <span className="font-semibold text-ink">{w.kg} kg</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TrendsPanel() {
  const log = useNutritionStore((s) => s.log);
  const weights = useNutritionStore((s) => s.weights);
  const profile = useNutritionStore((s) => s.profile);

  const days = useMemo(() => {
    const t = todayISO();
    return Array.from({ length: 7 }, (_, i) => shiftDateISO(t, i - 6));
  }, []);

  const review = useMemo(
    () => useNutritionStore.getState().weeklyReview(),
    [log, weights, profile]
  );
  const target = useMemo(
    () => useNutritionStore.getState().target(),
    [log, weights, profile]
  );
  const expenditure = useMemo(
    () => useNutritionStore.getState().expenditure(),
    [log, weights, profile]
  );
  const staticTdee = useMemo(
    () => useNutritionStore.getState().staticTdee(),
    [weights, profile]
  );

  const dayCals = useMemo(() => {
    const st = useNutritionStore.getState();
    return days.map((d) => ({ d, c: st.dayTotals(d).calories }));
  }, [days, log]);

  return (
    <div className="space-y-3">
      <div className="card grid grid-cols-2 gap-3 p-4 text-sm">
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase">
            Static TDEE
          </p>
          <p className="text-xl font-semibold">{staticTdee}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase">
            Adaptive expenditure
          </p>
          <p className="text-xl font-semibold text-accent">{expenditure}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase">
            7d avg intake
          </p>
          <p className="text-xl font-semibold">{review.avgCalories}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase">
            Weight Δ 7d
          </p>
          <p className="text-xl font-semibold">
            {review.weightDelta > 0 ? "+" : ""}
            {review.weightDelta} kg
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase">
            Days logged
          </p>
          <p className="text-xl font-semibold">{review.daysLogged}/7</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase">
            Adherence (±10% cal)
          </p>
          <p className="text-xl font-semibold">{review.adherencePct}%</p>
        </div>
      </div>

      <div className="card p-4">
        <p className="mb-2 text-xs font-semibold text-muted uppercase">
          Daily calories vs target ({target.calories})
        </p>
        <div className="space-y-1.5">
          {dayCals.map(({ d, c }) => {
            const pct = Math.min(
              100,
              Math.round((c / Math.max(1, target.calories)) * 100)
            );
            return (
              <div key={d} className="flex items-center gap-2 text-xs">
                <span className="w-20 shrink-0 text-muted">{d.slice(5)}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right font-semibold">{c || "—"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
