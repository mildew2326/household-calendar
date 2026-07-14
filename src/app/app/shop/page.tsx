"use client";

import { useState } from "react";
import { demoShopping } from "@/lib/demo-data";
import type { ShoppingItem } from "@/lib/types";

export default function ShopPage() {
  const [items, setItems] = useState<ShoppingItem[]>(demoShopping);
  const [draft, setDraft] = useState("");

  function toggle(id: string) {
    setItems((list) =>
      list.map((i) => (i.id === id ? { ...i, is_checked: !i.is_checked } : i))
    );
  }

  function addItem() {
    const name = draft.trim();
    if (!name) return;
    setItems((list) => [
      ...list,
      {
        id: crypto.randomUUID(),
        list_id: "groceries",
        name,
        is_checked: false,
        sort_order: list.length,
      },
    ]);
    setDraft("");
  }

  function clearChecked() {
    setItems((list) => list.filter((i) => !i.is_checked));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Shop</h2>
          <p className="text-sm text-muted">Groceries · live checklist</p>
        </div>
        <button
          type="button"
          onClick={clearChecked}
          className="text-xs font-semibold text-accent"
        >
          Clear checked
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add item"
          className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-xl bg-ink px-4 text-sm font-semibold text-white"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="card flex items-center gap-3 p-4">
            <button
              type="button"
              onClick={() => toggle(i.id)}
              className={`h-7 w-7 rounded-lg border-2 ${
                i.is_checked ? "border-accent bg-accent" : "border-black/20"
              }`}
              aria-label={`Toggle ${i.name}`}
            />
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  i.is_checked ? "text-muted line-through" : ""
                }`}
              >
                {i.name}
              </p>
              {i.quantity && (
                <p className="text-xs text-muted">{i.quantity}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
