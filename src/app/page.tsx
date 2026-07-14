import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
          Household OS for time
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-ink md:text-6xl">
          Duet
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          One shared calendar for the two of you — events, tasks, shopping, and
          meals — with Fantastical-grade polish and Cozi-grade household coverage.
          Primary system of record. iPhone PWA.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            Open demo app
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink"
          >
            Magic link login
          </Link>
        </div>
        <ul className="mt-12 grid gap-3 text-sm text-muted sm:grid-cols-2">
          <li className="card p-4">Shared week/day views + Busy privacy</li>
          <li className="card p-4">Macro tracker (diary, targets, weight)</li>
          <li className="card p-4">Todos & chores with assignees</li>
          <li className="card p-4">Shopping list + meal planner</li>
        </ul>
        <p className="mt-10 text-xs text-muted">
          Demo mode works without Supabase. Add env keys to enable live auth &
          sync. See README.
        </p>
      </div>
    </main>
  );
}
