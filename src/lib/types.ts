export type Visibility = "shared" | "private";
export type MemberRole = "owner" | "adult";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  color: string;
}

export interface Household {
  id: string;
  name: string;
  timezone: string;
}

export interface CalendarEvent {
  id: string;
  household_id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  timezone: string;
  created_by: string;
  visibility: Visibility;
  status: string;
  category?: string | null;
  color_override?: string | null;
  recurrence_rule?: string | null;
  deleted_at?: string | null;
}

/** What a non-owner is allowed to see for private events */
export interface BusyBlock {
  id: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  visibility: "private";
  title: "Busy";
  isBusy: true;
}

export type ProjectedEvent = CalendarEvent | BusyBlock;

export function projectEventForViewer(
  event: CalendarEvent,
  viewerId: string
): ProjectedEvent {
  if (event.visibility === "private" && event.created_by !== viewerId) {
    return {
      id: event.id,
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      all_day: event.all_day,
      visibility: "private",
      title: "Busy",
      isBusy: true,
    };
  }
  return event;
}

export function projectEventsForViewer(
  events: CalendarEvent[],
  viewerId: string
): ProjectedEvent[] {
  return events.map((e) => projectEventForViewer(e, viewerId));
}

export interface Todo {
  id: string;
  household_id: string;
  title: string;
  notes?: string | null;
  assignee_id?: string | null;
  due_at?: string | null;
  completed_at?: string | null;
  priority: "none" | "low" | "med" | "high";
  created_by: string;
}

export interface ShoppingItem {
  id: string;
  list_id: string;
  name: string;
  quantity?: string | null;
  category?: string | null;
  is_checked: boolean;
  sort_order: number;
}

export interface Meal {
  id: string;
  meal_plan_id: string;
  day: string;
  slot: string;
  title: string;
  notes?: string | null;
  recipe_url?: string | null;
  ingredients?: string | null;
}
