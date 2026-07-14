"use client";

import { useMemo, useState } from "react";
import { usePlanningStore } from "@/lib/planning/store";
import type { Goal, Priority } from "@/lib/planning/types";

const DAYS = [
  { i: 0, l: "Sun" },
  { i: 1, l: "Mon" },
  { i: 2, l: "Tue" },
  { i: 3, l: "Wed" },
  { i: 4, l: "Thu" },
  { i: 5, l: "Fri" },
  { i: 6, l: "Sat" },
];

export default function GoalsPage() {
  const goals = usePlanningStore((s) => s.goals);
  const members = usePlanningStore((s) => s.members);
  const addGoal = usePlanningStore((s) => s.addGoal);
  const updateGoal = usePlanningStore((s) => s.updateGoal);
  const removeGoal = usePlanningStore((s) => s.removeGoal);
  const scheduleGoal = usePlanningStore((s) => s.scheduleGoal);

  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const active = useMemo(
    () => goals.filter((g) => g.status !== "done"),
    [goals]
  );

  function create() {
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      description: "",
      status: "active",
      priority: 2,
      memberIds: [members[0]?.id].filter(Boolean) as string[],
      preferredDays: [1, 3, 5],
      preferredStartHour: 18,
      sessionMinutes: 60,
    });
    setTitle("");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Goals</h2>
        <p className="text-sm text-muted">
          Larger projects → schedule blocks on preferred days/times
        </p>
      </div>

      {msg && (
        <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm">{msg}</p>
      )}

      <div className="card flex gap-2 p-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New goal / project"
          className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm"
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <button
          type="button"
          onClick={create}
          className="rounded-full bg-ink px-4 text-sm font-semibold text-white"
        >
          Add
        </button>
      </div>

      <ul className="space-y-3">
        {active.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            members={members}
            onUpdate={(patch) => updateGoal(g.id, patch)}
            onRemove={() => removeGoal(g.id)}
            onSchedule={() => {
              const n = scheduleGoal(g.id);
              setMsg(`Added ${n} calendar blocks for “${g.title}”.`);
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function GoalCard({
  goal,
  members,
  onUpdate,
  onRemove,
  onSchedule,
}: {
  goal: Goal;
  members: { id: string; name: string; color: string }[];
  onUpdate: (p: Partial<Goal>) => void;
  onRemove: () => void;
  onSchedule: () => void;
}) {
  return (
    <li className="card space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{goal.title}</h3>
          <p className="text-xs text-muted">
            Priority {goal.priority} · {goal.sessionMinutes} min ·{" "}
            {goal.preferredStartHour}:00
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-semibold text-red-700"
        >
          Remove
        </button>
      </div>

      <textarea
        value={goal.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Description"
        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        rows={2}
      />

      <div className="flex flex-wrap gap-1">
        {DAYS.map((d) => {
          const on = goal.preferredDays.includes(d.i);
          return (
            <button
              key={d.i}
              type="button"
              onClick={() => {
                const set = new Set(goal.preferredDays);
                if (on) set.delete(d.i);
                else set.add(d.i);
                onUpdate({ preferredDays: [...set].sort() });
              }}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                on ? "bg-ink text-white" : "border border-black/10 bg-white"
              }`}
            >
              {d.l}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <label className="font-semibold text-muted">
          Start hour
          <input
            type="number"
            min={0}
            max={23}
            value={goal.preferredStartHour}
            onChange={(e) =>
              onUpdate({ preferredStartHour: Number(e.target.value) })
            }
            className="ml-1 w-14 rounded-lg border border-black/10 px-2 py-1"
          />
        </label>
        <label className="font-semibold text-muted">
          Minutes
          <input
            type="number"
            min={15}
            step={15}
            value={goal.sessionMinutes}
            onChange={(e) =>
              onUpdate({ sessionMinutes: Number(e.target.value) })
            }
            className="ml-1 w-16 rounded-lg border border-black/10 px-2 py-1"
          />
        </label>
        <label className="font-semibold text-muted">
          Priority
          <select
            value={goal.priority}
            onChange={(e) =>
              onUpdate({ priority: Number(e.target.value) as Priority })
            }
            className="ml-1 rounded-lg border border-black/10 px-2 py-1"
          >
            {[1, 2, 3, 4, 5].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-1">
        {members.map((m) => {
          const on = goal.memberIds.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                const set = new Set(goal.memberIds);
                if (on) set.delete(m.id);
                else set.add(m.id);
                onUpdate({ memberIds: [...set] });
              }}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                on ? "text-white" : "border border-black/10 bg-white"
              }`}
              style={on ? { background: m.color } : undefined}
            >
              {m.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSchedule}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white"
      >
        Create schedule plan (2 weeks of blocks)
      </button>
    </li>
  );
}
