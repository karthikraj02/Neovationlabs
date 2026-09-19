import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "../../lib/utils";

const stages = [
  { name: "User", status: "request received" },
  { name: "Application", status: "authenticated" },
  { name: "AI Layer", status: "guardrails on" },
  { name: "Agents / LLM", status: "planning steps" },
  { name: "Data / Knowledge", status: "context retrieved" },
  { name: "Infrastructure", status: "scaled & observed" },
  { name: "Business Systems", status: "action completed" },
];

const ROW = 88;
const PAD = 40;
const CARD_H = 60;
const DURATION = 9000;
const HOLD = 1800;
const TAIL = 80;

export default function RequestJourney() {
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef, { once: true, margin: "-80px" });
  const [w, setW] = useState(0);
  const [reached, setReached] = useState(-1);

  const pathRef = useRef(null);
  const litRef = useRef(null);
  const tailRef = useRef(null);
  const dotRef = useRef(null);
  const haloRef = useRef(null);

  const H = PAD * 2 + ROW * (stages.length - 1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const pts = useMemo(
    () => stages.map((_, i) => ({ x: w * (i % 2 === 0 ? 0.3 : 0.7), y: PAD + i * ROW })),
    [w]
  );

  const d = useMemo(() => {
    if (!w) return "";
    return pts
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = pts[i - 1];
        const my = (prev.y + p.y) / 2;
        return `C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
      })
      .join(" ");
  }, [pts, w]);

  useEffect(() => {
    const path = pathRef.current;
    if (!inView || !path || !d) return undefined;

    const total = path.getTotalLength();

    // Find the path length at which each stage's centre sits.
    const marks = pts.map(() => 0);
    let from = 0;
    for (let i = 1; i < pts.length; i += 1) {
      let best = Infinity;
      let bestLen = from;
      for (let len = from + 8; len <= Math.min(total, from + 420); len += 2) {
        const pt = path.getPointAtLength(len);
        const dist = Math.hypot(pt.x - pts[i].x, pt.y - pts[i].y);
        if (dist < best) {
          best = dist;
          bestLen = len;
        }
      }
      marks[i] = bestLen;
      from = bestLen;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      litRef.current?.setAttribute("stroke-dasharray", `${total} ${total + 1}`);
      setReached(stages.length - 1);
      return undefined;
    }

    let raf;
    let last = -2;
    const start = performance.now();

    const frame = (now) => {
      const elapsed = (now - start) % (DURATION + HOLD);
      const raw = Math.min(1, elapsed / DURATION);
      const prog = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2; // ease in-out
      const len = prog * total;

      litRef.current?.setAttribute("stroke-dasharray", `${len} ${total + 1}`);
      const tail = Math.min(TAIL, len);
      tailRef.current?.setAttribute("stroke-dasharray", `${tail} ${total + TAIL}`);
      tailRef.current?.setAttribute("stroke-dashoffset", `${-(len - tail)}`);

      const pt = path.getPointAtLength(len);
      const show = elapsed <= DURATION ? "1" : "0";
      [dotRef.current, haloRef.current].forEach((n) => {
        if (!n) return;
        n.setAttribute("cx", pt.x);
        n.setAttribute("cy", pt.y);
        n.setAttribute("opacity", show);
      });
      tailRef.current?.setAttribute("opacity", show);

      let r = -1;
      for (let i = 0; i < marks.length; i += 1) if (len >= marks[i] - 0.5) r = i;
      if (r !== last) {
        last = r;
        setReached(r);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, d, pts]);

  const cardW = Math.min(240, w * 0.56);

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      style={{ height: H }}
      role="img"
      aria-label="A request travelling through seven stages: user, application, AI layer, agents and LLM, data and knowledge, infrastructure, and business systems"
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-3/4 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(94,234,212,0.07),transparent_70%)]" />

      {w > 0 && (
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} className="absolute inset-0" aria-hidden="true">
          <defs>
            <linearGradient id="journey-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={H}>
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#8b7cf6" />
            </linearGradient>
          </defs>

          <path ref={pathRef} d={d} fill="none" stroke="#1c202b" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
          <path
            ref={litRef}
            d={d}
            fill="none"
            stroke="url(#journey-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`0 ${H * 10}`}
            style={{ filter: "drop-shadow(0 0 5px rgba(94,234,212,0.55))" }}
          />
          <path
            ref={tailRef}
            d={d}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.9"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`0 ${H * 10}`}
            opacity="0"
            style={{ filter: "drop-shadow(0 0 6px rgba(94,234,212,1))" }}
          />
          <circle ref={haloRef} r="11" fill="rgba(94,234,212,0.22)" opacity="0" />
          <circle
            ref={dotRef}
            r="4.5"
            fill="#ffffff"
            opacity="0"
            style={{ filter: "drop-shadow(0 0 8px rgba(94,234,212,1))" }}
          />
        </svg>
      )}

      {w > 0 &&
        stages.map((s, i) => {
          const on = i === reached;
          const done = i < reached;
          return (
            <div
              key={s.name}
              className={cn(
                "absolute flex items-center gap-3 rounded-xl border px-3 backdrop-blur",
                on
                  ? "border-signal bg-[rgba(12,32,30,0.92)] shadow-[0_0_34px_rgba(94,234,212,0.28)]"
                  : done
                    ? "border-signal-dim bg-surface"
                    : "border-line bg-surface"
              )}
              style={{
                left: pts[i].x,
                top: pts[i].y,
                width: cardW,
                height: CARD_H,
                opacity: inView ? 1 : 0,
                transform: `translate(-50%, -50%) scale(${inView ? (on ? 1.05 : 1) : 0.9})`,
                transition: `opacity 0.6s ${inView ? i * 0.09 : 0}s, transform 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.5s, background-color 0.5s, box-shadow 0.5s`,
              }}
            >
              {on && (
                <span key={`r${i}-${reached}`} className="stack-ripple pointer-events-none absolute inset-0 rounded-xl border border-signal" />
              )}
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-colors duration-500",
                  on
                    ? "border-signal bg-signal text-void"
                    : done
                      ? "border-signal-dim text-signal"
                      : "border-line text-ink-faint"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate font-mono text-[13px] transition-colors duration-500",
                    on || done ? "text-ink" : "text-ink-dim"
                  )}
                >
                  {s.name}
                </span>
                <span
                  className={cn(
                    "block truncate font-mono text-[10px] uppercase tracking-wide transition-colors duration-500",
                    on ? "text-signal" : done ? "text-signal-dim" : "text-ink-faint/70"
                  )}
                >
                  {done || on ? `✓ ${s.status}` : s.status}
                </span>
              </span>
            </div>
          );
        })}
    </div>
  );
}
