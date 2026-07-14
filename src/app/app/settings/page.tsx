import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function SettingsPage() {
  const cloud = isSupabaseConfigured();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted">Household · privacy · delivery</p>
      </div>
      <section className="card space-y-2 p-4 text-sm">
        <h3 className="font-semibold">Mode</h3>
        <p className="text-muted">
          {cloud
            ? "Supabase configured — auth & sync available."
            : "Demo mode — local sample data. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."}
        </p>
      </section>
      <section className="card space-y-2 p-4 text-sm">
        <h3 className="font-semibold">Privacy</h3>
        <p className="text-muted">
          Private events show as <em>Busy</em> to your partner (decision D3).
        </p>
      </section>
      <section className="card space-y-2 p-4 text-sm">
        <h3 className="font-semibold">iPhone install</h3>
        <p className="text-muted">
          Safari → Share → Add to Home Screen for standalone Duet.
        </p>
      </section>
    </div>
  );
}
