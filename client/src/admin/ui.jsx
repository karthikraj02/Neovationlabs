import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export const inputClass =
  "w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-signal-dim focus:outline-none focus:ring-1 focus:ring-signal-dim";

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-void transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-2 text-sm text-ink-dim transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-50",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-red-900/60 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50",
};

export const labelClass = "font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint";

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-ink-dim">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }) {
  return (
    <section className={cn("rounded-xl border border-line bg-surface", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-medium text-ink">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatTile({ label, value, sub, icon: Icon }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className={cn(labelClass, "flex items-center justify-between")}>
        {label}
        {Icon && <Icon size={15} className="text-ink-faint" aria-hidden="true" />}
      </div>
      <div className="mt-3 font-display text-3xl font-medium tabular-nums tracking-tight text-ink">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-ink-dim">{sub}</div>}
    </div>
  );
}

const STATUS_DOT = {
  new: "bg-signal",
  reviewed: "bg-ink-dim",
  archived: "bg-ink-faint",
  requested: "bg-amber-400",
  scheduled: "bg-signal",
  completed: "bg-emerald-400",
  cancelled: "bg-red-400",
  planning: "bg-pulse",
  "in-progress": "bg-signal",
  review: "bg-amber-400",
  "on-hold": "bg-ink-faint",
};

export function statusLabel(status) {
  return status.replace("-", " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-void px-2.5 py-0.5 text-xs text-ink-dim">
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status] || "bg-ink-faint")} aria-hidden="true" />
      {statusLabel(status)}
    </span>
  );
}

export function ProgressBar({ value, className }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 overflow-hidden rounded-full bg-line", className)}
    >
      <div className="h-full rounded-full bg-signal transition-[width] duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex max-w-full overflow-x-auto rounded-lg border border-line bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors",
            value === o.value ? "bg-surface-raised text-ink" : "text-ink-faint hover:text-ink-dim"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, className, children }) {
  return (
    <label className={cn("block", className)}>
      <span className={labelClass}>{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

export function Loading({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-faint">
      <Loader2 size={16} className="animate-spin" />
      {label}…
    </div>
  );
}

export function ErrorNotice({ message, onRetry }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="text-xs underline underline-offset-2 hover:text-red-200">
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ children }) {
  return <p className="py-10 text-center text-sm text-ink-faint">{children}</p>;
}

export function Pagination({ page, pages, total, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 text-xs text-ink-faint">
      <span>
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className={buttonClass.secondary}>
          <ChevronLeft size={14} /> Previous
        </button>
        <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} className={buttonClass.secondary}>
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
