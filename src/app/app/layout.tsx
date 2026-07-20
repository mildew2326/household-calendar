"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ListTodo,
  MoreHorizontal,
  Plus,
  Sun,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePlanningStore } from "@/lib/planning/store";
import { upcomingReminders } from "@/lib/planning/types";
import { CloudSyncProvider } from "@/components/sync/CloudSyncProvider";
import { SyncBadge } from "@/components/sync/SyncBadge";

const tabs = [
  { href: "/app", label: "Today", icon: Sun, match: (p: string) => p === "/app" || p.startsWith("/app/today") },
  { href: "/app/calendar", label: "Cal", icon: CalendarDays, match: (p: string) => p.startsWith("/app/calendar") },
  { href: "/app/lists", label: "Lists", icon: ListTodo, match: (p: string) => p.startsWith("/app/lists") || p.startsWith("/app/shop") || p.startsWith("/app/tasks") || p.startsWith("/app/meals") },
  { href: "/app/more", label: "More", icon: MoreHorizontal, match: (p: string) => p.startsWith("/app/more") || p.startsWith("/app/goals") || p.startsWith("/app/macros") || p.startsWith("/app/settings") },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const events = usePlanningStore((s) => s.events);
  const members = usePlanningStore((s) => s.members);
  const activeMemberId = usePlanningStore((s) => s.activeMemberId);
  const setActiveMemberId = usePlanningStore((s) => s.setActiveMemberId);
  const addEventFromNL = usePlanningStore((s) => s.addEventFromNL);
  const activity = usePlanningStore((s) => s.activity);

  const [composerOpen, setComposerOpen] = useState(false);
  const [nl, setNl] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const reminders = useMemo(
    () => upcomingReminders(events.filter((e) => !e.deleted), new Date(), 60 * 24),
    [events]
  );

  useEffect(() => {
    if (!reminders.length) return;
    const r = reminders[0];
    const msg = `Reminder in ${r.minutesBefore}m: ${r.event.title}`;
    setToast(msg);
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [reminders[0]?.event.id, reminders[0]?.minutesBefore]);

  useEffect(() => {
    if (!activity[0]) return;
    // soft toast on new activity
  }, [activity[0]?.id]);

  function submitNL() {
    const id = addEventFromNL(nl);
    if (id) {
      setNl("");
      setComposerOpen(false);
      setToast("Event added");
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <CloudSyncProvider>
    <div className="mx-auto flex min-h-screen max-w-lg flex-col md:max-w-2xl">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[rgba(246,244,239,0.9)] px-4 pb-3 pt-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-accent uppercase">
              Duet
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-ink">
              Household
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SyncBadge />
            <div className="flex rounded-full border border-black/8 bg-white p-0.5">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  title={`Act as ${m.name}`}
                  onClick={() => setActiveMemberId(m.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                    activeMemberId === m.id
                      ? "text-white shadow-sm"
                      : "text-muted"
                  }`}
                  style={
                    activeMemberId === m.id
                      ? { background: m.color }
                      : undefined
                  }
                >
                  {m.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white shadow-lg shadow-black/10"
              aria-label="Quick add"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        {reminders[0] && (
          <div className="mt-2 rounded-2xl border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-medium text-ink">
            Next: {reminders[0].event.title} · {reminders[0].minutesBefore} min
            before
          </div>
        )}
      </header>

      <div className="flex-1 px-4 pb-28 pt-3">{children}</div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      {composerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-[2px] sm:items-center">
          <div className="card w-full max-w-md space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Quick add</h2>
              <button
                type="button"
                className="text-xs font-semibold text-muted"
                onClick={() => setComposerOpen(false)}
              >
                Close
              </button>
            </div>
            <p className="text-xs text-muted">
              Try: “Dentist tomorrow 10am” · “Date night Friday 7pm” · “Trash
              every week”
            </p>
            <input
              autoFocus
              value={nl}
              onChange={(e) => setNl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitNL()}
              placeholder="What should we put on the calendar?"
              className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={submitNL}
                className="flex-1 rounded-full bg-accent py-3 text-sm font-semibold text-white"
              >
                Add event
              </button>
              <Link
                href="/app/lists"
                onClick={() => setComposerOpen(false)}
                className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold"
              >
                Lists
              </Link>
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-[rgba(246,244,239,0.94)] backdrop-blur-md"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-3 py-2 md:max-w-2xl">
          {tabs.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                    active ? "bg-white text-accent shadow-sm" : "text-muted"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
    </CloudSyncProvider>
  );
}
