"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { usePlanningStore } from "@/lib/planning/store";
import { isoDate } from "@/lib/planning/types";

export default function MealsPage() {
  const meals = usePlanningStore((s) => s.meals);
  const members = usePlanningStore((s) => s.members);
  const updateMeal = usePlanningStore((s) => s.updateMeal);
  const addMeal = usePlanningStore((s) => s.addMeal);
  const removeMeal = usePlanningStore((s) => s.removeMeal);
  const rebuildShoppingFromMeals = usePlanningStore(
    (s) => s.rebuildShoppingFromMeals
  );
  const updateMember = usePlanningStore((s) => s.updateMember);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [day, setDay] = useState(isoDate());
  const [servings, setServings] = useState(2);
  const [ingredientsText, setIngredientsText] = useState(
    "Chicken breast, 0.3, kg\nRice, 0.15, kg"
  );

  const combined = useMemo(() => {
    return usePlanningStore.getState().combinedNutrition();
  }, [members]);

  const activeMembers = useMemo(
    () => members.filter((m) => m.active),
    [members]
  );

  function createMeal() {
    if (!title.trim()) return;
    const portions: Record<string, number> = {};
    const n = Math.max(1, activeMembers.length);
    activeMembers.forEach((m) => {
      portions[m.id] = 1 / n;
    });
    const ingredients = ingredientsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          name: parts[0] || "Item",
          baseQty: Number(parts[1]) || 1,
          unit: parts[2] || "pcs",
        };
      });
    addMeal({
      day: day || isoDate(),
      title: title.trim(),
      servings,
      portions,
      ingredients:
        ingredients.length > 0
          ? ingredients
          : [{ name: "Main ingredient", baseQty: 1, unit: "pcs" }],
    });
    setTitle("");
    setMsg(`Added meal “${title.trim()}”`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Meals</h2>
          <p className="text-sm text-muted">
            Plan dinners → portions → shopping list
          </p>
        </div>
        <Link href="/app/more" className="text-xs font-semibold text-accent">
          More →
        </Link>
      </div>

      {msg && (
        <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm">{msg}</p>
      )}

      <div className="card space-y-2 p-4">
        <p className="text-sm font-semibold">Add meal</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meal title (e.g. Stir fry night)"
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <label className="text-xs font-semibold text-muted">
            Day
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="ml-1 rounded-lg border border-black/10 px-2 py-1 text-xs text-ink"
            />
          </label>
          <label className="text-xs font-semibold text-muted">
            Servings
            <input
              type="number"
              min={1}
              step={0.5}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="ml-1 w-16 rounded-lg border border-black/10 px-2 py-1 text-xs text-ink"
            />
          </label>
        </div>
        <label className="block text-xs font-semibold text-muted">
          Ingredients (one per line: name, qty per serving, unit)
          <textarea
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-xs text-ink"
          />
        </label>
        <button
          type="button"
          onClick={createMeal}
          className="w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-white"
        >
          Add meal
        </button>
      </div>

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
            "Shopping list rebuilt from meals with portion notes. Open Shop."
          );
        }}
        className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-white"
      >
        Build shopping list from meals
      </button>

      <ul className="space-y-3">
        {meals.map((m) => (
          <li key={m.id} className="card space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                  {format(parseISO(m.day + "T12:00:00"), "EEE MMM d")}
                </p>
                <h3 className="text-lg font-semibold">{m.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => removeMeal(m.id)}
                className="text-xs font-semibold text-red-700"
              >
                Remove
              </button>
            </div>
            <label className="block text-xs font-semibold text-muted">
              Day
              <input
                type="date"
                value={m.day}
                onChange={(e) => updateMeal(m.id, { day: e.target.value })}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink"
              />
            </label>
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
