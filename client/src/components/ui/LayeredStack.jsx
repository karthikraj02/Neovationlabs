// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "../../lib/utils";

const GAP = 46; // vertical spacing between slabs in 3D space
const LIFT = 18; // extra rise for the active slab

const layers = [
  { name: "Frontend", note: "React interfaces that feel fast and clear." },
  { name: "API", note: "REST, GraphQL, and WebSocket contracts." },
  { name: "Backend", note: "Node and Python services, tested and typed." },
  { name: "AI / ML", note: "Models and pipelines behind clean interfaces." },
  { name: "Database", note: "Postgres and MongoDB, modeled for growth." },
  { name: "Infrastructure", note: "Docker, Kubernetes, and cloud, observable." },
];

/* Simple glyphs drawn on each slab's surface (viewBox 0 0 100 100). */
const glyphs = [
  // Frontend: wireframe UI
  <g key="f">
    <rect x="14" y="16" width="72" height="10" rx="3" />
    <rect x="14" y="34" width="34" height="24" rx="3" />
    <rect x="52" y="34" width="34" height="24" rx="3" />
    <rect x="14" y="64" width="72" height="18" rx="3" />
  </g>,
  // API: endpoints
  <g key="a">
    <path d="M30 24 L16 50 L30 76" />
    <path d="M70 24 L84 50 L70 76" />
    <path d="M56 28 L44 72" />
  </g>,
  // Backend: server rows
  <g key="b">
    {[20, 42, 64].map((y) => (
      <g key={y}>
        <rect x="16" y={y} width="68" height="16" rx="3" />
        <circle cx="26" cy={y + 8} r="2" fill="currentColor" />
        <path d={`M40 ${y + 8} H72`} />
      </g>
    ))}
  </g>,
  // AI / ML: tiny neural net
  <g key="m">
    {[
      [20, 28], [20, 50], [20, 72],
      [50, 20], [50, 42], [50, 64], [50, 84],
      [80, 38], [80, 62],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="currentColor" />
    ))}
    {[28, 50, 72].flatMap((y1) =>
      [20, 42, 64, 84].map((y2) => <path key={`${y1}-${y2}`} d={`M20 ${y1} L50 ${y2}`} opacity="0.35" />)
    )}
    {[20, 42, 64, 84].flatMap((y1) =>
      [38, 62].map((y2) => <path key={`b${y1}-${y2}`} d={`M50 ${y1} L80 ${y2}`} opacity="0.35" />)
    )}
  </g>,
  // Database: table grid
  <g key="d">
    <rect x="16" y="18" width="68" height="64" rx="4" />
    <path d="M16 36 H84 M16 54 H84 M16 72 H84 M42 18 V82" />
  </g>,
  // Infrastructure: node lattice
  <g key="i">
    {[24, 50, 76].flatMap((x) =>
      [24, 50, 76].map((y) => <rect key={`${x}-${y}`} x={x - 7} y={y - 7} width="14" height="14" rx="3" />)
    )}
  </g>,
];

export default function LayeredStack() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused) return undefined;
    const id = setInterval(() => setActive((a) => (a + 1) % layers.length), 1700);
    return () => clearInterval(id);
  }, [inView, paused]);

  const mid = (layers.length - 1) / 2;
  const beamH = GAP * (layers.length - 1) + 60;

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-2"
      onMouseLeave={() => setPaused(false)}
      role="img"
      aria-label="Isometric diagram of a full-stack architecture: frontend, API, backend, AI and ML, database, and infrastructure layers"
    >
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_40%_50%,rgba(94,234,212,0.08),transparent_65%)]" />

      {/* 3D stack */}
      <div
        className="relative h-[340px] w-full max-w-[300px] shrink-0 sm:h-[420px] sm:w-[58%] sm:max-w-none"
        style={{ perspective: "1400px" }}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transformStyle: "preserve-3d",
            transform: "translate(-50%, -50%) rotateX(58deg) rotateZ(-38deg)",
          }}
        >
          {/* flowing beam through the stack */}
          <div
            className="stack-beam absolute left-1/2 top-1/2 w-[3px] rounded-full"
            style={{
              height: beamH,
              marginLeft: -1.5,
              marginTop: -beamH / 2,
              transform: "rotateX(90deg)",
            }}
          />

          {layers.map((layer, i) => {
            const on = i === active;
            const z = (mid - i) * GAP * (inView ? 1 : 0) + (on ? LIFT : 0);
            return (
              <div
                key={layer.name}
                onMouseEnter={() => {
                  setActive(i);
                  setPaused(true);
                }}
                className={cn(
                  "absolute left-1/2 top-1/2 -ml-[75px] -mt-[75px] h-[150px] w-[150px] rounded-2xl border sm:-ml-[90px] sm:-mt-[90px] sm:h-[180px] sm:w-[180px]",
                  on
                    ? "border-signal bg-[rgba(12,32,30,0.88)] text-signal shadow-[0_0_46px_rgba(94,234,212,0.35)]"
                    : "border-line bg-[rgba(16,19,26,0.82)] text-ink-faint"
                )}
                style={{
                  transform: `translateZ(${z}px)`,
                  transition: `transform 0.9s cubic-bezier(0.16,1,0.3,1) ${
                    inView ? i * 0.07 : 0
                  }s, border-color 0.5s, background-color 0.5s, box-shadow 0.5s, color 0.5s`,
                }}
              >
                <div className="bg-grid absolute inset-0 rounded-2xl opacity-40" />
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-[16%] h-[68%] w-[68%]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {glyphs[i]}
                </svg>
                {on && <span key={active} className="stack-ripple absolute inset-0 rounded-2xl border border-signal" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <ol className="relative z-10 w-full sm:w-[42%]">
        {layers.map((layer, i) => {
          const on = i === active;
          return (
            <li key={layer.name}>
              <button
                type="button"
                onMouseEnter={() => {
                  setActive(i);
                  setPaused(true);
                }}
                onFocus={() => {
                  setActive(i);
                  setPaused(true);
                }}
                onBlur={() => setPaused(false)}
                className={cn(
                  "group flex w-full items-start gap-3 border-l py-2 pl-4 text-left transition-colors duration-500",
                  on ? "border-signal" : "border-line"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 font-mono text-[10px] transition-colors duration-500",
                    on ? "text-signal" : "text-ink-faint"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span
                    className={cn(
                      "block font-mono text-sm transition-colors duration-500",
                      on ? "text-ink" : "text-ink-dim"
                    )}
                  >
                    {layer.name}
                  </span>
                  <span
                    className={cn(
                      "block overflow-hidden text-xs leading-relaxed text-ink-faint transition-all duration-500",
                      on ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    {layer.note}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
