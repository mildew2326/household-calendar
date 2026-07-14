"use client";

import type { Macros } from "@/lib/nutrition/math";
import { pctOfTarget } from "@/lib/nutrition/math";

const RINGS: {
  key: keyof Macros;
  label: string;
  color: string;
  unit: string;
}[] = [
  { key: "calories", label: "Calories", color: "#0e7c66", unit: "kcal" },
  { key: "protein", label: "Protein", color: "#1d4ed8", unit: "g" },
  { key: "carbs", label: "Carbs", color: "#b45309", unit: "g" },
  { key: "fat", label: "Fat", color: "#7c3aed", unit: "g" },
];

function Ring({
  value,
  target,
  color,
  label,
  unit,
}: {
  value: number;
  target: number;
  color: string;
  label: string;
  unit: string;
}) {
  const pct = Math.min(100, pctOfTarget(value, target));
  const over = value > target;
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="rgba(12,18,34,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={over ? "#b91c1c" : color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
        />
        <text
          x="44"
          y="42"
          textAnchor="middle"
          className="fill-ink"
          style={{ fontSize: 14, fontWeight: 700 }}
        >
          {Math.round(value)}
        </text>
        <text
          x="44"
          y="56"
          textAnchor="middle"
          style={{ fontSize: 9, fill: "#5c6b84" }}
        >
          / {Math.round(target)}
        </text>
      </svg>
      <span className="text-[11px] font-semibold text-muted">
        {label} · {unit}
      </span>
    </div>
  );
}

export function MacroRings({
  totals,
  target,
}: {
  totals: Macros;
  target: Macros;
}) {
  return (
    <div className="card grid grid-cols-4 gap-1 p-3 sm:gap-2 sm:p-4">
      {RINGS.map((r) => (
        <Ring
          key={r.key}
          label={r.label}
          unit={r.unit}
          color={r.color}
          value={Number(totals[r.key] ?? 0)}
          target={Number(target[r.key] ?? 0)}
        />
      ))}
    </div>
  );
}

export function RemainingBar({
  totals,
  target,
}: {
  totals: Macros;
  target: Macros;
}) {
  const rem = remainingMacrosSafe(target, totals);
  return (
    <div className="card grid grid-cols-2 gap-2 p-4 text-sm sm:grid-cols-4">
      {(
        [
          ["Cal left", rem.calories, "kcal"],
          ["P left", rem.protein, "g"],
          ["C left", rem.carbs, "g"],
          ["F left", rem.fat, "g"],
        ] as const
      ).map(([label, val, unit]) => (
        <div key={label}>
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            {label}
          </p>
          <p
            className={`text-lg font-semibold ${
              val < 0 ? "text-red-700" : "text-ink"
            }`}
          >
            {val > 0 ? Math.round(val) : Math.round(val)}
            <span className="ml-1 text-xs font-medium text-muted">{unit}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function remainingMacrosSafe(target: Macros, totals: Macros): Macros {
  return {
    calories: target.calories - totals.calories,
    protein: Math.round((target.protein - totals.protein) * 10) / 10,
    carbs: Math.round((target.carbs - totals.carbs) * 10) / 10,
    fat: Math.round((target.fat - totals.fat) * 10) / 10,
  };
}
