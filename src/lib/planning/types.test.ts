import { describe, expect, it } from "vitest";
import {
  buildShoppingFromMeals,
  combinedTargets,
  eventColor,
  planBlocksFromGoal,
  top3Items,
  type DailyItem,
  type Goal,
  type Member,
  type PlannedMeal,
} from "./types";

const members: Member[] = [
  {
    id: "a",
    name: "You",
    color: "#0e7c66",
    calories: 2000,
    protein: 150,
    carbs: 180,
    fat: 60,
    active: true,
  },
  {
    id: "b",
    name: "Partner",
    color: "#1d4ed8",
    calories: 1800,
    protein: 120,
    carbs: 150,
    fat: 55,
    active: true,
  },
];

describe("combinedTargets", () => {
  it("sums active members", () => {
    const c = combinedTargets(members);
    expect(c.calories).toBe(3800);
    expect(c.people).toBe(2);
  });
});

describe("buildShoppingFromMeals", () => {
  it("scales ingredients by servings and notes portions", () => {
    const meals: PlannedMeal[] = [
      {
        id: "1",
        day: "2026-07-14",
        title: "Tacos",
        servings: 2,
        portions: { a: 0.5, b: 0.5 },
        ingredients: [{ name: "Beef", baseQty: 0.25, unit: "kg" }],
      },
    ];
    const lines = buildShoppingFromMeals(meals, members);
    expect(lines[0].qty).toBe(0.5);
    expect(lines[0].note).toContain("You");
    expect(lines[0].note).toContain("50%");
  });
});

describe("planBlocksFromGoal", () => {
  it("creates blocks on preferred days", () => {
    const goal: Goal = {
      id: "g",
      title: "Office",
      description: "",
      status: "active",
      priority: 2,
      memberIds: ["a"],
      preferredDays: [1, 3, 5],
      preferredStartHour: 18,
      sessionMinutes: 60,
      sections: [],
    };
    const blocks = planBlocksFromGoal(goal, 1);
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0].title).toContain("Office");
  });
});

describe("eventColor", () => {
  it("uses group color for group events", () => {
    expect(
      eventColor(
        {
          id: "1",
          title: "x",
          startsAt: "",
          endsAt: "",
          allDay: false,
          memberId: null,
          kind: "group",
          priority: 3,
        },
        members,
        "#abc"
      )
    ).toBe("#abc");
  });
});

describe("top3Items", () => {
  it("orders top 3", () => {
    const items: DailyItem[] = [
      {
        id: "1",
        sourceType: "custom",
        title: "c",
        startHour: 10,
        startMinute: 0,
        durationMinutes: 30,
        done: false,
        skipped: false,
        isTop3: true,
        top3Rank: 3,
      },
      {
        id: "2",
        sourceType: "custom",
        title: "a",
        startHour: 9,
        startMinute: 0,
        durationMinutes: 30,
        done: false,
        skipped: false,
        isTop3: true,
        top3Rank: 1,
      },
    ];
    expect(top3Items(items).map((i) => i.id)).toEqual(["2", "1"]);
  });
});
