import { Link } from "react-router-dom";

export default function InsightCard({ insight }) {
  return (
    <Link
      to={`/insights/${insight.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 transition-all duration-500 hover:-translate-y-1 hover:border-signal-dim"
    >
      <div>
        <span className="rounded-full border border-line-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          {insight.category}
        </span>
        <h3 className="mt-4 font-display text-lg font-medium leading-snug text-ink transition-colors duration-300 group-hover:text-signal">
          {insight.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">{insight.excerpt}</p>
      </div>
      <div className="mt-6 flex items-center gap-3 font-mono text-[11px] text-ink-faint">
        <span>{insight.author}</span>
        <span aria-hidden="true">·</span>
        <span>{insight.readingTime}</span>
      </div>
    </Link>
  );
}
