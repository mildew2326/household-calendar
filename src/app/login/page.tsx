"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const supabase = createClient();
      if (!supabase) {
        setStatus("Supabase not configured — use Open demo app instead.");
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) throw error;
      setStatus("Check your email for a magic link.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link href="/" className="text-sm font-semibold text-accent">
        ← Duet
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Magic link email — no password. {configured ? "Supabase ready." : "Demo: cloud auth not configured."}
      </p>
      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-5">
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-3 text-base outline-none focus:border-accent"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send magic link"}
        </button>
        {status && <p className="text-sm text-muted">{status}</p>}
      </form>
      <Link href="/app" className="mt-6 text-center text-sm font-semibold text-ink">
        Continue in demo mode →
      </Link>
    </main>
  );
}
