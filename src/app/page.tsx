import Link from "next/link";

export default function HomePage() {
  // Marketing stays, but primary CTA deep-links into Today home
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
          Shared calendar for the two of you — Today plan, lists, and goals —
          designed to feel as fast as Fantastical and as useful as Cozi.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            Open Today
          </Link>
          <Link
            href="/app/calendar"
            className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink"
          >
            Calendar
          </Link>
        </div>
        <ul className="mt-12 grid gap-3 text-sm text-muted sm:grid-cols-2">
          <li className="card p-4">Today home · Top 3 · hour plan</li>
          <li className="card p-4">Day / 3-day / week / month + agenda</li>
          <li className="card p-4">Natural language add + reminders</li>
          <li className="card p-4">Lists hub · meals → shopping portions</li>
        </ul>
        <p className="mt-10 text-xs text-muted">
          Demo persists in this browser. Switch You/Partner in the header to
          simulate household activity.
        </p>
      </div>
    </main>
  );
}
