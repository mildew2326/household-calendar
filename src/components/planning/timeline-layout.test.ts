import { describe, expect, it } from "vitest";
import { layoutOverlaps } from "./timeline-layout";

function b(id: string, startMin: number, durationMin: number) {
  return { id, startMin, durationMin };
}

describe("layoutOverlaps", () => {
  it("gives a 120m block two hours of visual range", () => {
    const laid = layoutOverlaps([b("a", 10 * 60, 120)], 6 * 60, 22 * 60);
    expect(laid).toHaveLength(1);
    expect(laid[0].visEnd - laid[0].visStart).toBe(120);
    expect(laid[0].colCount).toBe(1);
  });

  it("offsets two overlapping blocks into separate columns", () => {
    const laid = layoutOverlaps(
      [b("long", 10 * 60, 120), b("short", 10 * 60 + 30, 60)],
      6 * 60,
      22 * 60
    );
    expect(laid).toHaveLength(2);
    const cols = new Set(laid.map((x) => x.col));
    expect(cols.size).toBe(2);
    expect(laid[0].colCount).toBe(2);
    expect(laid[1].colCount).toBe(2);
  });

  it("keeps non-overlapping blocks in one column", () => {
    const laid = layoutOverlaps(
      [b("a", 9 * 60, 60), b("b", 11 * 60, 60)],
      6 * 60,
      22 * 60
    );
    expect(laid.every((x) => x.col === 0)).toBe(true);
    expect(laid.every((x) => x.colCount === 1)).toBe(true);
  });
});
