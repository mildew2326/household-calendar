"use client";

import { useMemo, useState } from "react";
import { usePlanningStore } from "@/lib/planning/store";
import type { Priority } from "@/lib/planning/types";

export default function TasksPage() {
  const tasks = usePlanningStore((s) => s.tasks);
  const members = usePlanningStore((s) => s.members);
  const addTask = usePlanningStore((s) => s.addTask);
  const toggleTask = usePlanningStore((s) => s.toggleTask);
  const removeTask = usePlanningStore((s) => s.removeTask);
  const updateTask = usePlanningStore((s) => s.updateTask);

  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>(3);

  const open = useMemo(
    () => tasks.filter((t) => !t.completed),
    [tasks]
  );
  const done = useMemo(
    () => tasks.filter((t) => t.completed),
    [tasks]
  );

  function create() {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      notes: "",
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      priority,
    });
    setTitle("");
    setDueDate("");
    setPriority(3);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
        <p className="text-sm text-muted">
          Shared household to-dos — assign, due date, done
        </p>
      </div>

      <div className="card space-y-2 p-4">
        <p className="text-sm font-semibold">Add task</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="What needs doing?"
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="rounded-xl border border-black/10 px-2 py-2 text-xs"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-xl border border-black/10 px-2 py-2 text-xs"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as Priority)}
            className="rounded-xl border border-black/10 px-2 py-2 text-xs"
          >
            {[1, 2, 3, 4, 5].map((p) => (
              <option key={p} value={p}>
                P{p}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={create}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
          >
            Add task
          </button>
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Open ({open.length})</h3>
        {!open.length && (
          <p className="card p-4 text-sm text-muted">No open tasks. Add one above.</p>
        )}
        <ul className="space-y-2">
          {open.map((t) => {
            const who = members.find((m) => m.id === t.assigneeId);
            return (
              <li key={t.id} className="card flex items-start gap-3 p-4">
                <button
                  type="button"
                  aria-label="Toggle complete"
                  onClick={() => toggleTask(t.id)}
                  className="mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 border-black/20 bg-white"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-xs text-muted">
                    {who?.name ?? "Unassigned"} · P{t.priority}
                    {t.dueDate ? ` · due ${t.dueDate}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      value={t.assigneeId ?? ""}
                      onChange={(e) =>
                        updateTask(t.id, {
                          assigneeId: e.target.value || null,
                        })
                      }
                      className="rounded-lg border border-black/10 px-2 py-1 text-[11px]"
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={t.dueDate ?? ""}
                      onChange={(e) =>
                        updateTask(t.id, { dueDate: e.target.value || null })
                      }
                      className="rounded-lg border border-black/10 px-2 py-1 text-[11px]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTask(t.id)}
                  className="text-xs font-semibold text-red-700"
                >
                  Del
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {done.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-muted">
            Done ({done.length})
          </h3>
          <ul className="space-y-2 opacity-70">
            {done.map((t) => (
              <li key={t.id} className="card flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleTask(t.id)}
                  className="h-6 w-6 shrink-0 rounded-full border-2 border-accent bg-accent"
                />
                <p className="flex-1 text-sm line-through text-muted">
                  {t.title}
                </p>
                <button
                  type="button"
                  onClick={() => removeTask(t.id)}
                  className="text-xs font-semibold text-red-700"
                >
                  Del
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
