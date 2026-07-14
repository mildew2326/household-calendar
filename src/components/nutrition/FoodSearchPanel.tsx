"use client";

import { useMemo, useState } from "react";
import { searchFoods } from "@/lib/nutrition/foods";
import type { FoodItem, MealPeriod } from "@/lib/nutrition/math";
import { MEAL_PERIODS } from "@/lib/nutrition/math";
import { useNutritionStore } from "@/lib/nutrition/store";
import { Star } from "lucide-react";

export function FoodSearchPanel({
  defaultPeriod = "lunch",
  onLogged,
}: {
  defaultPeriod?: MealPeriod;
  onLogged?: () => void;
}) {
  const foods = useNutritionStore((s) => s.foods);
  const logFood = useNutritionStore((s) => s.logFood);
  const toggleFavorite = useNutritionStore((s) => s.toggleFavorite);
  const addCustomFood = useNutritionStore((s) => s.addCustomFood);

  const [q, setQ] = useState("");
  const [period, setPeriod] = useState<MealPeriod>(defaultPeriod);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);
  const [showCustom, setShowCustom] = useState(false);

  const results = useMemo(() => searchFoods(foods, q, 30), [foods, q]);

  function pick(f: FoodItem) {
    setSelected(f);
    setGrams(f.servingGrams);
  }

  function log() {
    if (!selected) return;
    logFood({ foodId: selected.id, grams, period });
    setSelected(null);
    setQ("");
    onLogged?.();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {MEAL_PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              period === p.id
                ? "bg-ink text-white"
                : "border border-black/10 bg-white text-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search foods, brands, tags…"
        className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-accent"
      />

      <div className="card max-h-56 overflow-y-auto divide-y divide-black/5">
        {results.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => pick(f)}
            className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-black/[0.03] ${
              selected?.id === f.id ? "bg-accent/10" : ""
            }`}
          >
            <button
              type="button"
              className="shrink-0 text-muted"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(f.id);
              }}
              aria-label="Favorite"
            >
              <Star
                size={16}
                className={f.favorite ? "fill-amber-400 text-amber-400" : ""}
              />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{f.name}</p>
              <p className="text-xs text-muted">
                {f.per.calories} kcal · P{f.per.protein} C{f.per.carbs} F
                {f.per.fat} · {f.servingLabel}
              </p>
            </div>
          </button>
        ))}
        {!results.length && (
          <p className="px-3 py-4 text-sm text-muted">No matches</p>
        )}
      </div>

      {selected && (
        <div className="card space-y-3 p-4">
          <p className="font-semibold">{selected.name}</p>
          <label className="block text-xs font-semibold text-muted">
            Amount (grams)
            <input
              type="number"
              min={1}
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[0.5, 1, 1.5, 2].map((m) => (
              <button
                key={m}
                type="button"
                className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold"
                onClick={() => setGrams(Math.round(selected.servingGrams * m))}
              >
                {m}× serving
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">
            ≈ {Math.round((selected.per.calories * grams) / selected.servingGrams)}{" "}
            kcal · P
            {((selected.per.protein * grams) / selected.servingGrams).toFixed(1)}g
          </p>
          <button
            type="button"
            onClick={log}
            className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-white"
          >
            Log to {MEAL_PERIODS.find((p) => p.id === period)?.label}
          </button>
        </div>
      )}

      <button
        type="button"
        className="text-xs font-semibold text-accent"
        onClick={() => setShowCustom((v) => !v)}
      >
        {showCustom ? "Hide custom food" : "+ Create custom food"}
      </button>

      {showCustom && (
        <CustomFoodForm
          onCreate={(food) => {
            const item = addCustomFood(food);
            setSelected(item);
            setGrams(item.servingGrams);
            setShowCustom(false);
          }}
        />
      )}
    </div>
  );
}

function CustomFoodForm({
  onCreate,
}: {
  onCreate: (f: Omit<FoodItem, "id" | "isCustom">) => void;
}) {
  const [name, setName] = useState("");
  const [servingGrams, setServingGrams] = useState(100);
  const [calories, setCalories] = useState(100);
  const [protein, setProtein] = useState(10);
  const [carbs, setCarbs] = useState(10);
  const [fat, setFat] = useState(5);

  return (
    <div className="card space-y-2 p-4">
      <p className="text-sm font-semibold">Custom food</p>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["Serving g", servingGrams, setServingGrams],
            ["kcal", calories, setCalories],
            ["Protein g", protein, setProtein],
            ["Carbs g", carbs, setCarbs],
            ["Fat g", fat, setFat],
          ] as const
        ).map(([label, val, set]) => (
          <label key={label} className="text-xs font-semibold text-muted">
            {label}
            <input
              type="number"
              value={val}
              onChange={(e) => set(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-black/10 px-2 py-2 text-sm text-ink"
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        className="w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-white"
        onClick={() => {
          if (!name.trim()) return;
          onCreate({
            name: name.trim(),
            servingGrams,
            servingLabel: `${servingGrams}g`,
            per: { calories, protein, carbs, fat },
          });
        }}
      >
        Save food
      </button>
    </div>
  );
}
