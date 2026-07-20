"use client";

import Link from "next/link";
import { usePlanningStore } from "@/lib/planning/store";

export default function MorePage() {
  const members = usePlanningStore((s) => s.members);
  const activity = usePlanningStore((s) => s.activity);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">More</h2>
        <p className="text-sm text-muted">
          Goals, labs, settings — secondary tools off the main path
        </p>
      </div>

      <section className="card space-y-2 p-4">
        <h3 className="text-sm font-semibold">Household</h3>
        <ul className="space-y-2 text-sm">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: m.color }}
              />
              {m.name}
              <span className="text-muted">
                · {m.calories} kcal goal
              </span>
            </li>
          ))}
        </ul>
      </section>

      <nav className="space-y-2">
        <MoreLink
          href="/app/goals"
          title="Goals & projects"
          desc="Add goals, deadlines, sections — tap here on iPhone"
          emphasize
        />
        <MoreLink href="/app/today" title="Full day planner" desc="Hour grid, skip, reschedule" />
        <MoreLink href="/app/macros" title="Macros lab" desc="Parked under labs — advanced nutrition diary" />
        <MoreLink href="/app/settings" title="Settings" desc="Cloud sync status, privacy, install tips" />
      </nav>

      <section className="card p-4">
        <h3 className="mb-2 text-sm font-semibold">Recent activity</h3>
        <ul className="space-y-2 text-sm">
          {activity.slice(0, 6).map((a) => (
            <li key={a.id} className="text-muted">
              <span className="font-medium text-ink">{a.message}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MoreLink({
  href,
  title,
  desc,
  emphasize,
}: {
  href: string;
  title: string;
  desc: string;
  emphasize?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card block px-4 py-4 ${
        emphasize ? "border-accent/30 ring-1 ring-accent/20" : ""
      }`}
    >
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted">{desc}</p>
    </Link>
  );
}
