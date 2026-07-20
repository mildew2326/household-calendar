"use client";

import Link from "next/link";
import { usePlanningStore } from "@/lib/planning/store";

const links = [
  {
    href: "/app/shop",
    title: "Shopping",
    blurb: "Shared list with meal portion notes",
    tone: "#0e7c66",
  },
  {
    href: "/app/tasks",
    title: "Tasks & chores",
    blurb: "Household to-dos with assignees",
    tone: "#1d4ed8",
  },
  {
    href: "/app/meals",
    title: "Meals",
    blurb: "Weekly plan, family macros, portions",
    tone: "#b45309",
  },
];

export default function ListsHubPage() {
  const shoppingExtra = usePlanningStore((s) => s.shoppingExtra);
  const tasks = usePlanningStore((s) => s.tasks);
  const meals = usePlanningStore((s) => s.meals);
  const openShop = shoppingExtra.filter((s) => !s.checked).length;
  const openTasks = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Lists</h2>
        <p className="text-sm text-muted">
          Household ops in one place — shopping, tasks, meals
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs font-bold tracking-wide text-muted uppercase">
            Open shop
          </p>
          <p className="text-3xl font-semibold">{openShop}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold tracking-wide text-muted uppercase">
            Open tasks
          </p>
          <p className="text-3xl font-semibold">{openTasks}</p>
        </div>
      </div>
      <p className="text-xs text-muted">{meals.length} meals planned this list</p>

      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="card block px-4 py-4 transition hover:shadow-md"
              style={{ borderLeft: `4px solid ${l.tone}` }}
            >
              <p className="font-semibold">{l.title}</p>
              <p className="text-sm text-muted">{l.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
