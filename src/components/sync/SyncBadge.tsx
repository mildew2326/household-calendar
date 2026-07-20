"use client";

import { useSyncStatus } from "@/components/sync/CloudSyncProvider";

export function SyncBadge() {
  const status = useSyncStatus((s) => s.status);
  const err = useSyncStatus((s) => s.lastError);
  const at = useSyncStatus((s) => s.lastSyncedAt);
  const hid = useSyncStatus((s) => s.householdId);

  if (status === "disabled") {
    return (
      <span
        className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[10px] font-semibold text-muted"
        title="Add Firebase env vars for realtime sync"
      >
        Local only
      </span>
    );
  }

  const label =
    status === "live"
      ? "Live"
      : status === "saving"
        ? "Saving…"
        : status === "connecting"
          ? "Connecting…"
          : status === "offline"
            ? "Offline"
            : "Sync error";

  const color =
    status === "live"
      ? "bg-emerald-500"
      : status === "error"
        ? "bg-red-500"
        : status === "saving"
          ? "bg-amber-400"
          : "bg-slate-400";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2 py-0.5 text-[10px] font-semibold text-ink"
      title={
        err
          ? err
          : `Household ${hid}${at ? ` · synced ${new Date(at).toLocaleTimeString()}` : ""}`
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
