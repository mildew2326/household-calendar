/** Goal progress + time-triage helpers (pure, unit-testable). */

export interface GoalSubtask {
  id: string;
  title: string;
  done: boolean;
  estimatedMinutes: number;
}

export interface GoalSection {
  id: string;
  title: string;
  estimatedMinutes: number;
  /** 0–100; ignored if subsections exist (then derived) */
  percentComplete: number;
  done: boolean;
  subsections: GoalSubtask[];
}

export interface GoalProgressInput {
  targetDate?: string | null;
  priority: number; // 1 high – 5 low
  sessionMinutes: number;
  preferredDays: number[];
  preferredStartHour: number;
  sections: GoalSection[];
  /** manual override if no sections */
  percentComplete?: number;
}

export function sectionPercent(section: GoalSection): number {
  if (section.done) return 100;
  if (section.subsections?.length) {
    const total = section.subsections.reduce(
      (a, s) => a + Math.max(1, s.estimatedMinutes || 30),
      0
    );
    if (!total) return 0;
    const done = section.subsections.reduce(
      (a, s) => a + (s.done ? Math.max(1, s.estimatedMinutes || 30) : 0),
      0
    );
    return Math.round((done / total) * 100);
  }
  return Math.max(0, Math.min(100, section.percentComplete ?? 0));
}

export function goalPercent(goal: GoalProgressInput): number {
  const sections = goal.sections ?? [];
  if (!sections.length) {
    return Math.max(0, Math.min(100, goal.percentComplete ?? 0));
  }
  const weights = sections.map((s) => Math.max(15, s.estimatedMinutes || 60));
  const total = weights.reduce((a, b) => a + b, 0);
  if (!total) return 0;
  let acc = 0;
  sections.forEach((s, i) => {
    acc += (sectionPercent(s) / 100) * weights[i];
  });
  return Math.round((acc / total) * 100);
}

export function remainingMinutes(goal: GoalProgressInput): number {
  const sections = goal.sections ?? [];
  if (!sections.length) {
    const pct = goalPercent(goal);
    const est = Math.max(60, (goal.sessionMinutes || 60) * 4);
    return Math.round(est * (1 - pct / 100));
  }
  let rem = 0;
  for (const s of sections) {
    if (s.subsections?.length) {
      for (const sub of s.subsections) {
        if (!sub.done) rem += Math.max(15, sub.estimatedMinutes || 30);
      }
    } else {
      const pct = sectionPercent(s);
      rem += Math.round(Math.max(15, s.estimatedMinutes || 60) * (1 - pct / 100));
    }
  }
  return rem;
}

export function daysUntilDeadline(
  targetDate: string | null | undefined,
  now = new Date()
): number | null {
  if (!targetDate) return null;
  const end = new Date(targetDate + "T23:59:59");
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

/** Higher = more urgent triage score */
export function triageScore(goal: GoalProgressInput, now = new Date()): number {
  const rem = remainingMinutes(goal);
  const days = daysUntilDeadline(goal.targetDate, now);
  const pri = 6 - Math.max(1, Math.min(5, goal.priority || 3)); // 5..1
  let urgency = pri * 10;
  if (days === null) {
    urgency += rem / 60; // soft pressure by remaining hours
  } else if (days < 0) {
    urgency += 100 + rem / 30; // overdue
  } else if (days === 0) {
    urgency += 80 + rem / 30;
  } else {
    // remaining work density
    const hoursPerDay = rem / 60 / Math.max(1, days);
    urgency += hoursPerDay * 25 + (14 - Math.min(14, days)) * 2;
  }
  // incomplete goals with low % rank higher than near-done
  urgency += (100 - goalPercent(goal)) * 0.15;
  return urgency;
}

export function sortByTriage<T extends GoalProgressInput>(
  goals: T[],
  now = new Date()
): T[] {
  return [...goals].sort(
    (a, b) => triageScore(b, now) - triageScore(a, now)
  );
}

/**
 * Pack remaining work into calendar blocks from tomorrow through deadline
 * (or 14 days if no deadline), on preferred days/hours.
 */
export function triageBlocksFromGoal(
  goal: GoalProgressInput & { title: string; id: string },
  now = new Date()
): { title: string; startsAt: Date; endsAt: Date; sectionTitle?: string }[] {
  let rem = remainingMinutes(goal);
  if (rem <= 0) return [];
  const session = Math.max(30, goal.sessionMinutes || 60);
  const preferred =
    goal.preferredDays?.length > 0 ? goal.preferredDays : [1, 2, 3, 4, 5];
  const hour = goal.preferredStartHour ?? 18;

  const days = daysUntilDeadline(goal.targetDate, now);
  // Work backward from deadline when set; else 14-day forward pack
  const horizon = days === null ? 14 : Math.max(1, days);
  const blocks: {
    title: string;
    startsAt: Date;
    endsAt: Date;
    sectionTitle?: string;
  }[] = [];

  const openSections = (goal.sections ?? []).filter((s) => sectionPercent(s) < 100);

  if (days !== null && days >= 0) {
    // backward from target date
    let dayOff = 0;
    let guard = 0;
    const end = new Date(goal.targetDate + "T12:00:00");
    while (rem > 0 && guard < 60) {
      guard++;
      const day = new Date(end);
      day.setDate(end.getDate() - dayOff);
      dayOff++;
      if (day < new Date(now.getFullYear(), now.getMonth(), now.getDate())) break;
      if (!preferred.includes(day.getDay())) continue;
      const chunk = Math.min(session, rem);
      const s = new Date(day);
      s.setHours(hour, 0, 0, 0);
      const e = new Date(s);
      e.setMinutes(e.getMinutes() + chunk);
      const sec = openSections[blocks.length % Math.max(1, openSections.length)];
      blocks.unshift({
        title: sec ? `${goal.title}: ${sec.title}` : `Goal: ${goal.title}`,
        startsAt: s,
        endsAt: e,
        sectionTitle: sec?.title,
      });
      rem -= chunk;
    }
    return blocks;
  }

  let dayOff = 0;
  let guard = 0;
  while (rem > 0 && guard < 60) {
    guard++;
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + dayOff);
    dayOff++;
    if (dayOff > horizon + 1) break;
    if (!preferred.includes(day.getDay())) continue;

    const chunk = Math.min(session, rem);
    const s = new Date(day);
    s.setHours(hour, 0, 0, 0);
    const e = new Date(s);
    e.setMinutes(e.getMinutes() + chunk);
    const sec = openSections[blocks.length % Math.max(1, openSections.length)];
    blocks.push({
      title: sec
        ? `${goal.title}: ${sec.title}`
        : `Goal: ${goal.title}`,
      startsAt: s,
      endsAt: e,
      sectionTitle: sec?.title,
    });
    rem -= chunk;
  }
  return blocks;
}

export type DayGoalInput = GoalProgressInput & {
  id: string;
  title: string;
  memberIds?: string[];
};

export type BusyInterval = { startMin: number; endMin: number }; // minutes from midnight

export interface DayAllocationBlock {
  goalId: string;
  title: string;
  startMin: number;
  endMin: number;
  protected: boolean;
  minutes: number;
  shareReason: string;
}

/**
 * Allocate a single day's focus window across multiple goals.
 * Balanced by remaining work + lagging progress so one goal can't starve others.
 * Real busy intervals are never overwritten — free gaps inside the window are packed.
 */
export function allocateDayWindow(opts: {
  goals: DayGoalInput[];
  windowStartMin: number; // e.g. 9*60
  windowEndMin: number; // e.g. 17*60
  busy?: BusyInterval[];
  ownerId?: string | null;
  now?: Date;
  minBlockMin?: number;
}): DayAllocationBlock[] {
  const minBlock = opts.minBlockMin ?? 25;
  const now = opts.now ?? new Date();
  const free = freeSegments(
    opts.windowStartMin,
    opts.windowEndMin,
    opts.busy ?? []
  );
  const totalFree = free.reduce((a, s) => a + (s.end - s.start), 0);
  if (totalFree < minBlock) return [];

  let goals = opts.goals.filter((g) => remainingMinutes(g) > 0);
  if (opts.ownerId) {
    goals = goals.filter(
      (g) =>
        !g.memberIds?.length ||
        g.memberIds.includes(opts.ownerId!) ||
        g.memberIds.length === 0
    );
  }
  if (!goals.length) return [];

  // Fair weights: remaining work * lag factor * priority
  const weights = goals.map((g) => {
    const rem = remainingMinutes(g);
    const pct = goalPercent(g);
    const days = daysUntilDeadline(g.targetDate, now);
    // Expected linear progress if deadline exists
    let lag = 1;
    if (days !== null && days >= 0) {
      // crude: if far from done with little time left, boost
      const urgency = days <= 0 ? 2.2 : 1 + Math.min(1.5, 8 / Math.max(1, days));
      lag = urgency * (1.15 - pct / 200); // lower % → higher lag
    } else {
      lag = 1.1 + (100 - pct) / 100; // no deadline: favor incomplete
    }
    const pri = 6 - Math.max(1, Math.min(5, g.priority || 3));
    return Math.max(0.01, rem * lag * (0.7 + pri * 0.15));
  });
  const wsum = weights.reduce((a, b) => a + b, 0) || 1;

  // Target minutes per goal (cap by remaining)
  const targets = goals.map((g, i) => {
    const fair = Math.floor((weights[i] / wsum) * totalFree);
    const rem = remainingMinutes(g);
    // Ensure every goal with work gets at least minBlock if window allows
    return Math.min(rem, Math.max(minBlock, fair));
  });

  // Renormalize if sum targets > free
  let tsum = targets.reduce((a, b) => a + b, 0);
  if (tsum > totalFree) {
    const scale = totalFree / tsum;
    for (let i = 0; i < targets.length; i++) {
      targets[i] = Math.max(minBlock, Math.floor(targets[i] * scale));
    }
    // trim overflow from lowest priority
    tsum = targets.reduce((a, b) => a + b, 0);
    let overflow = tsum - totalFree;
    const order = goals
      .map((g, i) => i)
      .sort((a, b) => (goals[b].priority || 3) - (goals[a].priority || 3));
    for (const i of order) {
      if (overflow <= 0) break;
      const cut = Math.min(overflow, Math.max(0, targets[i] - minBlock));
      targets[i] -= cut;
      overflow -= cut;
    }
  }

  // Pack P1 first, then by weight
  const order = goals
    .map((g, i) => i)
    .sort((a, b) => {
      const pa = goals[a].priority || 3;
      const pb = goals[b].priority || 3;
      if (pa !== pb) return pa - pb;
      return weights[b] - weights[a];
    });

  const out: DayAllocationBlock[] = [];
  const remainingTarget = [...targets];

  for (const i of order) {
    let need = remainingTarget[i];
    if (need < minBlock) continue;
    const g = goals[i];
    const isProt = (g.priority || 3) <= 1;
    for (let fi = 0; fi < free.length && need >= minBlock; fi++) {
      const seg = free[fi];
      const avail = seg.end - seg.start;
      if (avail < minBlock) continue;
      const take = Math.min(need, avail);
      if (take < minBlock) continue;
      const startMin = seg.start;
      const endMin = startMin + take;
      out.push({
        goalId: g.id,
        title: `Goal: ${g.title}`,
        startMin,
        endMin,
        protected: isProt,
        minutes: take,
        shareReason: `${Math.round((weights[i] / wsum) * 100)}% share · ${goalPercent(g)}% done · ${remainingMinutes(g)}m left`,
      });
      seg.start = endMin;
      need -= take;
    }
  }

  return out.sort((a, b) => a.startMin - b.startMin);
}

function freeSegments(
  winStart: number,
  winEnd: number,
  busy: BusyInterval[]
): { start: number; end: number }[] {
  const clipped = busy
    .map((b) => ({
      start: Math.max(winStart, b.startMin),
      end: Math.min(winEnd, b.endMin),
    }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  const segs: { start: number; end: number }[] = [];
  let cursor = winStart;
  for (const b of clipped) {
    if (b.start > cursor) segs.push({ start: cursor, end: b.start });
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < winEnd) segs.push({ start: cursor, end: winEnd });
  return segs;
}
