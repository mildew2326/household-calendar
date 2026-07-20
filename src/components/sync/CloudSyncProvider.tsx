"use client";

import { useEffect, useRef } from "react";
import { usePlanningStore } from "@/lib/planning/store";
import {
  isFirebaseConfigured,
  pushHousehold,
  subscribeHousehold,
  type HouseholdCloudState,
  type SyncStatus,
} from "@/lib/firebase/sync";
import { create } from "zustand";

type SyncUiState = {
  status: SyncStatus;
  lastError: string | null;
  lastSyncedAt: number | null;
  householdId: string;
  setStatus: (s: SyncStatus, err?: string | null) => void;
  setLastSyncedAt: (t: number) => void;
};

export const useSyncStatus = create<SyncUiState>((set) => ({
  status: "disabled",
  lastError: null,
  lastSyncedAt: null,
  householdId: process.env.NEXT_PUBLIC_DUET_HOUSEHOLD_ID || "duet-home",
  setStatus: (status, err = null) =>
    set({ status, lastError: err }),
  setLastSyncedAt: (t) => set({ lastSyncedAt: t }),
}));

const CLIENT_ID =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `client-${Math.random().toString(36).slice(2)}`;

/**
 * Keeps planning zustand ↔ Firestore in sync for both phones.
 * Local device prefs (selectedDate, activeMemberId) stay local.
 */
export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const applyingRemote = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushedAt = useRef(0);
  const setStatus = useSyncStatus((s) => s.setStatus);
  const setLastSyncedAt = useSyncStatus((s) => s.setLastSyncedAt);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setStatus("disabled");
      return;
    }

    setStatus("connecting");
    const unsubRemote = subscribeHousehold(
      (remote) => {
        if (!remote) {
          // Seed cloud from local on first connect
          void flushLocal("bootstrap");
          setStatus("live");
          return;
        }
        if (remote.updatedBy === CLIENT_ID && remote.updatedAt <= lastPushedAt.current + 50) {
          setStatus("live");
          setLastSyncedAt(remote.updatedAt);
          return;
        }
        applyingRemote.current = true;
        usePlanningStore.getState().applyCloudSnapshot(remote);
        applyingRemote.current = false;
        setStatus("live");
        setLastSyncedAt(remote.updatedAt);
      },
      (err) => {
        console.error("[duet-sync]", err);
        setStatus("error", err.message);
      }
    );

    const unsubLocal = usePlanningStore.subscribe(() => {
      if (applyingRemote.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void flushLocal("change");
      }, 450);
    });

    async function flushLocal(reason: string) {
      try {
        setStatus("saving");
        const s = usePlanningStore.getState();
        const updatedAt = Date.now();
        lastPushedAt.current = updatedAt;
        const payload: Omit<HouseholdCloudState, "version" | "updatedAt"> & {
          updatedBy: string;
        } = {
          updatedBy: CLIENT_ID,
          members: s.members,
          events: s.events,
          goals: s.goals,
          dailyPlans: s.dailyPlans,
          meals: s.meals,
          tasks: s.tasks,
          shoppingExtra: s.shoppingExtra,
          groupColor: s.groupColor,
          activity: s.activity,
          calendarView: s.calendarView,
        };
        await pushHousehold(payload);
        setStatus("live");
        setLastSyncedAt(updatedAt);
        if (reason === "bootstrap") {
          console.info("[duet-sync] seeded household doc");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[duet-sync] push failed", e);
        setStatus("error", msg);
      }
    }

    return () => {
      unsubRemote?.();
      unsubLocal();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [setStatus, setLastSyncedAt]);

  return <>{children}</>;
}
