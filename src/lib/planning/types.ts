/** Household planning: members, events, goals, daily plans, family nutrition. */

export type EventKind = "personal" | "group";
export type CalendarView = "day" | "threeDay" | "week" | "month";
export type GoalStatus = "active" | "paused" | "done";
export type Priority = 1 | 2 | 3 | 4 | 5;

export interface Member {
  id: string;
  name: string;
  color: string;
  /** nutrition targets */
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  active: boolean;
}

export interface HouseholdEvent {
  id: string;
  title: string;
  startsAt: string; // ISO
  endsAt: string;
  allDay: boolean;
  memberId: string | null; // null = group
  kind: EventKind;
  colorOverride?: string | null;
  priority: Priority;
  notes?: string;
  location?: string;
  /** RRULE-ish simple: DAILY|WEEKLY|MONTHLY or empty */
  recurrence?: string | null;
  /** minutes before start */
  reminderMinutes?: number[];
  comments?: EventComment[];
  goalId?: string | null;
  deleted?: boolean;
}

export interface EventComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  at: string;
  actorId: string;
  message: string;
}

export interface HouseholdEventOccurrence extends HouseholdEvent {
  occurrenceStart: string;
  occurrenceEnd: string;
  isOccurrence: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  priority: Priority;
  memberIds: string[];
  targetDate?: string | null;
  preferredDays: number[]; // 0=Sun..6=Sat
  preferredStartHour: number; // 0-23
  sessionMinutes: number;
}

export interface DailyItem {
  id: string;
  sourceType: "event" | "goal" | "task" | "custom";
  sourceId?: string;
  title: string;
  startHour: number; // 0-23 fractional ok via minutes
  startMinute: number;
  durationMinutes: number;
  done: boolean;
  skipped: boolean;
  isTop3: boolean;
  top3Rank?: 1 | 2 | 3 | null;
  notes?: string;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  items: DailyItem[];
  notes?: string;
}

export interface PlannedMeal {
  id: string;
  day: string;
  title: string;
  servings: number;
  /** portion share per member id (sums ~1) */
  portions: Record<string, number>;
  ingredients: { name: string; baseQty: number; unit: string }[];
}

export function isoDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function eventColor(
  e: HouseholdEvent,
  members: Member[],
  groupColor = "#7c3aed"
): string {
  if (e.colorOverride) return e.colorOverride;
  if (e.kind === "group" || !e.memberId) return groupColor;
  return members.find((m) => m.id === e.memberId)?.color ?? "#64748b";
}

export function combinedTargets(members: Member[]) {
  const active = members.filter((m) => m.active);
  return active.reduce(
    (a, m) => ({
      calories: a.calories + m.calories,
      protein: a.protein + m.protein,
      carbs: a.carbs + m.carbs,
      fat: a.fat + m.fat,
      people: a.people + 1,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, people: 0 }
  );
}

/** Scale ingredients by servings and attach portion notes */
export function buildShoppingFromMeals(
  meals: PlannedMeal[],
  members: Member[]
): {
  name: string;
  qty: number;
  unit: string;
  note: string;
  mealTitle: string;
}[] {
  const out: {
    name: string;
    qty: number;
    unit: string;
    note: string;
    mealTitle: string;
  }[] = [];
  for (const meal of meals) {
    const portionNote = members
      .filter((m) => m.active && (meal.portions[m.id] ?? 0) > 0)
      .map((m) => `${m.name} ${Math.round((meal.portions[m.id] ?? 0) * 100)}%`)
      .join(" · ");
    for (const ing of meal.ingredients) {
      out.push({
        name: ing.name,
        qty: Math.round(ing.baseQty * meal.servings * 100) / 100,
        unit: ing.unit,
        note: portionNote || "household",
        mealTitle: meal.title,
      });
    }
  }
  return out;
}

export function planBlocksFromGoal(
  goal: Goal,
  weeks = 2
): { title: string; startsAt: Date; endsAt: Date }[] {
  const blocks: { title: string; startsAt: Date; endsAt: Date }[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let d = 0; d < weeks * 7; d++) {
    const day = new Date(start);
    day.setDate(start.getDate() + d);
    if (!goal.preferredDays.includes(day.getDay())) continue;
    const s = new Date(day);
    s.setHours(goal.preferredStartHour, 0, 0, 0);
    const e = new Date(s);
    e.setMinutes(e.getMinutes() + goal.sessionMinutes);
    blocks.push({ title: `Goal: ${goal.title}`, startsAt: s, endsAt: e });
  }
  return blocks;
}

export function top3Items(items: DailyItem[]): DailyItem[] {
  return items
    .filter((i) => i.isTop3 && !i.skipped)
    .sort((a, b) => (a.top3Rank ?? 9) - (b.top3Rank ?? 9))
    .slice(0, 3);
}

/** Expand simple recurrence over a date window (inclusive-ish by day). */
export function expandEvents(
  events: HouseholdEvent[],
  rangeStart: Date,
  rangeEnd: Date
): HouseholdEventOccurrence[] {
  const out: HouseholdEventOccurrence[] = [];
  const startMs = rangeStart.getTime();
  const endMs = rangeEnd.getTime();

  for (const ev of events) {
    if (ev.deleted) continue;
    const baseStart = new Date(ev.startsAt);
    const baseEnd = new Date(ev.endsAt);
    const dur = baseEnd.getTime() - baseStart.getTime();
    const rule = (ev.recurrence || "").toUpperCase();

    if (!rule || rule === "NONE") {
      if (baseEnd.getTime() >= startMs && baseStart.getTime() <= endMs) {
        out.push({
          ...ev,
          occurrenceStart: ev.startsAt,
          occurrenceEnd: ev.endsAt,
          isOccurrence: false,
        });
      }
      continue;
    }

    const cursor = new Date(baseStart);
    // walk from base until past rangeEnd, cap 400 iterations
    for (let i = 0; i < 400; i++) {
      const occStart = new Date(cursor);
      const occEnd = new Date(occStart.getTime() + dur);
      if (occEnd.getTime() >= startMs && occStart.getTime() <= endMs) {
        out.push({
          ...ev,
          occurrenceStart: occStart.toISOString(),
          occurrenceEnd: occEnd.toISOString(),
          isOccurrence: i > 0,
        });
      }
      if (occStart.getTime() > endMs) break;
      if (rule === "DAILY") cursor.setDate(cursor.getDate() + 1);
      else if (rule === "WEEKLY") cursor.setDate(cursor.getDate() + 7);
      else if (rule === "MONTHLY") cursor.setMonth(cursor.getMonth() + 1);
      else break;
      // don't expand occurrences before the series start into the past of base
      if (cursor.getTime() < baseStart.getTime()) break;
    }
  }

  return out.sort((a, b) =>
    a.occurrenceStart.localeCompare(b.occurrenceStart)
  );
}

/**
 * Natural language quick add.
 * Examples: "Dentist tomorrow 10am", "Date night Friday 7pm", "Trash every week"
 */
export function parseNaturalLanguage(
  input: string,
  now = new Date()
): Partial<HouseholdEvent> & { title: string } {
  let text = input.trim();
  let allDay = false;
  let recurrence: string | null = null;
  const when = new Date(now);
  when.setSeconds(0, 0);

  if (/\bevery\s+day\b/i.test(text) || /\bdaily\b/i.test(text)) {
    recurrence = "DAILY";
    text = text.replace(/\bevery\s+day\b/gi, "").replace(/\bdaily\b/gi, "");
  } else if (/\bevery\s+week\b/i.test(text) || /\bweekly\b/i.test(text)) {
    recurrence = "WEEKLY";
    text = text.replace(/\bevery\s+week\b/gi, "").replace(/\bweekly\b/gi, "");
  } else if (/\bevery\s+month\b/i.test(text) || /\bmonthly\b/i.test(text)) {
    recurrence = "MONTHLY";
    text = text.replace(/\bevery\s+month\b/gi, "").replace(/\bmonthly\b/gi, "");
  }

  if (/\btomorrow\b/i.test(text)) {
    when.setDate(when.getDate() + 1);
    text = text.replace(/\btomorrow\b/gi, "");
  } else if (/\btoday\b/i.test(text)) {
    text = text.replace(/\btoday\b/gi, "");
  } else {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    for (let i = 0; i < days.length; i++) {
      const re = new RegExp(`\\b${days[i]}\\b`, "i");
      if (re.test(text)) {
        const target = i;
        const cur = when.getDay();
        let add = (target - cur + 7) % 7;
        if (add === 0) add = 7;
        when.setDate(when.getDate() + add);
        text = text.replace(re, "");
        break;
      }
    }
  }

  let hour = 9;
  let minute = 0;
  const ampm = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  const mil = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (ampm) {
    hour = Number(ampm[1]) % 12;
    if (ampm[3].toLowerCase() === "pm") hour += 12;
    minute = Number(ampm[2] || 0);
    text = text.replace(ampm[0], "");
  } else if (mil) {
    hour = Number(mil[1]);
    minute = Number(mil[2]);
    text = text.replace(mil[0], "");
  } else if (/\ball\s*day\b/i.test(text)) {
    allDay = true;
    text = text.replace(/\ball\s*day\b/gi, "");
  }

  when.setHours(allDay ? 0 : hour, allDay ? 0 : minute, 0, 0);
  const end = new Date(when);
  if (allDay) end.setHours(23, 59, 0, 0);
  else end.setHours(end.getHours() + 1);

  const title = text.replace(/\s+/g, " ").trim() || input.trim();

  return {
    title,
    startsAt: when.toISOString(),
    endsAt: end.toISOString(),
    allDay,
    recurrence,
    reminderMinutes: [60, 1440],
    kind: "group",
    memberId: null,
    priority: 3,
  };
}

export function upcomingReminders(
  events: HouseholdEvent[],
  now = new Date(),
  horizonMinutes = 60 * 36
): { event: HouseholdEvent; fireAt: Date; minutesBefore: number }[] {
  const out: { event: HouseholdEvent; fireAt: Date; minutesBefore: number }[] =
    [];
  const end = new Date(now.getTime() + horizonMinutes * 60000);
  const expanded = expandEvents(
    events,
    new Date(now.getTime() - 60000),
    end
  );
  for (const ev of expanded) {
    const mins = ev.reminderMinutes?.length ? ev.reminderMinutes : [60];
    const start = new Date(ev.occurrenceStart);
    for (const m of mins) {
      const fire = new Date(start.getTime() - m * 60000);
      if (fire >= now && fire <= end) {
        out.push({ event: ev, fireAt: fire, minutesBefore: m });
      }
    }
  }
  return out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
}
