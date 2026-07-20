/**
 * Real-time household sync via Cloud Firestore (Google Cloud).
 *
 * Why not raw GCS buckets?
 * - GCS is object/file storage (great for photos, backups).
 * - Calendar/tasks need document queries + live listeners → Firestore.
 * - Firebase Storage (included) uses a GCS bucket under the hood for files.
 */

import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb, getHouseholdId, isFirebaseConfigured } from "./client";
import type {
  ActivityItem,
  CalendarView,
  DailyPlan,
  Goal,
  HouseholdEvent,
  HouseholdTask,
  Member,
  PlannedMeal,
} from "@/lib/planning/types";

export type HouseholdCloudState = {
  version: 1;
  updatedAt: number;
  updatedBy: string;
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
  groupColor: string;
  activity: ActivityItem[];
  /** optional UI prefs shared */
  calendarView?: CalendarView;
};

export type SyncStatus =
  | "disabled"
  | "connecting"
  | "live"
  | "saving"
  | "error"
  | "offline";

export function householdDocPath(householdId = getHouseholdId()) {
  return `households/${householdId}`;
}

export function subscribeHousehold(
  onData: (state: HouseholdCloudState | null) => void,
  onError?: (err: Error) => void
): Unsubscribe | null {
  const db = getDb();
  if (!db) return null;
  const ref = doc(db, "households", getHouseholdId());
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const data = snap.data() as HouseholdCloudState;
      onData({
        ...data,
        version: 1,
        updatedAt: Number(data.updatedAt) || Date.now(),
        updatedBy: data.updatedBy || "unknown",
      });
    },
    (err) => onError?.(err)
  );
}

export async function pushHousehold(
  state: Omit<HouseholdCloudState, "version" | "updatedAt"> & {
    updatedBy: string;
  }
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not configured");
  const ref = doc(db, "households", getHouseholdId());
  const payload: HouseholdCloudState & { serverUpdatedAt?: unknown } = {
    version: 1,
    updatedAt: Date.now(),
    updatedBy: state.updatedBy,
    members: state.members,
    events: state.events,
    goals: state.goals,
    dailyPlans: state.dailyPlans,
    meals: state.meals,
    tasks: state.tasks,
    shoppingExtra: state.shoppingExtra,
    groupColor: state.groupColor,
    activity: state.activity.slice(0, 50),
    calendarView: state.calendarView,
    serverUpdatedAt: serverTimestamp(),
  };
  await setDoc(ref, payload, { merge: true });
}

export { isFirebaseConfigured };
