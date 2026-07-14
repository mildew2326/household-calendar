"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlanningStore } from "@/lib/planning/store";

export default function ShopPage() {
  const shoppingExtra = usePlanningStore((s) => s.shoppingExtra);
  const toggleShopItem = usePlanningStore((s) => s.toggleShopItem);
  const clearCheckedShop = usePlanningStore((s) => s.clearCheckedShop);
  const rebuildShoppingFromMeals = usePlanningStore(
    (s) => s.rebuildShoppingFromMeals
  );
  const [draft, setDraft] = useState("");
  // local-only quick adds layered in component state on top of store-built list
  const [local, setLocal] = useState<
    { id: string; name: string; qty: string; note: string; checked: boolean }[]
  >([]);

  const items = [...shoppingExtra, ...local];

  function addItem() {
    const name = draft.trim();
    if (!name) return;
    setLocal((list) => [
      ...list,
      {
        id: crypto.randomUUID(),
        name,
        qty: "",
        note: "manual",
        checked: false,
      },
    ]);
    setDraft("");
  }

  function toggle(id: string) {
    if (shoppingExtra.some((s) => s.id === id)) toggleShopItem(id);
    else
      setLocal((list) =>
        list.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
      );
  }

  function clearChecked() {
    clearCheckedShop();
    setLocal((list) => list.filter((i) => !i.checked));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Shop</h2>
          <p className="text-sm text-muted">
            Portion-aware list from family meals
          </p>
        </div>
        <Link href="/app/meals" className="text-xs font-semibold text-accent">
          Meals →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => rebuildShoppingFromMeals()}
          className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white"
        >
          Rebuild from meals
        </button>
        <button
          type="button"
          onClick={clearChecked}
          className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
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

      {!items.length ? (
        <p className="card p-4 text-sm text-muted">
          Empty. Open Meals and build a list, or add items here.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="card flex items-start gap-3 p-4">
              <button
                type="button"
                onClick={() => toggle(i.id)}
                className={`mt-0.5 h-7 w-7 shrink-0 rounded-lg border-2 ${
                  i.checked ? "border-accent bg-accent" : "border-black/20"
                }`}
                aria-label={`Toggle ${i.name}`}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`font-semibold ${
                    i.checked ? "text-muted line-through" : ""
                  }`}
                >
                  {i.name}
                  {i.qty ? (
                    <span className="ml-2 text-xs font-medium text-muted">
                      {i.qty}
                    </span>
                  ) : null}
                </p>
                {i.note && (
                  <p className="text-xs text-muted">{i.note}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
