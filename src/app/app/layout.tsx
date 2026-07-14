"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  ShoppingCart,
  UtensilsCrossed,
  Settings,
  PieChart,
} from "lucide-react";

const tabs = [
  { href: "/app", label: "Calendar", icon: CalendarDays },
  { href: "/app/macros", label: "Macros", icon: PieChart },
  { href: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/app/shop", label: "Shop", icon: ShoppingCart },
  { href: "/app/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/app/settings", label: "More", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col md:max-w-3xl">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
            Household
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Duet</h1>
        </div>
        <Link
          href="/"
          className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
        >
          Home
        </Link>
      </header>
      <div className="flex-1 px-4 pb-28 pt-2">{children}</div>
      <nav
        className="fixed inset-x-0 bottom-0 border-t border-black/5 bg-[rgba(246,244,239,0.92)] backdrop-blur-md"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-2 md:max-w-3xl">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/app" ? pathname === "/app" : pathname.startsWith(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-semibold ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
