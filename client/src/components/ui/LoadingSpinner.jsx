import { cn } from "../../lib/utils";

export default function LoadingSpinner({ label = "Loading", className, size = 20 }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-ink-faint", className)}>
      <svg
        className="animate-spin text-signal"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        role="status"
        aria-label={label}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="font-mono text-xs uppercase tracking-[0.15em]">{label}</span>
    </div>
  );
}
