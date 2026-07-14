"use client";

import { format, parseISO } from "date-fns";
import { demoMeals } from "@/lib/demo-data";
import { useNutritionStore } from "@/lib/nutrition/store";
import { searchFoods } from "@/lib/nutrition/foods";
import { periodFromMealSlot } from "@/components/nutrition/DiaryList";
import { useState } from "react";
import Link from "next/link";

export default function MealsPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const foods = useNutritionStore((s) => s.foods);
  const logFood = useNutritionStore((s) => s.logFood);
  const selectedDate = useNutritionStore((s) => s.selectedDate);

  function pushIngredients(ingredients?: string | null) {
    if (!ingredients) {
      setMsg("No ingredients on this meal.");
      return;
    }
    const lines = ingredients
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setMsg(
      `Would add ${lines.length} items to shopping: ${lines.join(", ")}. Use Shop tab to confirm.`
    );
  }

  function logRecipeToMacros(title: string, slot: string) {
    const hit =
      searchFoods(foods, title, 5).find((f) => f.isRecipe) ||
      searchFoods(foods, title.split(" ")[0], 5)[0];
    if (!hit) {
      setMsg(`No matching food for “${title}”. Log manually in Macros.`);
      return;
    }
    logFood({
      foodId: hit.id,
      grams: hit.servingGrams,
      period: periodFromMealSlot(slot),
      date: selectedDate,
    });
    setMsg(`Logged “${hit.name}” to Macros (${periodFromMealSlot(slot)}).`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Meals</h2>
          <p className="text-sm text-muted">Plan · push to shop · log macros</p>
        </div>
        <Link href="/app/macros" className="text-xs font-semibold text-accent">
          Open macros →
        </Link>
      </div>
      {msg && (
        <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-ink">{msg}</p>
      )}
      <ul className="space-y-3">
        {demoMeals.map((m) => (
          <li key={m.id} className="card p-4">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              {format(parseISO(m.day), "EEE MMM d")} · {m.slot}
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              {m.title || "Untitled"}
            </h3>
            {m.ingredients && (
              <pre className="mt-2 whitespace-pre-wrap text-xs text-muted">
                {m.ingredients}
              </pre>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => pushIngredients(m.ingredients)}
                className="text-xs font-semibold text-accent"
              >
                Add ingredients to shopping
              </button>
              <button
                type="button"
                onClick={() => logRecipeToMacros(m.title, m.slot)}
                className="text-xs font-semibold text-ink"
              >
                Log to macros diary
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
