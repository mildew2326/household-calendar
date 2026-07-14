import { describe, expect, it } from "vitest";
import {
  adaptiveExpenditure,
  bmrMifflin,
  macroTargetsFromGoal,
  remainingMacros,
  scaleMacros,
  sumMacros,
  tdeeFromBmr,
} from "./math";
import { searchFoods, SEED_FOODS } from "./foods";

describe("bmrMifflin", () => {
  it("computes male BMR in expected range", () => {
    const bmr = bmrMifflin({
      sex: "male",
      weightKg: 80,
      heightCm: 180,
      age: 30,
    });
    expect(bmr).toBeGreaterThan(1600);
    expect(bmr).toBeLessThan(1900);
  });
});

describe("tdee + targets", () => {
  it("tdee scales with activity", () => {
    const bmr = 1700;
    expect(tdeeFromBmr(bmr, "sedentary")).toBeLessThan(
      tdeeFromBmr(bmr, "active")
    );
  });

  it("cut target below expenditure", () => {
    const t = macroTargetsFromGoal({
      expenditure: 2500,
      goal: "cut",
      weightKg: 80,
      weeklyChangeKg: -0.5,
    });
    expect(t.calories).toBeLessThan(2500);
    expect(t.protein).toBe(160);
  });

  it("bulk target above expenditure", () => {
    const t = macroTargetsFromGoal({
      expenditure: 2500,
      goal: "bulk",
      weightKg: 80,
      weeklyChangeKg: 0.25,
    });
    expect(t.calories).toBeGreaterThan(2500);
  });
});

describe("scaleMacros", () => {
  it("doubles when grams double", () => {
    const per = { calories: 100, protein: 10, carbs: 5, fat: 4 };
    const m = scaleMacros(per, 50, 100);
    expect(m.calories).toBe(200);
    expect(m.protein).toBe(20);
  });
});

describe("sum + remaining", () => {
  it("sums and computes remaining", () => {
    const total = sumMacros([
      { calories: 500, protein: 30, carbs: 40, fat: 20 },
      { calories: 300, protein: 20, carbs: 20, fat: 10 },
    ]);
    expect(total.calories).toBe(800);
    const rem = remainingMacros(
      { calories: 2000, protein: 150, carbs: 200, fat: 60 },
      total
    );
    expect(rem.calories).toBe(1200);
    expect(rem.protein).toBe(100);
  });
});

describe("adaptiveExpenditure", () => {
  it("blends static and implied", () => {
    const e = adaptiveExpenditure({
      staticTdee: 2500,
      avgIntake7d: 2200,
      weightDeltaKg7d: -0.5,
    });
    // weight loss while eating 2200 => implied higher than 2200
    expect(e).toBeGreaterThan(2200);
    expect(e).toBeLessThan(3000);
  });
});

describe("searchFoods", () => {
  it("finds chicken", () => {
    const r = searchFoods(SEED_FOODS, "chicken");
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].name.toLowerCase()).toContain("chicken");
  });

  it("returns favorites when empty query", () => {
    const foods = SEED_FOODS.map((f, i) =>
      i === 0 ? { ...f, favorite: true } : f
    );
    const r = searchFoods(foods, "");
    expect(r.every((f) => f.favorite)).toBe(true);
  });
});
