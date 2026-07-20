/** Pure layout helpers for day-column timeline (no React). */

export type LayoutBlockIn = {
  id: string;
  startMin: number;
  durationMin: number;
};

export type LayoutBlockOut<T extends LayoutBlockIn = LayoutBlockIn> = T & {
  visStart: number;
  visEnd: number;
  col: number;
  colCount: number;
};

/** Assign side-by-side columns for overlapping intervals. */
export function layoutOverlaps<T extends LayoutBlockIn>(
  blocks: T[],
  rangeStart: number,
  rangeEnd: number
): LayoutBlockOut<T>[] {
  const prepared = blocks
    .map((b) => {
      const durationMin = Math.max(15, Number(b.durationMin) || 30);
      const startMin = Number(b.startMin) || 0;
      const endMin = startMin + durationMin;
      const visStart = Math.max(startMin, rangeStart);
      const visEnd = Math.min(endMin, rangeEnd);
      return {
        ...b,
        startMin,
        durationMin,
        visStart,
        visEnd,
      };
    })
    .filter((b) => b.visEnd > b.visStart)
    .sort(
      (a, b) => a.visStart - b.visStart || b.durationMin - a.durationMin
    );

  const colFreeAt: number[] = [];
  const placed: (typeof prepared[0] & { col: number })[] = [];

  for (const b of prepared) {
    let col = 0;
    while (col < colFreeAt.length && colFreeAt[col] > b.visStart) {
      col++;
    }
    if (col === colFreeAt.length) colFreeAt.push(b.visEnd);
    else colFreeAt[col] = b.visEnd;
    placed.push({ ...b, col });
  }

  const result: LayoutBlockOut<T>[] = [];
  let i = 0;
  while (i < placed.length) {
    let clusterEnd = placed[i].visEnd;
    let j = i + 1;
    while (j < placed.length && placed[j].visStart < clusterEnd) {
      clusterEnd = Math.max(clusterEnd, placed[j].visEnd);
      j++;
    }
    const cluster = placed.slice(i, j);
    const colCount = Math.max(1, ...cluster.map((c) => c.col + 1));
    for (const c of cluster) {
      result.push({ ...c, colCount } as LayoutBlockOut<T>);
    }
    i = j;
  }
  return result;
}
