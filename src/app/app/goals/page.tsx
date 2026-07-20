"use client";

import { useMemo, useState } from "react";
import { usePlanningStore } from "@/lib/planning/store";
import {
  daysUntilDeadline,
  goalPercent,
  remainingMinutes,
  sectionPercent,
  sortByTriage,
} from "@/lib/planning/goal-math";
import type { Goal, Priority } from "@/lib/planning/types";
import { isoDate } from "@/lib/planning/types";

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
  const scheduleGoalTriage = usePlanningStore((s) => s.scheduleGoalTriage);
  const addGoalSection = usePlanningStore((s) => s.addGoalSection);
  const updateGoalSection = usePlanningStore((s) => s.updateGoalSection);
  const removeGoalSection = usePlanningStore((s) => s.removeGoalSection);
  const addGoalSubtask = usePlanningStore((s) => s.addGoalSubtask);
  const toggleGoalSubtask = usePlanningStore((s) => s.toggleGoalSubtask);
  const setGoalPercent = usePlanningStore((s) => s.setGoalPercent);

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const active = useMemo(() => {
    const list = goals.filter((g) => g.status !== "done");
    return sortByTriage(list);
  }, [goals]);

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
      targetDate: deadline || null,
      percentComplete: 0,
      sections: [],
    });
    setTitle("");
    setDeadline("");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Goals</h2>
        <p className="text-sm text-muted">
          Deadlines · sections · progress % · triage time onto the calendar
        </p>
      </div>

      {msg && (
        <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm">{msg}</p>
      )}

      <div className="card space-y-2 p-3">
        <div className="flex gap-2">
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
        <label className="flex items-center gap-2 text-xs font-semibold text-muted">
          Deadline
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="rounded-lg border border-black/10 px-2 py-1 text-ink"
          />
        </label>
      </div>

      <section className="card p-4">
        <h3 className="text-sm font-semibold">Triage order</h3>
        <p className="mb-2 text-xs text-muted">
          Sorted by deadline pressure, remaining work, and priority (1 = highest).
        </p>
        <ol className="space-y-1 text-sm">
          {active.map((g, i) => {
            const days = daysUntilDeadline(g.targetDate);
            const pct = goalPercent(g);
            const rem = remainingMinutes(g);
            return (
              <li
                key={g.id}
                className="flex items-center justify-between rounded-xl bg-paper px-3 py-2"
              >
                <span className="font-semibold">
                  {i + 1}. {g.title}
                </span>
                <span className="text-xs text-muted">
                  {pct}% · {Math.round(rem / 60 * 10) / 10}h left
                  {days === null
                    ? ""
                    : days < 0
                      ? ` · ${Math.abs(days)}d overdue`
                      : ` · ${days}d left`}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

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
              setMsg(`Added ${n} preferred-day blocks for “${g.title}”.`);
            }}
            onTriage={() => {
              const n = scheduleGoalTriage(g.id);
              setMsg(
                n
                  ? `Triaged ${n} calendar blocks for “${g.title}” (remaining work vs deadline).`
                  : `Nothing left to schedule for “${g.title}”.`
              );
            }}
            onAddSection={(title, mins) => addGoalSection(g.id, title, mins)}
            onUpdateSection={(sid, patch) =>
              updateGoalSection(g.id, sid, patch)
            }
            onRemoveSection={(sid) => removeGoalSection(g.id, sid)}
            onAddSub={(sid, title, mins) =>
              addGoalSubtask(g.id, sid, title, mins)
            }
            onToggleSub={(sid, subId) =>
              toggleGoalSubtask(g.id, sid, subId)
            }
            onSetPercent={(p) => setGoalPercent(g.id, p)}
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
  onTriage,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onAddSub,
  onToggleSub,
  onSetPercent,
}: {
  goal: Goal;
  members: { id: string; name: string; color: string }[];
  onUpdate: (p: Partial<Goal>) => void;
  onRemove: () => void;
  onSchedule: () => void;
  onTriage: () => void;
  onAddSection: (title: string, mins: number) => void;
  onUpdateSection: (
    sectionId: string,
    patch: Partial<Goal["sections"][0]>
  ) => void;
  onRemoveSection: (sectionId: string) => void;
  onAddSub: (sectionId: string, title: string, mins: number) => void;
  onToggleSub: (sectionId: string, subId: string) => void;
  onSetPercent: (p: number) => void;
}) {
  const [secTitle, setSecTitle] = useState("");
  const [subDraft, setSubDraft] = useState<Record<string, string>>({});
  const pct = goalPercent(goal);
  const rem = remainingMinutes(goal);
  const days = daysUntilDeadline(goal.targetDate);
  const sections = goal.sections ?? [];

  return (
    <li className="card space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{goal.title}</h3>
          <p className="text-xs text-muted">
            P{goal.priority} · {goal.sessionMinutes}m sessions ·{" "}
            {goal.preferredStartHour}:00
            {goal.targetDate ? ` · due ${goal.targetDate}` : ""}
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

      {/* Progress bar */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs font-semibold">
          <span>{pct}% complete</span>
          <span className="text-muted">
            ~{Math.round((rem / 60) * 10) / 10}h remaining
            {days === null
              ? ""
              : days < 0
                ? ` · ${Math.abs(days)}d overdue`
                : ` · ${days}d to deadline`}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        {sections.length === 0 && (
          <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted">
            Set %
            <input
              type="range"
              min={0}
              max={100}
              value={goal.percentComplete ?? 0}
              onChange={(e) => onSetPercent(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-8 text-ink">{goal.percentComplete ?? 0}</span>
          </label>
        )}
      </div>

      <textarea
        value={goal.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Description"
        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        rows={2}
      />

      <label className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
        Deadline
        <input
          type="date"
          value={goal.targetDate ?? ""}
          onChange={(e) =>
            onUpdate({ targetDate: e.target.value || null })
          }
          className="rounded-lg border border-black/10 px-2 py-1 text-ink"
        />
        <button
          type="button"
          className="rounded-full border border-black/10 px-2 py-1"
          onClick={() => {
            const d = new Date();
            d.setDate(d.getDate() + 7);
            onUpdate({ targetDate: isoDate(d) });
          }}
        >
          +7d
        </button>
      </label>

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

      {/* Sections */}
      <div className="space-y-2 rounded-2xl border border-black/5 bg-paper p-3">
        <p className="text-xs font-bold tracking-wide text-muted uppercase">
          Sections / steps
        </p>
        {sections.map((s) => {
          const sp = sectionPercent(s);
          return (
            <div
              key={s.id}
              className="space-y-2 rounded-xl border border-black/5 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <input
                    value={s.title}
                    onChange={(e) =>
                      onUpdateSection(s.id, { title: e.target.value })
                    }
                    className="w-full text-sm font-semibold outline-none"
                  />
                  <p className="text-[11px] text-muted">
                    {sp}% · est {s.estimatedMinutes}m
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveSection(s.id)}
                  className="text-[11px] font-semibold text-red-700"
                >
                  Del
                </button>
              </div>
              {!(s.subsections?.length) && (
                <label className="flex items-center gap-2 text-[11px] font-semibold text-muted">
                  Section %
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.percentComplete}
                    onChange={(e) =>
                      onUpdateSection(s.id, {
                        percentComplete: Number(e.target.value),
                        done: Number(e.target.value) >= 100,
                      })
                    }
                    className="flex-1"
                  />
                </label>
              )}
              <label className="flex items-center gap-2 text-[11px] font-semibold text-muted">
                Est minutes
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={s.estimatedMinutes}
                  onChange={(e) =>
                    onUpdateSection(s.id, {
                      estimatedMinutes: Number(e.target.value),
                    })
                  }
                  className="w-16 rounded border border-black/10 px-1 py-0.5"
                />
              </label>
              <ul className="space-y-1">
                {(s.subsections ?? []).map((sub) => (
                  <li key={sub.id} className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => onToggleSub(s.id, sub.id)}
                      className={`h-5 w-5 shrink-0 rounded border-2 ${
                        sub.done
                          ? "border-accent bg-accent"
                          : "border-black/20 bg-white"
                      }`}
                    />
                    <span
                      className={
                        sub.done ? "text-muted line-through" : "font-medium"
                      }
                    >
                      {sub.title}
                    </span>
                    <span className="text-muted">{sub.estimatedMinutes}m</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-1">
                <input
                  value={subDraft[s.id] ?? ""}
                  onChange={(e) =>
                    setSubDraft((d) => ({ ...d, [s.id]: e.target.value }))
                  }
                  placeholder="Add subsection / step"
                  className="flex-1 rounded-lg border border-black/10 px-2 py-1 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const t = (subDraft[s.id] ?? "").trim();
                      if (!t) return;
                      onAddSub(s.id, t, 30);
                      setSubDraft((d) => ({ ...d, [s.id]: "" }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="rounded-lg bg-ink px-2 text-[11px] font-semibold text-white"
                  onClick={() => {
                    const t = (subDraft[s.id] ?? "").trim();
                    if (!t) return;
                    onAddSub(s.id, t, 30);
                    setSubDraft((d) => ({ ...d, [s.id]: "" }));
                  }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
        <div className="flex gap-2">
          <input
            value={secTitle}
            onChange={(e) => setSecTitle(e.target.value)}
            placeholder="New section (e.g. Research)"
            className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter" && secTitle.trim()) {
                onAddSection(secTitle.trim(), 60);
                setSecTitle("");
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (!secTitle.trim()) return;
              onAddSection(secTitle.trim(), 60);
              setSecTitle("");
            }}
            className="rounded-full border border-black/10 bg-white px-3 text-xs font-semibold"
          >
            Add section
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onTriage}
          className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white"
        >
          Triage onto calendar
        </button>
        <button
          type="button"
          onClick={onSchedule}
          className="w-full rounded-full border border-black/10 bg-white py-2.5 text-sm font-semibold"
        >
          Preferred-day plan (2 wks)
        </button>
      </div>
      <p className="text-[11px] text-muted">
        <strong>Triage</strong> schedules remaining work density against your
        deadline and preferred days. Preferred-day plan repeats fixed sessions
        for 2 weeks.
      </p>
    </li>
  );
}
