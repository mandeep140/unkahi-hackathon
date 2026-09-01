"use client";

export function QuickExit() {
  function handleExit() {
    window.location.replace("https://www.google.com");
  }

  return (
    <button
      onClick={handleExit}
      aria-label="Leave this page quickly"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 sm:px-3.5 py-2 text-[13px] font-medium text-muted hover:text-foreground hover:border-foreground/20 transition-colors focus-ring whitespace-nowrap"
    >
      <span className="hidden sm:inline">Leave quickly</span>
      <span className="sm:hidden">Exit</span>
    </button>
  );
}
