import { describe, expect, it } from "vitest";
import {
  daysUntilDeadline,
  goalPercent,
  remainingMinutes,
  sectionPercent,
  sortByTriage,
  triageBlocksFromGoal,
  triageScore,
  allocateDayWindow,
  type GoalSection,
} from "./goal-math";

const sec = (partial: Partial<GoalSection> & { title: string }): GoalSection => ({
  id: partial.id ?? crypto.randomUUID(),
  title: partial.title,
  estimatedMinutes: partial.estimatedMinutes ?? 60,
  percentComplete: partial.percentComplete ?? 0,
  done: partial.done ?? false,
  subsections: partial.subsections ?? [],
});

describe("goal progress", () => {
  it("computes section percent from subsections", () => {
    const s = sec({
      title: "Research",
      subsections: [
        { id: "1", title: "a", done: true, estimatedMinutes: 30 },
        { id: "2", title: "b", done: false, estimatedMinutes: 30 },
      ],
    });
    expect(sectionPercent(s)).toBe(50);
  });

  it("weights goal percent by section minutes", () => {
    const g = {
      priority: 2,
      sessionMinutes: 60,
      preferredDays: [1],
      preferredStartHour: 18,
      sections: [
        sec({ title: "A", estimatedMinutes: 100, percentComplete: 0 }),
        sec({ title: "B", estimatedMinutes: 100, percentComplete: 100, done: true }),
      ],
    };
    expect(goalPercent(g)).toBe(50);
  });

  it("remaining minutes scales with percent", () => {
    const g = {
      priority: 2,
      sessionMinutes: 60,
      preferredDays: [1],
      preferredStartHour: 18,
      sections: [sec({ title: "A", estimatedMinutes: 120, percentComplete: 50 })],
    };
    expect(remainingMinutes(g)).toBe(60);
  });
});

describe("triage", () => {
  it("ranks overdue higher than later deadline", () => {
    const base = {
      sessionMinutes: 60,
      preferredDays: [1, 2, 3],
      preferredStartHour: 18,
      sections: [sec({ title: "Work", estimatedMinutes: 120, percentComplete: 0 })],
    };
    const overdue = { ...base, priority: 3, targetDate: "2020-01-01", title: "old", id: "1" };
    const later = { ...base, priority: 3, targetDate: "2099-01-01", title: "later", id: "2" };
    expect(triageScore(overdue)).toBeGreaterThan(triageScore(later));
    expect(sortByTriage([later, overdue])[0].title).toBe("old");
  });

  it("packs blocks until remaining work is scheduled", () => {
    const g = {
      id: "g1",
      title: "Office",
      priority: 2,
      sessionMinutes: 60,
      preferredDays: [0, 1, 2, 3, 4, 5, 6],
      preferredStartHour: 18,
      targetDate: null as string | null,
      sections: [sec({ title: "Cables", estimatedMinutes: 150, percentComplete: 0 })],
    };
    const blocks = triageBlocksFromGoal(g);
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    const total = blocks.reduce(
      (a, b) => a + (b.endsAt.getTime() - b.startsAt.getTime()) / 60000,
      0
    );
    expect(total).toBeGreaterThanOrEqual(150);
  });

  it("daysUntilDeadline handles null", () => {
    expect(daysUntilDeadline(null)).toBeNull();
  });
});

describe("allocateDayWindow", () => {
  it("splits window across goals and does not starve lagging goal", () => {
    const now = new Date("2026-07-16T08:00:00");
    const blocks = allocateDayWindow({
      now,
      windowStartMin: 9 * 60,
      windowEndMin: 13 * 60, // 4h
      busy: [{ startMin: 10 * 60, endMin: 11 * 60 }], // 1h busy → 3h free
      goals: [
        {
          id: "a",
          title: "Near done",
          priority: 2,
          sessionMinutes: 60,
          preferredDays: [1, 2, 3, 4, 5],
          preferredStartHour: 9,
          targetDate: "2026-08-01",
          percentComplete: 80,
          sections: [sec({ title: "A", estimatedMinutes: 120, percentComplete: 80 })],
        },
        {
          id: "b",
          title: "Lagging",
          priority: 2,
          sessionMinutes: 60,
          preferredDays: [1, 2, 3, 4, 5],
          preferredStartHour: 9,
          targetDate: "2026-07-20",
          percentComplete: 10,
          sections: [sec({ title: "B", estimatedMinutes: 240, percentComplete: 10 })],
        },
      ],
    });
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    const minsB = blocks.filter((x) => x.goalId === "b").reduce((a, x) => a + x.minutes, 0);
    const minsA = blocks.filter((x) => x.goalId === "a").reduce((a, x) => a + x.minutes, 0);
    // lagging + more remaining should get at least as much as near-done
    expect(minsB).toBeGreaterThanOrEqual(minsA);
    // respect busy gap
    for (const b of blocks) {
      expect(b.endMin <= 10 * 60 || b.startMin >= 11 * 60).toBe(true);
    }
  });
});
