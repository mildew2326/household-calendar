"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildShoppingFromMeals,
  isoDate,
  parseNaturalLanguage,
  planBlocksFromGoal,
  type ActivityItem,
  type CalendarView,
  type DailyItem,
  type DailyPlan,
  type EventComment,
  type Goal,
  type GoalSection,
  type GoalSubtask,
  type HouseholdEvent,
  type HouseholdTask,
  type Member,
  type PlannedMeal,
  type Priority,
} from "./types";
import {
  allocateDayWindow,
  goalPercent,
  remainingMinutes,
  sortByTriage,
  triageBlocksFromGoal,
} from "./goal-math";
import { expandEvents } from "./types";

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
      recurrence: "WEEKLY",
      reminderMinutes: [720],
    },
    {
      id: "ev6",
      title: "Partner focus block",
      ...at(0, 14, 1),
      allDay: false,
      memberId: MEMBER_B,
      kind: "personal",
      priority: 2,
      location: "Home office",
      notes: "Do not schedule over this",
      reminderMinutes: [30, 60],
    },
  ];
}

interface PlanningState {
  members: Member[];
  events: HouseholdEvent[];
  goals: Goal[];
  dailyPlans: Record<string, DailyPlan>;
  meals: PlannedMeal[];
  tasks: HouseholdTask[];
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
  activity: ActivityItem[];
  activeMemberId: string;

  setCalendarView: (v: CalendarView) => void;
  setActiveMemberId: (id: string) => void;
  setSelectedDate: (d: string) => void;
  setGroupColor: (c: string) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;

  addEvent: (e: Omit<HouseholdEvent, "id">) => string;
  updateEvent: (id: string, patch: Partial<HouseholdEvent>) => void;
  removeEvent: (id: string) => void;
  addEventFromNL: (text: string) => string | null;
  addEventComment: (eventId: string, body: string) => void;
  pushActivity: (message: string, actorId?: string) => void;

  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  scheduleGoal: (goalId: string) => number;
  scheduleGoalTriage: (goalId: string) => number;
  /** Pack today's focus window across goals (balanced by remaining work + lag). */
  createTodaySchedule: (
    date: string,
    windowStartHour: number,
    windowEndHour: number
  ) => number;
  addGoalSection: (goalId: string, title: string, estimatedMinutes?: number) => void;
  updateGoalSection: (goalId: string, sectionId: string, patch: Partial<GoalSection>) => void;
  removeGoalSection: (goalId: string, sectionId: string) => void;
  addGoalSubtask: (goalId: string, sectionId: string, title: string, estimatedMinutes?: number) => void;
  toggleGoalSubtask: (goalId: string, sectionId: string, subId: string) => void;
  setGoalPercent: (goalId: string, percent: number) => void;

  addTask: (t: Omit<HouseholdTask, "id" | "completed" | "completedAt">) => void;
  updateTask: (id: string, patch: Partial<HouseholdTask>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;

  addMeal: (m: Omit<PlannedMeal, "id">) => void;
  removeMeal: (id: string) => void;

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
          targetDate: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 10);
            return isoDate(d);
          })(),
          preferredDays: [1, 3, 5],
          preferredStartHour: 18,
          sessionMinutes: 60,
          percentComplete: 25,
          sections: [
            {
              id: "gs1",
              title: "Cable management",
              estimatedMinutes: 90,
              percentComplete: 40,
              done: false,
              subsections: [
                { id: "gst1", title: "Label power strips", done: true, estimatedMinutes: 20 },
                { id: "gst2", title: "Route monitor cables", done: false, estimatedMinutes: 40 },
                { id: "gst3", title: "Hide under desk", done: false, estimatedMinutes: 30 },
              ],
            },
            {
              id: "gs2",
              title: "Lighting",
              estimatedMinutes: 60,
              percentComplete: 0,
              done: false,
              subsections: [],
            },
          ],
        },
        {
          id: "g2",
          title: "Couples meal prep habit",
          description: "Sunday batch cook + midweek refresh",
          status: "active",
          priority: 1,
          memberIds: [MEMBER_A, MEMBER_B],
          targetDate: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 21);
            return isoDate(d);
          })(),
          preferredDays: [0],
          preferredStartHour: 15,
          sessionMinutes: 90,
          percentComplete: 10,
          sections: [
            {
              id: "gs3",
              title: "Sunday batch cook",
              estimatedMinutes: 120,
              percentComplete: 20,
              done: false,
              subsections: [],
            },
            {
              id: "gs4",
              title: "Midweek refresh",
              estimatedMinutes: 45,
              percentComplete: 0,
              done: false,
              subsections: [],
            },
          ],
        },
      ],
      tasks: [
        {
          id: "task1",
          title: "Schedule HVAC checkup",
          notes: "",
          assigneeId: MEMBER_A,
          dueDate: isoDate(),
          priority: 2,
          completed: false,
          completedAt: null,
        },
        {
          id: "task2",
          title: "Order dish soap",
          notes: "",
          assigneeId: MEMBER_B,
          dueDate: null,
          priority: 4,
          completed: false,
          completedAt: null,
        },
      ],
      dailyPlans: {},
      meals: defaultMeals(),
      shoppingExtra: [],
      calendarView: "week",
      selectedDate: isoDate(),
      groupColor: "#7c3aed",
      activity: [
        {
          id: "act0",
          at: new Date().toISOString(),
          actorId: MEMBER_B,
          message: "Partner added Dentist",
        },
      ],
      activeMemberId: MEMBER_A,

      setCalendarView: (v) => set({ calendarView: v }),
      setSelectedDate: (d) => set({ selectedDate: d }),
      setGroupColor: (c) => set({ groupColor: c }),
      setActiveMemberId: (id) => set({ activeMemberId: id }),
      pushActivity: (message, actorId) => {
        const actor = actorId ?? get().activeMemberId;
        set({
          activity: [
            {
              id: crypto.randomUUID(),
              at: new Date().toISOString(),
              actorId: actor,
              message,
            },
            ...get().activity,
          ].slice(0, 50),
        });
      },
      updateMember: (id, patch) =>
        set({
          members: get().members.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        }),

      addEvent: (e) => {
        const id = crypto.randomUUID();
        const actor = get().activeMemberId;
        const name = get().members.find((m) => m.id === actor)?.name ?? "Someone";
        set({
          events: [
            ...get().events,
            {
              reminderMinutes: [60, 1440],
              comments: [],
              ...e,
              id,
            },
          ],
        });
        get().pushActivity(`${name} added ${e.title}`, actor);
        return id;
      },
      updateEvent: (id, patch) => {
        const prev = get().events.find((e) => e.id === id);
        set({
          events: get().events.map((e) =>
            e.id === id ? { ...e, ...patch } : e
          ),
        });
        if (prev) {
          const actor = get().activeMemberId;
          const name = get().members.find((m) => m.id === actor)?.name ?? "Someone";
          get().pushActivity(`${name} updated ${patch.title ?? prev.title}`, actor);
        }
      },
      removeEvent: (id) => {
        const prev = get().events.find((e) => e.id === id);
        set({
          events: get().events.map((e) =>
            e.id === id ? { ...e, deleted: true } : e
          ),
        });
        if (prev) {
          const actor = get().activeMemberId;
          const name = get().members.find((m) => m.id === actor)?.name ?? "Someone";
          get().pushActivity(`${name} removed ${prev.title}`, actor);
        }
      },
      addEventFromNL: (text) => {
        const parsed = parseNaturalLanguage(text);
        if (!parsed.title) return null;
        return get().addEvent({
          title: parsed.title,
          startsAt: parsed.startsAt!,
          endsAt: parsed.endsAt!,
          allDay: !!parsed.allDay,
          memberId: parsed.memberId ?? null,
          kind: parsed.kind ?? "group",
          priority: (parsed.priority as Priority) ?? 3,
          recurrence: parsed.recurrence ?? null,
          reminderMinutes: parsed.reminderMinutes ?? [60, 1440],
          notes: "",
          location: "",
          comments: [],
        });
      },
      addEventComment: (eventId, body) => {
        const actor = get().activeMemberId;
        const name = get().members.find((m) => m.id === actor)?.name ?? "Someone";
        const comment: EventComment = {
          id: crypto.randomUUID(),
          authorId: actor,
          body: body.trim(),
          createdAt: new Date().toISOString(),
        };
        if (!comment.body) return;
        set({
          events: get().events.map((e) =>
            e.id === eventId
              ? { ...e, comments: [...(e.comments ?? []), comment] }
              : e
          ),
        });
        const title = get().events.find((e) => e.id === eventId)?.title ?? "event";
        get().pushActivity(`${name} commented on ${title}`, actor);
      },

      addGoal: (g) =>
        set({
          goals: [
            ...get().goals,
            {
              percentComplete: 0,
              targetDate: null,
              ...g,
              id: crypto.randomUUID(),
              sections: g.sections ?? [],
            },
          ],
        }),
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
          reminderMinutes: [60],
          comments: [],
        }));
        set({ events: [...get().events, ...newEvents] });
        return newEvents.length;
      },

      scheduleGoalTriage: (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return 0;
        const blocks = triageBlocksFromGoal({ ...goal, title: goal.title, id: goal.id });
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
          notes: "Triage block — remaining work vs deadline",
          reminderMinutes: [60],
          comments: [],
        }));
        set({ events: [...get().events, ...newEvents] });
        const actor = get().activeMemberId;
        const name = get().members.find((m) => m.id === actor)?.name ?? "Someone";
        get().pushActivity(`${name} triaged schedule for ${goal.title}`, actor);
        return newEvents.length;
      },

      createTodaySchedule: (date, windowStartHour, windowEndHour) => {
        const startH = Math.max(0, Math.min(23, windowStartHour));
        let endH = Math.max(0, Math.min(24, windowEndHour));
        if (endH <= startH) endH = Math.min(24, startH + 2);
        const winStart = startH * 60;
        const winEnd = endH * 60;

        const dayStart = new Date(date + "T00:00:00");
        const dayEnd = new Date(date + "T23:59:59");
        const expanded = expandEvents(
          get().events.filter((e) => !e.deleted && !e.goalId),
          dayStart,
          dayEnd
        );
        const busy = expanded.map((e) => {
          const s = new Date(e.occurrenceStart);
          const en = new Date(e.occurrenceEnd);
          return {
            startMin: s.getHours() * 60 + s.getMinutes(),
            endMin: en.getHours() * 60 + en.getMinutes() || 24 * 60,
          };
        });

        const owner = get().activeMemberId;
        const activeGoals = get().goals.filter((g) => g.status === "active");
        const blocks = allocateDayWindow({
          goals: activeGoals.map((g) => ({
            ...g,
            id: g.id,
            title: g.title,
            memberIds: g.memberIds,
          })),
          windowStartMin: winStart,
          windowEndMin: winEnd,
          busy,
          ownerId: owner,
        });

        get().ensureDailyPlan(date);
        const plan = get().dailyPlans[date];
        // Remove prior auto goal allocations for this date (keep manual custom/event)
        const kept = (plan?.items ?? []).filter(
          (i) => !(i.sourceType === "goal" && i.notes?.includes("day-alloc"))
        );

        const newItems: DailyItem[] = blocks.map((b) => ({
          id: crypto.randomUUID(),
          sourceType: "goal" as const,
          sourceId: b.goalId,
          title: b.title,
          startHour: Math.floor(b.startMin / 60),
          startMinute: b.startMin % 60,
          durationMinutes: b.minutes,
          done: false,
          skipped: false,
          isTop3: false,
          top3Rank: null,
          notes: `day-alloc · ${b.protected ? "protected" : "soft"} · ${b.shareReason}`,
        }));

        // Also place soft/protected goal events on calendar for the day (faded if soft)
        const calEvents: HouseholdEvent[] = blocks.map((b) => {
          const s = new Date(date + "T00:00:00");
          s.setHours(Math.floor(b.startMin / 60), b.startMin % 60, 0, 0);
          const e = new Date(s);
          e.setMinutes(e.getMinutes() + b.minutes);
          const g = activeGoals.find((x) => x.id === b.goalId);
          return {
            id: crypto.randomUUID(),
            title: b.title,
            startsAt: s.toISOString(),
            endsAt: e.toISOString(),
            allDay: false,
            memberId: g?.memberIds?.[0] ?? owner,
            kind: "personal" as const,
            priority: (g?.priority ?? 3) as Priority,
            goalId: b.goalId,
            notes: b.shareReason,
            // soft = faded via priority > 1 in calendar render
            colorOverride: b.protected ? null : "#94a3b8",
            reminderMinutes: b.protected ? [30] : [],
            comments: [],
          };
        });

        // drop previous day-alloc calendar events for this date
        const eventsKept = get().events.filter((e) => {
          if (!e.goalId || e.deleted) return true;
          if (!e.startsAt.startsWith(date)) return true;
          if (e.notes?.includes("share") || e.notes?.includes("% done")) return false;
          return true;
        });

        set({
          dailyPlans: {
            ...get().dailyPlans,
            [date]: { date, items: [...kept, ...newItems] },
          },
          events: [...eventsKept, ...calEvents],
        });

        const actor = owner;
        const name = get().members.find((m) => m.id === actor)?.name ?? "Someone";
        get().pushActivity(
          `${name} created day schedule (${blocks.length} goal blocks, ${startH}:00–${endH}:00)`,
          actor
        );
        return blocks.length;
      },

      addGoalSection: (goalId, title, estimatedMinutes = 60) => {
        const section: GoalSection = {
          id: crypto.randomUUID(),
          title: title.trim() || "Section",
          estimatedMinutes,
          percentComplete: 0,
          done: false,
          subsections: [],
        };
        set({
          goals: get().goals.map((g) =>
            g.id === goalId
              ? { ...g, sections: [...(g.sections ?? []), section] }
              : g
          ),
        });
      },
      updateGoalSection: (goalId, sectionId, patch) =>
        set({
          goals: get().goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  sections: (g.sections ?? []).map((s) =>
                    s.id === sectionId ? { ...s, ...patch } : s
                  ),
                }
              : g
          ),
        }),
      removeGoalSection: (goalId, sectionId) =>
        set({
          goals: get().goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  sections: (g.sections ?? []).filter((s) => s.id !== sectionId),
                }
              : g
          ),
        }),
      addGoalSubtask: (goalId, sectionId, title, estimatedMinutes = 30) => {
        const sub: GoalSubtask = {
          id: crypto.randomUUID(),
          title: title.trim() || "Step",
          done: false,
          estimatedMinutes,
        };
        set({
          goals: get().goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  sections: (g.sections ?? []).map((s) =>
                    s.id === sectionId
                      ? { ...s, subsections: [...(s.subsections ?? []), sub] }
                      : s
                  ),
                }
              : g
          ),
        });
      },
      toggleGoalSubtask: (goalId, sectionId, subId) =>
        set({
          goals: get().goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  sections: (g.sections ?? []).map((s) =>
                    s.id === sectionId
                      ? {
                          ...s,
                          subsections: (s.subsections ?? []).map((sub) =>
                            sub.id === subId ? { ...sub, done: !sub.done } : sub
                          ),
                        }
                      : s
                  ),
                }
              : g
          ),
        }),
      setGoalPercent: (goalId, percent) =>
        set({
          goals: get().goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  percentComplete: Math.max(0, Math.min(100, percent)),
                }
              : g
          ),
        }),

      addTask: (t) =>
        set({
          tasks: [
            ...get().tasks,
            {
              ...t,
              id: crypto.randomUUID(),
              completed: false,
              completedAt: null,
            },
          ],
        }),
      updateTask: (id, patch) =>
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }),
      toggleTask: (id) =>
        set({
          tasks: get().tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : null,
                }
              : t
          ),
        }),
      removeTask: (id) =>
        set({ tasks: get().tasks.filter((t) => t.id !== id) }),

      addMeal: (m) =>
        set({ meals: [...get().meals, { ...m, id: crypto.randomUUID() }] }),
      removeMeal: (id) =>
        set({ meals: get().meals.filter((m) => m.id !== id) }),

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
    { name: "duet-planning-v3" }
  )
);

export { MEMBER_A, MEMBER_B, goalPercent, remainingMinutes, sortByTriage };
export type { Priority };
