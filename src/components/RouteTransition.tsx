"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function TopLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const previousPath = useRef(pathname);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = (event.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      const isSamePath = href === window.location.pathname;
      if (isSamePath) return;
      setVisible(true);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 220);
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="top-loader" role="status" aria-label="Loading page">
      <div className="top-loader-bar" />
    </div>
  );
}

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
