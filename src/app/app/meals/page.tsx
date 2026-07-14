"use client";

import { format, parseISO } from "date-fns";
import { demoMeals, demoShopping } from "@/lib/demo-data";
import { useState } from "react";

export default function MealsPage() {
  const [msg, setMsg] = useState<string | null>(null);

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
      `Would add ${lines.length} items to shopping (demo): ${lines.join(", ")}. Wire to F09 next.`
    );
    void demoShopping;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Meals</h2>
        <p className="text-sm text-muted">This week · dinner focus</p>
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
            <h3 className="mt-1 text-lg font-semibold">{m.title || "Untitled"}</h3>
            {m.ingredients && (
              <pre className="mt-2 whitespace-pre-wrap text-xs text-muted">
                {m.ingredients}
              </pre>
            )}
            <button
              type="button"
              onClick={() => pushIngredients(m.ingredients)}
              className="mt-3 text-xs font-semibold text-accent"
            >
              Add ingredients to shopping
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
