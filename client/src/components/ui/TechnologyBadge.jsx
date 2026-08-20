export default function TechnologyBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-xs text-ink-dim transition-colors duration-300 hover:border-signal-dim hover:text-ink">
      {children}
    </span>
  );
}
