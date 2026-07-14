"use client";

import { useNutritionStore } from "@/lib/nutrition/store";
import type { ActivityLevel, GoalType, Sex } from "@/lib/nutrition/math";

const fieldClass =
  "mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink";

export function TargetsForm() {
  const profile = useNutritionStore((s) => s.profile);
  const setProfile = useNutritionStore((s) => s.setProfile);
  const target = useNutritionStore((s) => s.target());
  const expenditure = useNutritionStore((s) => s.expenditure());

  return (
    <div className="space-y-3">
      <div className="card space-y-3 p-4">
        <p className="text-sm font-semibold">Body & goal engine</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Age">
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ age: Number(e.target.value) })}
              className={fieldClass}
            />
          </Field>
          <Field label="Height (cm)">
            <input
              type="number"
              value={profile.heightCm}
              onChange={(e) => setProfile({ heightCm: Number(e.target.value) })}
              className={fieldClass}
            />
          </Field>
          <Field label="Sex">
            <select
              value={profile.sex}
              onChange={(e) => setProfile({ sex: e.target.value as Sex })}
              className={fieldClass}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Activity">
            <select
              value={profile.activity}
              onChange={(e) =>
                setProfile({ activity: e.target.value as ActivityLevel })
              }
              className={fieldClass}
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </select>
          </Field>
          <Field label="Goal">
            <select
              value={profile.goal}
              onChange={(e) => setProfile({ goal: e.target.value as GoalType })}
              className={fieldClass}
            >
              <option value="cut">Cut</option>
              <option value="maintain">Maintain</option>
              <option value="bulk">Bulk</option>
            </select>
          </Field>
          <Field label="Weekly change (kg)">
            <input
              type="number"
              step="0.05"
              value={profile.weeklyChangeKg ?? 0}
              onChange={(e) =>
                setProfile({ weeklyChangeKg: Number(e.target.value) })
              }
              className={fieldClass}
            />
          </Field>
        </div>
      </div>

      <div className="card p-4 text-sm">
        <p className="text-xs font-semibold text-muted uppercase">
          Computed daily targets
        </p>
        <p className="mt-1 text-2xl font-semibold">{target.calories} kcal</p>
        <p className="text-muted">
          P {target.protein}g · C {target.carbs}g · F {target.fat}g · Fiber{" "}
          {target.fiber ?? 0}g
        </p>
        <p className="mt-2 text-xs text-muted">
          Based on adaptive expenditure {expenditure} kcal (MacroFactor-style
          blend of formula TDEE + weight trend).
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold text-muted">
      {label}
      {children}
    </label>
  );
}
