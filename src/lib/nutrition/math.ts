/** Nutrition domain types + pure math (MacroFactor-class). */

export type MealPeriod = "breakfast" | "lunch" | "dinner" | "snack";

export type Sex = "male" | "female" | "other";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type GoalType = "cut" | "maintain" | "bulk";

export interface Macros {
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber?: number;
  sugar?: number;
  sodium?: number; // mg
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  /** nutrients per `servingGrams` */
  per: Macros;
  servingGrams: number;
  servingLabel: string; // e.g. "1 cup (240g)"
  barcode?: string;
  isCustom?: boolean;
  isRecipe?: boolean;
  favorite?: boolean;
  tags?: string[];
}

export interface FoodLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  period: MealPeriod;
  foodId: string;
  foodName: string;
  grams: number;
  macros: Macros;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  kg: number;
  note?: string;
}

export interface WaterEntry {
  date: string;
  ml: number;
}

export interface UserNutritionProfile {
  userId: string;
  displayName: string;
  sex: Sex;
  age: number;
  heightCm: number;
  activity: ActivityLevel;
  goal: GoalType;
  /** manual override; if null engine computes */
  targetOverride?: Macros | null;
  /** weekly rate kg change desired for cut/bulk */
  weeklyChangeKg?: number;
}

export interface DaySummary {
  date: string;
  totals: Macros;
  target: Macros;
  remaining: Macros;
  entries: FoodLogEntry[];
  waterMl: number;
  weightKg?: number;
}

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Mifflin-St Jeor BMR (kcal/day) */
export function bmrMifflin(p: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  if (p.sex === "male") return base + 5;
  if (p.sex === "female") return base - 161;
  return base - 78; // midpoint for other
}

export function tdeeFromBmr(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_FACTOR[activity];
}

/**
 * Adaptive expenditure: blend static TDEE with implied expenditure from
 * weight trend over recent weigh-ins (simplified MacroFactor-style idea).
 * implied = intake_avg - (deltaKg * 7700 / days)
 */
export function adaptiveExpenditure(opts: {
  staticTdee: number;
  avgIntake7d: number;
  weightDeltaKg7d: number;
}): number {
  const implied = opts.avgIntake7d - (opts.weightDeltaKg7d * 7700) / 7;
  if (!Number.isFinite(implied) || implied < 1000) return opts.staticTdee;
  // 70% adaptive, 30% static — damped
  return Math.round(opts.staticTdee * 0.3 + implied * 0.7);
}

export function macroTargetsFromGoal(opts: {
  expenditure: number;
  goal: GoalType;
  weightKg: number;
  weeklyChangeKg?: number;
}): Macros {
  const weekly = opts.weeklyChangeKg ?? (opts.goal === "cut" ? -0.4 : opts.goal === "bulk" ? 0.25 : 0);
  const dailyDelta = (weekly * 7700) / 7;
  let calories = Math.round(opts.expenditure + dailyDelta);
  if (opts.goal === "maintain") calories = Math.round(opts.expenditure);

  // Protein 1.8–2.2 g/kg lean-ish heuristic: use 2.0 g/kg bodyweight
  const protein = Math.round(opts.weightKg * 2.0);
  const fat = Math.round((calories * 0.28) / 9);
  const carbCals = calories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(carbCals / 4));
  const fiber = Math.round((calories / 1000) * 14);
  return { calories, protein, carbs, fat, fiber, sugar: 0, sodium: 2300 };
}

export function scaleMacros(per: Macros, fromGrams: number, toGrams: number): Macros {
  const f = toGrams / fromGrams;
  const scale = (n?: number) => Math.round((n ?? 0) * f * 10) / 10;
  return {
    calories: Math.round((per.calories ?? 0) * f),
    protein: scale(per.protein),
    carbs: scale(per.carbs),
    fat: scale(per.fat),
    fiber: scale(per.fiber),
    sugar: scale(per.sugar),
    sodium: scale(per.sodium),
  };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (a, b) => ({
      calories: a.calories + b.calories,
      protein: round1(a.protein + b.protein),
      carbs: round1(a.carbs + b.carbs),
      fat: round1(a.fat + b.fat),
      fiber: round1((a.fiber ?? 0) + (b.fiber ?? 0)),
      sugar: round1((a.sugar ?? 0) + (b.sugar ?? 0)),
      sodium: round1((a.sodium ?? 0) + (b.sodium ?? 0)),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );
}

export function remainingMacros(target: Macros, totals: Macros): Macros {
  return {
    calories: target.calories - totals.calories,
    protein: round1(target.protein - totals.protein),
    carbs: round1(target.carbs - totals.carbs),
    fat: round1(target.fat - totals.fat),
    fiber: round1((target.fiber ?? 0) - (totals.fiber ?? 0)),
    sugar: round1((target.sugar ?? 0) - (totals.sugar ?? 0)),
    sodium: round1((target.sodium ?? 0) - (totals.sodium ?? 0)),
  };
}

export function pctOfTarget(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(999, Math.round((consumed / target) * 100));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function shiftDateISO(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

export const MEAL_PERIODS: { id: MealPeriod; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snacks" },
];
