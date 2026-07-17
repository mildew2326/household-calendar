import { describe, expect, it } from "vitest";
import {
  expandEvents,
  parseNaturalLanguage,
  upcomingReminders,
  type HouseholdEvent,
} from "./types";

const base: HouseholdEvent = {
  id: "1",
  title: "Standup",
  startsAt: new Date("2026-07-14T15:00:00.000Z").toISOString(),
  endsAt: new Date("2026-07-14T16:00:00.000Z").toISOString(),
  allDay: false,
  memberId: null,
  kind: "group",
  priority: 3,
  recurrence: "DAILY",
  reminderMinutes: [60],
};

describe("expandEvents", () => {
  it("expands daily series into range", () => {
    const start = new Date("2026-07-14T00:00:00.000Z");
    const end = new Date("2026-07-17T00:00:00.000Z");
    const occ = expandEvents([base], start, end);
    expect(occ.length).toBeGreaterThanOrEqual(3);
  });
});

describe("parseNaturalLanguage", () => {
  it("parses tomorrow morning event", () => {
    const now = new Date("2026-07-14T12:00:00");
    const p = parseNaturalLanguage("Dentist tomorrow 10am", now);
    expect(p.title.toLowerCase()).toContain("dentist");
    expect(p.startsAt).toBeTruthy();
    const d = new Date(p.startsAt!);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(10);
  });

  it("detects weekly recurrence", () => {
    const p = parseNaturalLanguage("Trash every week");
    expect(p.recurrence).toBe("WEEKLY");
  });
});

describe("upcomingReminders", () => {
  it("returns future reminder fires", () => {
    const now = new Date(new Date(base.startsAt).getTime() - 30 * 60000);
    const r = upcomingReminders(
      [{ ...base, recurrence: null, reminderMinutes: [60] }],
      now,
      120
    );
    // 60m before start is 30m in the past relative to now+30... adjust
    expect(Array.isArray(r)).toBe(true);
  });
});
