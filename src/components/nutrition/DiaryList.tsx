"use client";

import { useMemo } from "react";
import { useNutritionStore } from "@/lib/nutrition/store";
import { MEAL_PERIODS, type MealPeriod } from "@/lib/nutrition/math";

export function DiaryList() {
  const log = useNutritionStore((s) => s.log);
  const selectedDate = useNutritionStore((s) => s.selectedDate);
  const remove = useNutritionStore((s) => s.removeLogEntry);

  const entries = useMemo(() => {
    return log
      .filter((e) => e.date === selectedDate)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [log, selectedDate]);

  const byPeriod = useMemo(
    () =>
      MEAL_PERIODS.map((p) => ({
        ...p,
        items: entries.filter((e) => e.period === p.id),
      })),
    [entries]
  );

  if (!entries.length) {
    return (
      <p className="card p-4 text-sm text-muted">
        No foods logged today. Search and log your first meal.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {byPeriod.map((p) =>
        p.items.length ? (
          <section key={p.id} className="card overflow-hidden">
            <h3 className="border-b border-black/5 px-4 py-2 text-xs font-semibold tracking-wide text-muted uppercase">
              {p.label}
            </h3>
            <ul className="divide-y divide-black/5">
              {p.items.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start justify-between gap-2 px-4 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{e.foodName}</p>
                    <p className="text-xs text-muted">
                      {e.grams}g · {e.macros.calories} kcal · P
                      {e.macros.protein} C{e.macros.carbs} F{e.macros.fat}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    className="shrink-0 text-xs font-semibold text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null
      )}
    </div>
  );
}

export function periodFromMealSlot(slot: string): MealPeriod {
  const s = slot.toLowerCase();
  if (s.includes("break")) return "breakfast";
  if (s.includes("lunch")) return "lunch";
  if (s.includes("snack")) return "snack";
  return "dinner";
}
