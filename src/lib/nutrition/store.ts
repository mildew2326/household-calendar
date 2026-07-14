"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  adaptiveExpenditure,
  bmrMifflin,
  macroTargetsFromGoal,
  remainingMacros,
  scaleMacros,
  sumMacros,
  tdeeFromBmr,
  todayISO,
  shiftDateISO,
  type FoodItem,
  type FoodLogEntry,
  type Macros,
  type MealPeriod,
  type UserNutritionProfile,
  type WeightEntry,
  type WaterEntry,
} from "./math";
import { SEED_FOODS } from "./foods";

const DEFAULT_PROFILE: UserNutritionProfile = {
  userId: "demo-user-a",
  displayName: "You",
  sex: "male",
  age: 35,
  heightCm: 178,
  activity: "moderate",
  goal: "cut",
  weeklyChangeKg: -0.4,
};

interface NutritionState {
  profile: UserNutritionProfile;
  foods: FoodItem[];
  log: FoodLogEntry[];
  weights: WeightEntry[];
  water: WaterEntry[];
  selectedDate: string;

  setSelectedDate: (d: string) => void;
  setProfile: (p: Partial<UserNutritionProfile>) => void;
  addCustomFood: (food: Omit<FoodItem, "id" | "isCustom">) => FoodItem;
  toggleFavorite: (foodId: string) => void;
  logFood: (opts: {
    foodId: string;
    grams: number;
    period: MealPeriod;
    date?: string;
  }) => void;
  removeLogEntry: (id: string) => void;
  copyDay: (fromDate: string, toDate: string) => void;
  logWeight: (kg: number, date?: string) => void;
  addWater: (ml: number, date?: string) => void;
  setWater: (ml: number, date?: string) => void;

  getFood: (id: string) => FoodItem | undefined;
  dayEntries: (date?: string) => FoodLogEntry[];
  dayTotals: (date?: string) => Macros;
  latestWeightKg: () => number;
  staticTdee: () => number;
  expenditure: () => number;
  target: () => Macros;
  dayRemaining: (date?: string) => Macros;
  weeklyReview: () => {
    avgCalories: number;
    avgProtein: number;
    daysLogged: number;
    weightDelta: number;
    adherencePct: number;
  };
}

function emptyMacros(): Macros {
  return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      foods: SEED_FOODS,
      log: [],
      weights: [
        {
          id: "w0",
          date: shiftDateISO(todayISO(), -7),
          kg: 82.5,
        },
        {
          id: "w1",
          date: todayISO(),
          kg: 82.0,
        },
      ],
      water: [],
      selectedDate: todayISO(),

      setSelectedDate: (d) => set({ selectedDate: d }),
      setProfile: (p) => set({ profile: { ...get().profile, ...p } }),

      addCustomFood: (food) => {
        const item: FoodItem = {
          ...food,
          id: `custom-${crypto.randomUUID()}`,
          isCustom: true,
        };
        set({ foods: [item, ...get().foods] });
        return item;
      },

      toggleFavorite: (foodId) =>
        set({
          foods: get().foods.map((f) =>
            f.id === foodId ? { ...f, favorite: !f.favorite } : f
          ),
        }),

      logFood: ({ foodId, grams, period, date }) => {
        const food = get().foods.find((f) => f.id === foodId);
        if (!food) return;
        const macros = scaleMacros(food.per, food.servingGrams, grams);
        const entry: FoodLogEntry = {
          id: crypto.randomUUID(),
          date: date ?? get().selectedDate,
          period,
          foodId,
          foodName: food.name,
          grams,
          macros,
          createdAt: new Date().toISOString(),
        };
        set({ log: [entry, ...get().log] });
      },

      removeLogEntry: (id) => set({ log: get().log.filter((e) => e.id !== id) }),

      copyDay: (fromDate, toDate) => {
        const src = get().log.filter((e) => e.date === fromDate);
        const copies = src.map((e) => ({
          ...e,
          id: crypto.randomUUID(),
          date: toDate,
          createdAt: new Date().toISOString(),
        }));
        set({ log: [...copies, ...get().log] });
      },

      logWeight: (kg, date) => {
        const d = date ?? get().selectedDate;
        const rest = get().weights.filter((w) => w.date !== d);
        set({
          weights: [
            ...rest,
            { id: crypto.randomUUID(), date: d, kg },
          ].sort((a, b) => a.date.localeCompare(b.date)),
        });
      },

      addWater: (ml, date) => {
        const d = date ?? get().selectedDate;
        const cur = get().water.find((w) => w.date === d)?.ml ?? 0;
        get().setWater(cur + ml, d);
      },

      setWater: (ml, date) => {
        const d = date ?? get().selectedDate;
        const rest = get().water.filter((w) => w.date !== d);
        set({ water: [...rest, { date: d, ml: Math.max(0, ml) }] });
      },

      getFood: (id) => get().foods.find((f) => f.id === id),

      dayEntries: (date) => {
        const d = date ?? get().selectedDate;
        return get()
          .log.filter((e) => e.date === d)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      },

      dayTotals: (date) => {
        const entries = get().dayEntries(date);
        if (!entries.length) return emptyMacros();
        return sumMacros(entries.map((e) => e.macros));
      },

      latestWeightKg: () => {
        const w = [...get().weights].sort((a, b) => b.date.localeCompare(a.date))[0];
        return w?.kg ?? 80;
      },

      staticTdee: () => {
        const p = get().profile;
        const wt = get().latestWeightKg();
        const bmr = bmrMifflin({
          sex: p.sex,
          weightKg: wt,
          heightCm: p.heightCm,
          age: p.age,
        });
        return Math.round(tdeeFromBmr(bmr, p.activity));
      },

      expenditure: () => {
        const staticTdee = get().staticTdee();
        const today = todayISO();
        const days: string[] = [];
        for (let i = 6; i >= 0; i--) days.push(shiftDateISO(today, -i));
        const intakes = days.map((d) => get().dayTotals(d).calories);
        const logged = intakes.filter((c) => c > 0);
        const avgIntake7d =
          logged.length > 0
            ? logged.reduce((a, b) => a + b, 0) / logged.length
            : staticTdee;
        const weights = get().weights.filter((w) => days.includes(w.date));
        let weightDeltaKg7d = 0;
        if (weights.length >= 2) {
          const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
          weightDeltaKg7d = sorted[sorted.length - 1].kg - sorted[0].kg;
        }
        return adaptiveExpenditure({
          staticTdee,
          avgIntake7d,
          weightDeltaKg7d,
        });
      },

      target: () => {
        const p = get().profile;
        if (p.targetOverride) return p.targetOverride;
        return macroTargetsFromGoal({
          expenditure: get().expenditure(),
          goal: p.goal,
          weightKg: get().latestWeightKg(),
          weeklyChangeKg: p.weeklyChangeKg,
        });
      },

      dayRemaining: (date) => remainingMacros(get().target(), get().dayTotals(date)),

      weeklyReview: () => {
        const today = todayISO();
        const days: string[] = [];
        for (let i = 6; i >= 0; i--) days.push(shiftDateISO(today, -i));
        const totals = days.map((d) => get().dayTotals(d));
        const logged = totals.filter((t) => t.calories > 0);
        const target = get().target();
        const avgCalories =
          logged.length > 0
            ? Math.round(logged.reduce((a, t) => a + t.calories, 0) / logged.length)
            : 0;
        const avgProtein =
          logged.length > 0
            ? Math.round(
                (logged.reduce((a, t) => a + t.protein, 0) / logged.length) * 10
              ) / 10
            : 0;
        const weights = get()
          .weights.filter((w) => days.includes(w.date))
          .sort((a, b) => a.date.localeCompare(b.date));
        const weightDelta =
          weights.length >= 2
            ? Math.round((weights[weights.length - 1].kg - weights[0].kg) * 10) / 10
            : 0;
        const adherencePct =
          logged.length > 0
            ? Math.round(
                (logged.filter(
                  (t) =>
                    Math.abs(t.calories - target.calories) / target.calories < 0.1
                ).length /
                  7) *
                  100
              )
            : 0;
        return {
          avgCalories,
          avgProtein,
          daysLogged: logged.length,
          weightDelta,
          adherencePct,
        };
      },
    }),
    { name: "duet-nutrition-v1" }
  )
);
