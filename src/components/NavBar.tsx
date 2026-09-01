"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { QuickExit } from "./QuickExit";

const PRIMARY_LINKS = [
  { href: "/start", label: "Start" },
  { href: "/checkin", label: "Check in" },
  { href: "/tools", label: "Tools" },
  { href: "/safety-plan", label: "Safety" },
];

const MORE_LINKS = [
  { href: "/resources", label: "Resources" },
  { href: "/journal", label: "Journal" },
  { href: "/my-data", label: "My data" },
  { href: "/org", label: "Organization" },
];

export function NavBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="nav-surface sticky top-0 z-30 w-full backdrop-blur-lg">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-[17px] font-semibold tracking-tight text-accent-strong focus-ring rounded-sm shrink-0"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-accent-soft to-clay-soft text-accent-strong text-[13px] shadow-sm"
          >
            ◎
          </span>
          unkahi
        </Link>

        <nav className="hidden sm:flex gap-1 text-[14px]">
          {PRIMARY_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-2 transition-colors focus-ring ${
                  active
                    ? "bg-accent-soft text-accent-strong font-medium"
                    : "text-muted hover:text-foreground hover:bg-surface-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className={`rounded-full px-3.5 py-2 transition-colors focus-ring ${
                moreOpen
                  ? "bg-surface-muted text-foreground"
                  : "text-muted hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              More
            </button>
            {moreOpen && (
              <>
                <button
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMoreOpen(false)}
                  className="fixed inset-0 z-30 cursor-default"
                />
                <div className="menu-surface absolute right-0 top-[calc(100%+0.5rem)] z-40 w-48 p-1.5 flex flex-col gap-0.5">
                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-[14px] text-foreground hover:bg-surface-muted transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="shrink-0">
          <QuickExit />
        </div>
      </div>

      <nav className="sm:hidden max-w-2xl mx-auto px-5 pb-3 flex gap-1.5 overflow-x-auto scrollbar-thin text-[13px]">
        {[...PRIMARY_LINKS, ...MORE_LINKS].map((link) => {
          const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 transition-colors focus-ring ${
                active
                  ? "bg-accent-soft text-accent-strong font-medium"
                  : "text-muted hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
