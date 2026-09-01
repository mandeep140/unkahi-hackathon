import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: Tag = "div",
  lift = false,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  lift?: boolean;
}) {
  const Component = Tag as "div";
  return (
    <Component
      className={`card-surface p-6 sm:p-7 ${lift ? "card-lift" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[13px] font-semibold text-muted tracking-wide mb-3">
      {children}
    </h2>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="text-sm font-medium text-accent-strong mb-2">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-foreground mb-3 leading-snug">
        {title}
      </h1>
      {description && (
        <p className="text-[15px] text-muted leading-relaxed max-w-xl">
          {description}
        </p>
      )}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "clay";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground border-accent hover:bg-accent-strong hover:border-accent-strong shadow-[var(--shadow-glow)]",
  secondary:
    "bg-surface text-foreground border-border hover:border-accent hover:text-accent-strong",
  ghost: "bg-transparent text-foreground border-transparent hover:bg-surface-muted",
  danger: "bg-danger-soft text-danger border-danger/30 hover:bg-danger hover:text-white hover:border-danger",
  clay: "bg-clay text-white border-clay hover:bg-clay-strong hover:border-clay-strong shadow-sm",
};

export function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 border rounded-full text-[15px] font-medium transition-all duration-200 active:scale-[0.98] focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${BUTTON_VARIANTS[variant]} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-border rounded-2xl p-4 text-[15px] leading-relaxed bg-surface focus-ring focus:border-accent transition-colors resize-none ${props.className ?? ""}`}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-border rounded-2xl p-3 text-[15px] bg-surface focus-ring focus:border-accent transition-colors ${props.className ?? ""}`}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent";
  className?: string;
}) {
  const toneClass =
    tone === "accent"
      ? "bg-accent-soft text-accent-strong"
      : "bg-surface-muted text-muted";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div
      className="flex gap-2"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current + 1}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
            i <= current ? "bg-accent" : "bg-surface-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="text-center py-12 flex flex-col items-center gap-3">
      <p className="text-[15px] font-medium">{title}</p>
      {description && (
        <p className="text-[15px] text-muted max-w-sm leading-relaxed">{description}</p>
      )}
      {action}
    </Card>
  );
}
