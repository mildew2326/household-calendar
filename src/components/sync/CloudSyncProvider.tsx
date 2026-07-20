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
  setStatus: (status, err = null) => set({ status, lastError: err }),
  setLastSyncedAt: (t) => set({ lastSyncedAt: t }),
}));

const CLIENT_ID =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `client-${Math.random().toString(36).slice(2)}`;

/**
 * Keeps planning zustand ↔ Firestore in sync.
 * Guards against stale snapshots wiping in-flight local adds (e.g. new goals on iPhone).
 */
export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const applyingRemote = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushedAt = useRef(0);
  const lastLocalMutationAt = useRef(0);
  const setStatus = useSyncStatus((s) => s.setStatus);
  const setLastSyncedAt = useSyncStatus((s) => s.setLastSyncedAt);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setStatus("disabled");
      return;
    }

    setStatus("connecting");

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
        // Keep local mutation watermark so echo snapshots can't roll back
        lastLocalMutationAt.current = Math.max(
          lastLocalMutationAt.current,
          updatedAt
        );
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

    const unsubRemote = subscribeHousehold(
      (remote) => {
        if (!remote) {
          void flushLocal("bootstrap");
          setStatus("live");
          return;
        }

        // Echo of our write
        if (
          remote.updatedBy === CLIENT_ID &&
          remote.updatedAt <= lastPushedAt.current + 250
        ) {
          setStatus("live");
          setLastSyncedAt(remote.updatedAt);
          return;
        }

        // Stale cloud snapshot while user just edited locally (prevents goal wipe)
        if (remote.updatedAt < lastLocalMutationAt.current) {
          console.info("[duet-sync] skip stale remote", {
            remoteAt: remote.updatedAt,
            localAt: lastLocalMutationAt.current,
          });
          // Still push local if we have newer local edits
          if (lastLocalMutationAt.current > lastPushedAt.current) {
            void flushLocal("reassert");
          }
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
      lastLocalMutationAt.current = Date.now();
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void flushLocal("change");
      }, 350);
    });

    return () => {
      unsubRemote?.();
      unsubLocal();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [setStatus, setLastSyncedAt]);

  return <>{children}</>;
}
