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
  goalId?: string | null;
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
