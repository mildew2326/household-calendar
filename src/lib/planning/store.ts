"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildShoppingFromMeals,
  isoDate,
  planBlocksFromGoal,
  type CalendarView,
  type DailyItem,
  type DailyPlan,
  type Goal,
  type HouseholdEvent,
  type Member,
  type PlannedMeal,
  type Priority,
} from "./types";

const MEMBER_A = "m-you";
const MEMBER_B = "m-partner";

function seedEvents(): HouseholdEvent[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const at = (dayOff: number, h: number, durH: number) => {
    const s = new Date(base);
    s.setDate(s.getDate() + dayOff);
    s.setHours(h, 0, 0, 0);
    const e = new Date(s);
    e.setHours(h + durH, 0, 0, 0);
    return { startsAt: s.toISOString(), endsAt: e.toISOString() };
  };
  return [
    {
      id: "ev1",
      title: "Date night",
      ...at(0, 19, 2),
      allDay: false,
      memberId: null,
      kind: "group",
      priority: 2,
      notes: "Group event",
    },
    {
      id: "ev2",
      title: "Dentist",
      ...at(1, 10, 1),
      allDay: false,
      memberId: MEMBER_B,
      kind: "personal",
      priority: 1,
    },
    {
      id: "ev3",
      title: "Deep work block",
      ...at(0, 9, 2),
      allDay: false,
      memberId: MEMBER_A,
      kind: "personal",
      priority: 1,
    },
    {
      id: "ev4",
      title: "Family grocery run",
      ...at(2, 11, 1),
      allDay: false,
      memberId: null,
      kind: "group",
      priority: 3,
    },
    {
      id: "ev5",
      title: "Trash day",
      ...at(3, 7, 1),
      allDay: true,
      memberId: MEMBER_A,
      kind: "personal",
      priority: 4,
    },
  ];
}

interface PlanningState {
  members: Member[];
  events: HouseholdEvent[];
  goals: Goal[];
  dailyPlans: Record<string, DailyPlan>;
  meals: PlannedMeal[];
  shoppingExtra: {
    id: string;
    name: string;
    qty: string;
    note: string;
    checked: boolean;
  }[];
  calendarView: CalendarView;
  selectedDate: string;
  groupColor: string;

  setCalendarView: (v: CalendarView) => void;
  setSelectedDate: (d: string) => void;
  setGroupColor: (c: string) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;

  addEvent: (e: Omit<HouseholdEvent, "id">) => void;
  updateEvent: (id: string, patch: Partial<HouseholdEvent>) => void;
  removeEvent: (id: string) => void;

  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  scheduleGoal: (goalId: string) => number;

  ensureDailyPlan: (date: string) => void;
  seedDayFromCalendar: (date: string) => void;
  upsertDailyItem: (date: string, item: DailyItem) => void;
  removeDailyItem: (date: string, itemId: string) => void;
  setTop3: (date: string, orderedIds: string[]) => void;
  toggleDailyDone: (date: string, itemId: string) => void;
  toggleDailySkipped: (date: string, itemId: string) => void;
  moveDailyItem: (
    date: string,
    itemId: string,
    startHour: number,
    startMinute: number
  ) => void;

  updateMeal: (id: string, patch: Partial<PlannedMeal>) => void;
  rebuildShoppingFromMeals: () => void;
  toggleShopItem: (id: string) => void;
  clearCheckedShop: () => void;

  combinedNutrition: () => {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    people: number;
  };
  shoppingLines: () => ReturnType<typeof buildShoppingFromMeals>;
}

const defaultMeals = (): PlannedMeal[] => {
  const t = isoDate();
  const d1 = new Date();
  d1.setDate(d1.getDate() + 1);
  return [
    {
      id: "meal1",
      day: t,
      title: "Salmon + rice + asparagus",
      servings: 2,
      portions: { [MEMBER_A]: 0.5, [MEMBER_B]: 0.5 },
      ingredients: [
        { name: "Salmon fillet", baseQty: 0.2, unit: "kg" },
        { name: "Rice", baseQty: 0.1, unit: "kg" },
        { name: "Asparagus", baseQty: 0.15, unit: "kg" },
      ],
    },
    {
      id: "meal2",
      day: isoDate(d1),
      title: "Beef tacos",
      servings: 2,
      portions: { [MEMBER_A]: 0.55, [MEMBER_B]: 0.45 },
      ingredients: [
        { name: "Ground beef", baseQty: 0.25, unit: "kg" },
        { name: "Tortillas", baseQty: 4, unit: "pcs" },
        { name: "Salsa", baseQty: 0.1, unit: "kg" },
      ],
    },
  ];
};

export const usePlanningStore = create<PlanningState>()(
  persist(
    (set, get) => ({
      members: [
        {
          id: MEMBER_A,
          name: "You",
          color: "#0e7c66",
          calories: 2200,
          protein: 160,
          carbs: 200,
          fat: 70,
          active: true,
        },
        {
          id: MEMBER_B,
          name: "Partner",
          color: "#1d4ed8",
          calories: 1800,
          protein: 130,
          carbs: 160,
          fat: 55,
          active: true,
        },
      ],
      events: seedEvents(),
      goals: [
        {
          id: "g1",
          title: "Home office setup",
          description: "Cable management, desk layout, lighting",
          status: "active",
          priority: 2,
          memberIds: [MEMBER_A],
          targetDate: null,
          preferredDays: [1, 3, 5], // Mon Wed Fri
          preferredStartHour: 18,
          sessionMinutes: 60,
        },
        {
          id: "g2",
          title: "Couples meal prep habit",
          description: "Sunday batch cook + midweek refresh",
          status: "active",
          priority: 1,
          memberIds: [MEMBER_A, MEMBER_B],
          preferredDays: [0],
          preferredStartHour: 15,
          sessionMinutes: 90,
        },
      ],
      dailyPlans: {},
      meals: defaultMeals(),
      shoppingExtra: [],
      calendarView: "threeDay",
      selectedDate: isoDate(),
      groupColor: "#7c3aed",

      setCalendarView: (v) => set({ calendarView: v }),
      setSelectedDate: (d) => set({ selectedDate: d }),
      setGroupColor: (c) => set({ groupColor: c }),
      updateMember: (id, patch) =>
        set({
          members: get().members.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        }),

      addEvent: (e) =>
        set({
          events: [...get().events, { ...e, id: crypto.randomUUID() }],
        }),
      updateEvent: (id, patch) =>
        set({
          events: get().events.map((e) =>
            e.id === id ? { ...e, ...patch } : e
          ),
        }),
      removeEvent: (id) =>
        set({ events: get().events.filter((e) => e.id !== id) }),

      addGoal: (g) =>
        set({ goals: [...get().goals, { ...g, id: crypto.randomUUID() }] }),
      updateGoal: (id, patch) =>
        set({
          goals: get().goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        }),
      removeGoal: (id) =>
        set({ goals: get().goals.filter((g) => g.id !== id) }),

      scheduleGoal: (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return 0;
        const blocks = planBlocksFromGoal(goal, 2);
        const newEvents: HouseholdEvent[] = blocks.map((b) => ({
          id: crypto.randomUUID(),
          title: b.title,
          startsAt: b.startsAt.toISOString(),
          endsAt: b.endsAt.toISOString(),
          allDay: false,
          memberId: goal.memberIds.length === 1 ? goal.memberIds[0] : null,
          kind: goal.memberIds.length > 1 ? "group" : "personal",
          priority: goal.priority,
          goalId: goal.id,
        }));
        set({ events: [...get().events, ...newEvents] });
        return newEvents.length;
      },

      ensureDailyPlan: (date) => {
        if (get().dailyPlans[date]) return;
        set({
          dailyPlans: {
            ...get().dailyPlans,
            [date]: { date, items: [] },
          },
        });
      },

      seedDayFromCalendar: (date) => {
        get().ensureDailyPlan(date);
        const dayEvents = get().events.filter((e) =>
          e.startsAt.startsWith(date)
        );
        const existing = get().dailyPlans[date]?.items ?? [];
        const existingKeys = new Set(
          existing.map((i) => `${i.sourceType}:${i.sourceId}`)
        );
        const additions: DailyItem[] = [];
        for (const e of dayEvents) {
          const key = `event:${e.id}`;
          if (existingKeys.has(key)) continue;
          const s = new Date(e.startsAt);
          const en = new Date(e.endsAt);
          const dur = Math.max(
            15,
            Math.round((en.getTime() - s.getTime()) / 60000)
          );
          additions.push({
            id: crypto.randomUUID(),
            sourceType: "event",
            sourceId: e.id,
            title: e.title,
            startHour: e.allDay ? 9 : s.getHours(),
            startMinute: e.allDay ? 0 : s.getMinutes(),
            durationMinutes: e.allDay ? 60 : dur,
            done: false,
            skipped: false,
            isTop3: false,
            top3Rank: null,
          });
        }
        // pull active goals as optional blocks
        for (const g of get().goals.filter((x) => x.status === "active")) {
          const key = `goal:${g.id}`;
          if (existingKeys.has(key)) continue;
          const dow = new Date(date + "T12:00:00").getDay();
          if (!g.preferredDays.includes(dow)) continue;
          additions.push({
            id: crypto.randomUUID(),
            sourceType: "goal",
            sourceId: g.id,
            title: g.title,
            startHour: g.preferredStartHour,
            startMinute: 0,
            durationMinutes: g.sessionMinutes,
            done: false,
            skipped: false,
            isTop3: false,
            top3Rank: null,
          });
        }
        set({
          dailyPlans: {
            ...get().dailyPlans,
            [date]: {
              date,
              items: [...existing, ...additions],
            },
          },
        });
      },

      upsertDailyItem: (date, item) => {
        get().ensureDailyPlan(date);
        const plan = get().dailyPlans[date];
        const others = plan.items.filter((i) => i.id !== item.id);
        set({
          dailyPlans: {
            ...get().dailyPlans,
            [date]: { ...plan, items: [...others, item] },
          },
        });
      },

      removeDailyItem: (date, itemId) => {
        const plan = get().dailyPlans[date];
        if (!plan) return;
        set({
          dailyPlans: {
            ...get().dailyPlans,
            [date]: {
              ...plan,
              items: plan.items.filter((i) => i.id !== itemId),
            },
          },
        });
      },

      setTop3: (date, orderedIds) => {
        const plan = get().dailyPlans[date];
        if (!plan) return;
        const rank = new Map(orderedIds.slice(0, 3).map((id, i) => [id, (i + 1) as 1 | 2 | 3]));
        set({
          dailyPlans: {
            ...get().dailyPlans,
            [date]: {
              ...plan,
              items: plan.items.map((i) => ({
                ...i,
                isTop3: rank.has(i.id),
                top3Rank: rank.get(i.id) ?? null,
              })),
            },
          },
        });
      },

      toggleDailyDone: (date, itemId) => {
        const plan = get().dailyPlans[date];
        if (!plan) return;
        set({
          dailyPlans: {
            ...get().dailyPlans,
            [date]: {
              ...plan,
              items: plan.items.map((i) =>
                i.id === itemId ? { ...i, done: !i.done, skipped: false } : i
              ),
            },
          },
        });
      },

      toggleDailySkipped: (date, itemId) => {
        const plan = get().dailyPlans[date];
        if (!plan) return;
        set({
          dailyPlans: {
            ...get().dailyPlans,
            [date]: {
              ...plan,
              items: plan.items.map((i) =>
                i.id === itemId
                  ? { ...i, skipped: !i.skipped, done: false }
                  : i
              ),
            },
          },
        });
      },

      moveDailyItem: (date, itemId, startHour, startMinute) => {
        const plan = get().dailyPlans[date];
        if (!plan) return;
        set({
          dailyPlans: {
            ...get().dailyPlans,
            [date]: {
              ...plan,
              items: plan.items.map((i) =>
                i.id === itemId ? { ...i, startHour, startMinute } : i
              ),
            },
          },
        });
      },

      updateMeal: (id, patch) =>
        set({
          meals: get().meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        }),

      rebuildShoppingFromMeals: () => {
        const lines = buildShoppingFromMeals(get().meals, get().members);
        set({
          shoppingExtra: lines.map((l, i) => ({
            id: `shop-${i}-${l.name}`,
            name: l.name,
            qty: `${l.qty} ${l.unit}`,
            note: `${l.mealTitle} · ${l.note}`,
            checked: false,
          })),
        });
      },

      toggleShopItem: (id) =>
        set({
          shoppingExtra: get().shoppingExtra.map((s) =>
            s.id === id ? { ...s, checked: !s.checked } : s
          ),
        }),
      clearCheckedShop: () =>
        set({
          shoppingExtra: get().shoppingExtra.filter((s) => !s.checked),
        }),

      combinedNutrition: () => {
        const active = get().members.filter((m) => m.active);
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
      },

      shoppingLines: () => buildShoppingFromMeals(get().meals, get().members),
    }),
    { name: "duet-planning-v1" }
  )
);

export { MEMBER_A, MEMBER_B };
export type { Priority };
