"use client";

import Link from "next/link";
import { useState } from "react";

const QUICK_LINKS = [
  { href: "/safety-plan", label: "Safety plan", icon: "◈" },
  { href: "/tools", label: "Calming tools", icon: "◐" },
  { href: "/checkin", label: "Quick check-in", icon: "◎" },
];

const PRIMARY_HELPLINE = { label: "Call KIRAN helpline", number: "1800-599-0019" };

function toTelHref(number: string) {
  return `tel:${number.replace(/[^0-9+]/g, "")}`;
}

export function FloatingHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="menu-surface absolute bottom-[calc(100%+0.75rem)] right-0 z-50 w-60 p-2 flex flex-col gap-1 animate-fade-up">
            <p className="text-[12px] font-medium text-muted uppercase tracking-wide px-2.5 pt-1.5 pb-1">
              Quick access
            </p>
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[14px] text-foreground hover:bg-surface-muted transition-colors"
              >
                <span
                  aria-hidden
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-strong text-[14px] shrink-0"
                >
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
            <a
              href={toTelHref(PRIMARY_HELPLINE.number)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[14px] font-medium text-clay-strong bg-clay-soft hover:bg-clay hover:text-white transition-colors mt-1"
            >
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 text-[14px] shrink-0"
              >
                ☎
              </span>
              {PRIMARY_HELPLINE.label}
            </a>
          </div>
        </>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Quick access to help and safety resources"
        className={`relative z-50 inline-flex items-center justify-center h-14 w-14 rounded-full border transition-all duration-200 focus-ring shadow-[var(--shadow-md)] active:scale-95 ${
          open
            ? "bg-clay-strong border-clay-strong text-white"
            : "bg-clay border-clay text-white hover:bg-clay-strong"
        }`}
      >
        <span className="text-[20px]" aria-hidden>
          {open ? "✕" : "◈"}
        </span>
      </button>
    </div>
  );
}
