import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorMessage({
  title = "Something went wrong.",
  description,
  onRetry,
  variant = "error",
}) {
  const isEmpty = variant === "empty";
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface px-8 py-14 text-center">
      {!isEmpty && <AlertTriangle size={22} className="text-signal" />}
      <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm leading-relaxed text-ink-dim">{description}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-ink-dim transition-colors duration-300 hover:border-signal-dim hover:text-ink"
        >
          <RotateCcw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
