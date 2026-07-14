"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useNutritionStore } from "@/lib/nutrition/store";
import { shiftDateISO, todayISO } from "@/lib/nutrition/math";
import { MacroRings, RemainingBar } from "@/components/nutrition/MacroRings";
import { FoodSearchPanel } from "@/components/nutrition/FoodSearchPanel";
import { DiaryList } from "@/components/nutrition/DiaryList";
import { WeightPanel, TrendsPanel } from "@/components/nutrition/WeightTrends";
import { TargetsForm } from "@/components/nutrition/TargetsForm";

type Tab = "diary" | "add" | "weight" | "trends" | "targets";

export default function MacrosPage() {
  const [tab, setTab] = useState<Tab>("diary");
  const selectedDate = useNutritionStore((s) => s.selectedDate);
  const setSelectedDate = useNutritionStore((s) => s.setSelectedDate);
  const totals = useNutritionStore((s) => s.dayTotals());
  const target = useNutritionStore((s) => s.target());
  const water = useNutritionStore((s) =>
    s.water.find((w) => w.date === s.selectedDate)?.ml ?? 0
  );
  const addWater = useNutritionStore((s) => s.addWater);
  const copyDay = useNutritionStore((s) => s.copyDay);
  const review = useNutritionStore((s) => s.weeklyReview());

  const tabs: { id: Tab; label: string }[] = [
    { id: "diary", label: "Diary" },
    { id: "add", label: "Log" },
    { id: "weight", label: "Weight" },
    { id: "trends", label: "Trends" },
    { id: "targets", label: "Targets" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Macros</h2>
          <p className="text-sm text-muted">
            Food diary · adaptive targets · weight
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold"
            onClick={() => setSelectedDate(shiftDateISO(selectedDate, -1))}
          >
            ←
          </button>
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold"
            onClick={() => setSelectedDate(todayISO())}
          >
            {selectedDate === todayISO()
              ? "Today"
              : format(parseISO(selectedDate), "MMM d")}
          </button>
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold"
            onClick={() => setSelectedDate(shiftDateISO(selectedDate, 1))}
          >
            →
          </button>
        </div>
      </div>

      <MacroRings totals={totals} target={target} />
      <RemainingBar totals={totals} target={target} />

      <div className="card flex items-center justify-between gap-2 p-3">
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase">Water</p>
          <p className="text-lg font-semibold">{water} ml</p>
        </div>
        <div className="flex gap-2">
          {[250, 500].map((ml) => (
            <button
              key={ml}
              type="button"
              onClick={() => addWater(ml)}
              className="rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent"
            >
              +{ml}ml
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              tab === t.id
                ? "bg-ink text-white"
                : "border border-black/10 bg-white text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "diary" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
              onClick={() => {
                copyDay(shiftDateISO(selectedDate, -1), selectedDate);
              }}
            >
              Copy previous day
            </button>
            <button
              type="button"
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
              onClick={() => setTab("add")}
            >
              + Log food
            </button>
          </div>
          <DiaryList />
          <p className="text-xs text-muted">
            Week: {review.daysLogged}/7 days · avg {review.avgCalories} kcal ·
            adherence {review.adherencePct}%
          </p>
        </div>
      )}

      {tab === "add" && (
        <FoodSearchPanel
          onLogged={() => setTab("diary")}
        />
      )}

      {tab === "weight" && <WeightPanel />}
      {tab === "trends" && <TrendsPanel />}
      {tab === "targets" && <TargetsForm />}
    </div>
  );
}
