"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { usePlanningStore } from "@/lib/planning/store";

export default function MealsPage() {
  const meals = usePlanningStore((s) => s.meals);
  const members = usePlanningStore((s) => s.members);
  const updateMeal = usePlanningStore((s) => s.updateMeal);
  const rebuildShoppingFromMeals = usePlanningStore(
    (s) => s.rebuildShoppingFromMeals
  );
  const updateMember = usePlanningStore((s) => s.updateMember);
  const [msg, setMsg] = useState<string | null>(null);

  const combined = useMemo(() => {
    return usePlanningStore.getState().combinedNutrition();
  }, [members]);

  const activeMembers = useMemo(
    () => members.filter((m) => m.active),
    [members]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Meals</h2>
          <p className="text-sm text-muted">
            Family goals → portions → shopping
          </p>
        </div>
        <Link href="/app/macros" className="text-xs font-semibold text-accent">
          Macros →
        </Link>
      </div>

      {msg && (
        <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm">{msg}</p>
      )}

      <section className="card space-y-3 p-4">
        <h3 className="text-sm font-semibold">Family nutrition goals</h3>
        <p className="text-xs text-muted">
          Combined household target (active members):{" "}
          <strong>
            {combined.calories} kcal · P{combined.protein} C{combined.carbs} F
            {combined.fat}
          </strong>{" "}
          across {combined.people} people
        </p>
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-black/5 bg-paper p-3 text-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: m.color }}
                  />
                  {m.name}
                </span>
                <label className="text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={m.active}
                    onChange={(e) =>
                      updateMember(m.id, { active: e.target.checked })
                    }
                    className="mr-1"
                  />
                  Active
                </label>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    ["kcal", "calories"],
                    ["P", "protein"],
                    ["C", "carbs"],
                    ["F", "fat"],
                  ] as const
                ).map(([label, key]) => (
                  <label key={key} className="text-[10px] font-semibold text-muted">
                    {label}
                    <input
                      type="number"
                      value={m[key]}
                      onChange={(e) =>
                        updateMember(m.id, {
                          [key]: Number(e.target.value),
                        } as Partial<typeof m>)
                      }
                      className="mt-0.5 w-full rounded-lg border border-black/10 px-1 py-1 text-xs text-ink"
                    />
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => {
          rebuildShoppingFromMeals();
          setMsg(
            "Shopping list rebuilt from meals with portion notes. Open Shop tab."
          );
        }}
        className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white"
      >
        Build shopping list from week meals
      </button>

      <ul className="space-y-3">
        {meals.map((m) => (
          <li key={m.id} className="card space-y-3 p-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                {format(parseISO(m.day + "T12:00:00"), "EEE MMM d")}
              </p>
              <h3 className="text-lg font-semibold">{m.title}</h3>
            </div>
            <label className="block text-xs font-semibold text-muted">
              Total servings (household)
              <input
                type="number"
                min={1}
                step={0.5}
                value={m.servings}
                onChange={(e) =>
                  updateMeal(m.id, { servings: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink"
              />
            </label>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted">
                Portion distribution
              </p>
              <div className="space-y-2">
                {activeMembers.map((mem) => (
                  <label
                    key={mem.id}
                    className="flex items-center gap-2 text-xs font-semibold"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: mem.color }}
                    />
                    {mem.name}
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round((m.portions[mem.id] ?? 0) * 100)}
                      onChange={(e) => {
                        const pct = Number(e.target.value) / 100;
                        updateMeal(m.id, {
                          portions: { ...m.portions, [mem.id]: pct },
                        });
                      }}
                      className="flex-1"
                    />
                    <span className="w-10 text-right text-muted">
                      {Math.round((m.portions[mem.id] ?? 0) * 100)}%
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-xs text-muted">
              {m.ingredients
                .map(
                  (i) =>
                    `${i.name}: ${Math.round(i.baseQty * m.servings * 100) / 100} ${i.unit}`
                )
                .join("\n")}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
