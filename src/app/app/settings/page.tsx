"use client";

import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isFirebaseConfigured, getHouseholdId } from "@/lib/firebase/client";
import { useSyncStatus } from "@/components/sync/CloudSyncProvider";

export default function SettingsPage() {
  const supabase = isSupabaseConfigured();
  const firebase = isFirebaseConfigured();
  const status = useSyncStatus((s) => s.status);
  const err = useSyncStatus((s) => s.lastError);
  const at = useSyncStatus((s) => s.lastSyncedAt);
  const hid = useSyncStatus((s) => s.householdId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted">Household · privacy · cloud sync</p>
      </div>

      <section className="card space-y-2 p-4 text-sm">
        <h3 className="font-semibold">Realtime sync (Google Cloud)</h3>
        <p className="text-muted">
          Duet uses <strong>Cloud Firestore</strong> for live couple sync (not
          raw GCS buckets — those are for files). Firebase Storage can use a GCS
          bucket later for photos.
        </p>
        <ul className="mt-2 space-y-1 text-xs text-muted">
          <li>
            Status:{" "}
            <strong className="text-ink">
              {firebase ? status : "disabled (no Firebase env)"}
            </strong>
          </li>
          <li>
            Household id: <code className="text-ink">{hid || getHouseholdId()}</code>
          </li>
          {at && (
            <li>Last sync: {new Date(at).toLocaleString()}</li>
          )}
          {err && <li className="text-red-700">Error: {err}</li>}
        </ul>
        <p className="mt-2 text-xs text-muted">
          Setup guide:{" "}
          <code className="text-ink">docs/ops/google-cloud-realtime-setup.md</code>
        </p>
      </section>

      <section className="card space-y-2 p-4 text-sm">
        <h3 className="font-semibold">Supabase (optional alternate)</h3>
        <p className="text-muted">
          {supabase
            ? "Supabase env present — Postgres path still available for SQL features."
            : "Not configured. Firebase is the active realtime path when its env is set."}
        </p>
      </section>

      <section className="card space-y-2 p-4 text-sm">
        <h3 className="font-semibold">Privacy</h3>
        <p className="text-muted">
          Private events show as <em>Busy</em> to your partner (decision D3).
        </p>
      </section>

      <section className="card space-y-2 p-4 text-sm">
        <h3 className="font-semibold">Macros lab</h3>
        <p className="text-muted">
          Diary currently browser-local. Shared planning data (calendar, goals,
          lists) syncs via Firestore when configured.
        </p>
        <Link href="/app/macros" className="text-xs font-semibold text-accent">
          Open macros →
        </Link>
      </section>

      <section className="card space-y-2 p-4 text-sm">
        <h3 className="font-semibold">iPhone install</h3>
        <p className="text-muted">
          Safari → Share → Add to Home Screen. Both phones need the same
          Firebase project + household id.
        </p>
      </section>
    </div>
  );
}
