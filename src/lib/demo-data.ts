/** In-memory demo store when Supabase env is not configured — couples can UI-walk without cloud. */

import type { CalendarEvent, Meal, ShoppingItem, Todo } from "./types";

const now = new Date();
const day = (offset: number, hour: number, durH = 1) => {
  const s = new Date(now);
  s.setDate(s.getDate() + offset);
  s.setHours(hour, 0, 0, 0);
  const e = new Date(s);
  e.setHours(hour + durH, 0, 0, 0);
  return { starts_at: s.toISOString(), ends_at: e.toISOString() };
};

export const DEMO_USER_A = "demo-user-a";
export const DEMO_USER_B = "demo-user-b";
export const DEMO_VIEWER = DEMO_USER_A;

export const demoMembers = [
  { id: DEMO_USER_A, display_name: "You", color: "#0e7c66", email: "you@example.com" },
  { id: DEMO_USER_B, display_name: "Partner", color: "#1d4ed8", email: "partner@example.com" },
];

export const demoEvents: CalendarEvent[] = [
  {
    id: "1",
    household_id: "demo",
    title: "Date night",
    location: "Home",
    ...day(0, 19, 2),
    all_day: false,
    timezone: "America/New_York",
    created_by: DEMO_USER_A,
    visibility: "shared",
    status: "confirmed",
    category: "social",
  },
  {
    id: "2",
    household_id: "demo",
    title: "Dentist",
    ...day(1, 10, 1),
    all_day: false,
    timezone: "America/New_York",
    created_by: DEMO_USER_B,
    visibility: "shared",
    status: "confirmed",
    category: "health",
  },
  {
    id: "3",
    household_id: "demo",
    title: "Private appointment",
    ...day(2, 14, 1),
    all_day: false,
    timezone: "America/New_York",
    created_by: DEMO_USER_B,
    visibility: "private",
    status: "confirmed",
  },
  {
    id: "4",
    household_id: "demo",
    title: "Trash day",
    ...day(3, 7, 1),
    all_day: true,
    timezone: "America/New_York",
    created_by: DEMO_USER_A,
    visibility: "shared",
    status: "confirmed",
    recurrence_rule: "FREQ=WEEKLY;BYDAY=TH",
  },
];

export const demoTodos: Todo[] = [
  {
    id: "t1",
    household_id: "demo",
    title: "Schedule HVAC checkup",
    assignee_id: DEMO_USER_A,
    priority: "med",
    created_by: DEMO_USER_A,
    due_at: day(5, 9).starts_at,
  },
  {
    id: "t2",
    household_id: "demo",
    title: "Renew car registration",
    assignee_id: DEMO_USER_B,
    priority: "high",
    created_by: DEMO_USER_B,
  },
];

export const demoShopping: ShoppingItem[] = [
  { id: "s1", list_id: "groceries", name: "Oat milk", quantity: "2", is_checked: false, sort_order: 0 },
  { id: "s2", list_id: "groceries", name: "Spinach", quantity: "1 bag", is_checked: true, sort_order: 1 },
  { id: "s3", list_id: "groceries", name: "Chicken thighs", quantity: "2 lb", is_checked: false, sort_order: 2 },
];

export const demoMeals: Meal[] = [
  {
    id: "m1",
    meal_plan_id: "w1",
    day: new Date().toISOString().slice(0, 10),
    slot: "dinner",
    title: "Salmon + rice",
    ingredients: "salmon\nrice\nasparagus",
  },
  {
    id: "m2",
    meal_plan_id: "w1",
    day: day(1, 0).starts_at.slice(0, 10),
    slot: "dinner",
    title: "Tacos",
    ingredients: "tortillas\nground beef\nsalsa",
  },
];
