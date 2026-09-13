import { useState } from "react";
import { cn } from "../lib/utils";
import { formatNumber } from "./format";

const shortDay = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const longDay = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const parseDay = (key) => new Date(`${key}T00:00:00Z`);

// Round the axis up to a readable top value with whole-number steps.
function niceScale(max) {
  if (max <= 4) return { top: Math.max(max, 1), step: 1 };
  const raw = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / magnitude;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * magnitude;
  return { top: Math.ceil(max / step) * step, step };
}

export default function VisitorsChart({ data }) {
  const [active, setActive] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const n = data.length;
  const max = Math.max(0, ...data.map((d) => d.visitors));
  const { top, step } = niceScale(max);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const hovered = active === null ? null : data[active];
  const axisLabels = [0, Math.floor((n - 1) / 2), n - 1];
  const total = data.reduce((sum, d) => sum + d.visitors, 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-ink-faint">Hover a bar for that day's numbers</span>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs text-ink-dim underline-offset-2 transition-colors hover:text-ink hover:underline"
        >
          {showTable ? "Show chart" : "Show table"}
        </button>
      </div>

      {showTable ? (
        <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-raised">
              <tr className={cn("text-left font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint")}>
                <th className="px-4 py-2 font-normal">Day</th>
                <th className="px-4 py-2 text-right font-normal">Visitors</th>
                <th className="px-4 py-2 text-right font-normal">Page views</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.date} className="border-t border-line">
                  <td className="px-4 py-2 text-ink-dim">{longDay.format(parseDay(d.date))}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-ink">{formatNumber(d.visitors)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-ink-dim">{formatNumber(d.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4" role="img" aria-label={`Daily unique visitors over ${n} days, ${total} visits in total`}>
          <div className="flex">
            <div className="relative mr-3 h-52 w-8 shrink-0" aria-hidden="true">
              {ticks.map((t) => (
                <span
                  key={t}
                  className="absolute right-0 translate-y-1/2 font-mono text-[10px] tabular-nums text-ink-faint"
                  style={{ bottom: `${(t / top) * 100}%` }}
                >
                  {formatNumber(t)}
                </span>
              ))}
            </div>

            <div className="relative h-52 flex-1">
              {ticks.map((t) => (
                <div
                  key={t}
                  className={cn("absolute inset-x-0 border-t", t === 0 ? "border-ink-faint/40" : "border-line/70")}
                  style={{ bottom: `${(t / top) * 100}%` }}
                />
              ))}

              <div
                className={cn("absolute inset-0 flex items-end", n > 45 ? "gap-px" : "gap-[2px]")}
                onMouseLeave={() => setActive(null)}
              >
                {data.map((d, i) => (
                  // Full-height column so the hover target is bigger than the bar.
                  <div key={d.date} className="flex h-full flex-1 items-end" onMouseEnter={() => setActive(i)}>
                    <div
                      className={cn(
                        "w-full rounded-t-[4px] transition-colors duration-150",
                        active === null || active === i ? "bg-signal" : "bg-signal/30"
                      )}
                      style={{ height: `${(d.visitors / top) * 100}%` }}
                    />
                  </div>
                ))}
              </div>

              {hovered && (
                <div
                  className="pointer-events-none absolute top-0 z-10 rounded-lg border border-line bg-surface-raised px-3 py-2 shadow-lg shadow-black/40"
                  style={{
                    left: `${((active + 0.5) / n) * 100}%`,
                    transform: `translateX(${active < n * 0.2 ? "-10%" : active > n * 0.8 ? "-90%" : "-50%"})`,
                  }}
                >
                  <div className="whitespace-nowrap text-xs text-ink-faint">{longDay.format(parseDay(hovered.date))}</div>
                  <div className="mt-1 whitespace-nowrap text-sm text-ink">
                    <span className="font-medium tabular-nums">{formatNumber(hovered.visitors)}</span> visitors
                  </div>
                  <div className="whitespace-nowrap text-xs text-ink-dim">
                    <span className="tabular-nums">{formatNumber(hovered.views)}</span> page views
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative ml-11 mt-2 h-4" aria-hidden="true">
            {axisLabels.map((i, k) => (
              <span
                key={k}
                className="absolute whitespace-nowrap font-mono text-[10px] text-ink-faint"
                style={{
                  left: `${((i + 0.5) / n) * 100}%`,
                  transform: `translateX(${k === 0 ? "-15%" : k === 2 ? "-85%" : "-50%"})`,
                }}
              >
                {shortDay.format(parseDay(data[i].date))}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
