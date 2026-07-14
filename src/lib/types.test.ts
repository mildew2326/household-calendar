import { describe, expect, it } from "vitest";
import { projectEventForViewer, type CalendarEvent } from "./types";

const base: CalendarEvent = {
  id: "e1",
  household_id: "h1",
  title: "Therapy",
  starts_at: "2026-07-14T15:00:00Z",
  ends_at: "2026-07-14T16:00:00Z",
  all_day: false,
  timezone: "America/New_York",
  created_by: "user-a",
  visibility: "private",
  status: "confirmed",
};

describe("projectEventForViewer", () => {
  it("hides private event details from partner", () => {
    const projected = projectEventForViewer(base, "user-b");
    expect(projected).toMatchObject({
      title: "Busy",
      isBusy: true,
      visibility: "private",
    });
    expect(projected).not.toHaveProperty("description");
  });

  it("shows private event to creator", () => {
    const projected = projectEventForViewer(base, "user-a");
    expect(projected).toMatchObject({ title: "Therapy", visibility: "private" });
  });

  it("shows shared events to everyone", () => {
    const shared = { ...base, visibility: "shared" as const, title: "Dinner" };
    const projected = projectEventForViewer(shared, "user-b");
    expect(projected).toMatchObject({ title: "Dinner" });
  });
});
