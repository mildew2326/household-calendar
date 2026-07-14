"use client";

import { useState } from "react";
import { demoTodos, demoMembers } from "@/lib/demo-data";
import type { Todo } from "@/lib/types";

export default function TasksPage() {
  const [todos, setTodos] = useState<Todo[]>(demoTodos);

  function toggle(id: string) {
    setTodos((list) =>
      list.map((t) =>
        t.id === id
          ? {
              ...t,
              completed_at: t.completed_at ? null : new Date().toISOString(),
            }
          : t
      )
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
        <p className="text-sm text-muted">Shared household to-dos</p>
      </div>
      <ul className="space-y-2">
        {todos.map((t) => {
          const who = demoMembers.find((m) => m.id === t.assignee_id);
          return (
            <li key={t.id} className="card flex items-start gap-3 p-4">
              <button
                type="button"
                aria-label="Toggle complete"
                onClick={() => toggle(t.id)}
                className={`mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 ${
                  t.completed_at
                    ? "border-accent bg-accent"
                    : "border-black/20 bg-white"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`font-semibold ${
                    t.completed_at ? "text-muted line-through" : ""
                  }`}
                >
                  {t.title}
                </p>
                <p className="text-xs text-muted">
                  {who?.display_name ?? "Unassigned"} · {t.priority}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
