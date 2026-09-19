// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const TICK_MS = 700;
const AUTO_SWITCH_TICKS = 16;

/* ---------------------------------- LLM ---------------------------------- */

const tokens = ["The", "model", "reads", "every", "token", "in", "context"];

// Illustrative attention weights: how strongly token i looks at token j.
const attention = (i, j) => {
  if (i === j) return 0;
  const seed = Math.sin((i + 1) * 12.9898 + (j + 1) * 78.233) * 43758.5453;
  const base = seed - Math.floor(seed);
  const nearBoost = 1 / (1 + Math.abs(i - j));
  return Math.min(1, base * 0.6 + nearBoost * 0.5);
};

const nextTokens = [
  ["model", 0.46, ["system", "agent", "data"]],
  ["reads", 0.41, ["sees", "scans", "parses"]],
  ["every", 0.38, ["each", "all", "the"]],
  ["token", 0.52, ["word", "input", "part"]],
  ["in", 0.44, ["of", "with", "and"]],
  ["context", 0.49, ["order", "turn", "full"]],
  ["<end>", 0.4, [".", "then", "and"]],
].map(([top, p, others]) => ({
  rows: [
    [top, p],
    [others[0], (1 - p) * 0.5],
    [others[1], (1 - p) * 0.3],
    [others[2], (1 - p) * 0.2],
  ],
}));

function LLMPanel({ tick }) {
  const active = Math.floor(tick / 3) % tokens.length;
  const col = (i) => ((i + 0.5) / tokens.length) * 100;

  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
        Self-attention · each token weighs every other
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 100 34"
          preserveAspectRatio="none"
          className="h-24 w-full sm:h-28"
          aria-hidden="true"
        >
          {tokens.map((_, j) => {
            if (j === active) return null;
            const w = attention(active, j);
            const x1 = col(active);
            const x2 = col(j);
            const lift = 6 + Math.abs(active - j) * 4.2;
            return (
              <path
                key={j}
                d={`M ${x1} 34 Q ${(x1 + x2) / 2} ${34 - lift * 1.6} ${x2} 34`}
                fill="none"
                stroke={w > 0.5 ? "#5eead4" : "#8b7cf6"}
                strokeOpacity={0.15 + w * 0.85}
                strokeWidth={1 + w * 1.6}
                vectorEffect="non-scaling-stroke"
                style={{ transition: "all 0.5s ease" }}
              />
            );
          })}
        </svg>

        <div className="grid" style={{ gridTemplateColumns: `repeat(${tokens.length}, 1fr)` }}>
          {tokens.map((t, i) => (
            <div key={t} className="flex justify-center">
              <span
                className={cn(
                  "rounded-md border px-1.5 py-1 font-mono text-[10px] transition-all duration-500 sm:px-2 sm:text-xs",
                  i === active
                    ? "border-signal bg-signal text-void shadow-[0_0_20px_rgba(94,234,212,0.45)]"
                    : "border-line bg-surface-raised text-ink-dim"
                )}
              >
                {t}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ink-faint">
          <span>Next-token probabilities</span>
          <span className="text-signal">softmax</span>
        </div>
        <div className="space-y-1.5">
          {nextTokens[active].rows.map(([label, p], i) => (
            <div key={label} className="flex items-center gap-3 font-mono text-[11px]">
              <span className={cn("w-14 shrink-0 truncate", i === 0 ? "text-ink" : "text-ink-faint")}>
                {label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-line-soft">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    i === 0 ? "bg-gradient-to-r from-signal to-pulse" : "bg-ink-faint/50"
                  )}
                  animate={{ width: `${Math.round(p * 100)}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-ink-faint">{Math.round(p * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- CNN ---------------------------------- */

const GRID = 6;
const CELL = 14;
const KERNEL = 3;
const KPOS = GRID - KERNEL + 1; // 4 -> 16 kernel positions

const pixel = (r, c) => {
  // A soft diagonal "edge" pattern so the input reads like an image.
  const d = Math.abs(r - c);
  const v = Math.sin((r * 7 + c * 13) * 1.7) * 0.5 + 0.5;
  return d <= 1 ? 0.55 + v * 0.45 : v * 0.35;
};

const layers = [
  { name: "Input", x: 12 },
  { name: "Conv", x: 128 },
  { name: "Pool", x: 216 },
  { name: "Conv", x: 292 },
  { name: "Dense", x: 372 },
  { name: "Output", x: 424 },
];

const outputs = [
  ["Pass", 0.86],
  ["Defect", 0.09],
  ["Review", 0.05],
];

function CNNPanel({ tick }) {
  const stage = tick % 6;
  const k = tick % (KPOS * KPOS);
  const kr = Math.floor(k / KPOS);
  const kc = k % KPOS;
  const on = (i) => stage >= i;
  const lit = (i) => (stage === i ? "#5eead4" : on(i) ? "#2f6e63" : "#1c202b");

  const stack = (x, y, size, count, layer) =>
    Array.from({ length: count }).map((_, n) => (
      <rect
        key={`${layer}-${n}`}
        x={x + n * 7}
        y={y - n * 7}
        width={size}
        height={size}
        rx="3"
        fill={stage === layer ? "rgba(94,234,212,0.10)" : "rgba(255,255,255,0.02)"}
        stroke={lit(layer)}
        strokeWidth="1"
        style={{ transition: "all 0.4s" }}
      />
    ));

  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
        Convolution · a small filter slides across the image
      </div>

      <svg viewBox="0 0 480 190" className="h-auto w-full" aria-hidden="true">
        {/* connectors */}
        {[
          [96, 90, 128, 90, 1],
          [180, 90, 216, 90, 2],
          [252, 90, 292, 90, 3],
          [332, 90, 372, 90, 4],
          [396, 90, 424, 90, 5],
        ].map(([x1, y1, x2, y2, l]) => (
          <line
            key={l}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stage >= l ? "#5eead4" : "#1c202b"}
            strokeWidth="1"
            strokeDasharray="3 3"
            style={{ transition: "stroke 0.4s" }}
          />
        ))}

        {/* input image */}
        {Array.from({ length: GRID }).map((_, r) =>
          Array.from({ length: GRID }).map((__, c) => (
            <rect
              key={`${r}-${c}`}
              x={12 + c * CELL}
              y={48 + r * CELL}
              width={CELL - 1}
              height={CELL - 1}
              rx="1.5"
              fill={`rgba(94,234,212,${0.05 + pixel(r, c) * 0.6})`}
            />
          ))
        )}
        <rect
          x={12 + kc * CELL - 1}
          y={48 + kr * CELL - 1}
          width={KERNEL * CELL + 1}
          height={KERNEL * CELL + 1}
          rx="3"
          fill="rgba(139,124,246,0.15)"
          stroke="#8b7cf6"
          strokeWidth="1.5"
          style={{ transition: "all 0.35s ease" }}
        />

        {/* feature maps */}
        {stack(128, 108, 42, 3, 1)}
        {stack(216, 100, 26, 3, 2)}
        {stack(292, 100, 28, 2, 3)}

        {/* dense layer */}
        {Array.from({ length: 6 }).map((_, n) => (
          <circle
            key={n}
            cx={384}
            cy={54 + n * 15}
            r="4"
            fill={stage === 4 ? "#5eead4" : on(4) ? "#2f6e63" : "#10131a"}
            stroke={lit(4)}
            style={{ transition: "all 0.4s" }}
          />
        ))}

        {/* output */}
        {outputs.map(([label, p], n) => (
          <g key={label}>
            <rect x={424} y={62 + n * 18} width={46} height={7} rx="3.5" fill="#14161f" />
            <rect
              x={424}
              y={62 + n * 18}
              width={on(5) ? 46 * p : 0}
              height={7}
              rx="3.5"
              fill={n === 0 ? "#5eead4" : "#5b6178"}
              style={{ transition: "width 0.6s ease" }}
            />
            <text x={424} y={58 + n * 18} fontSize="7.5" fill="#9aa1b2" fontFamily="IBM Plex Mono, monospace">
              {label}
            </text>
          </g>
        ))}

        {/* layer labels */}
        {layers.map((l, i) => (
          <text
            key={`${l.name}-${i}`}
            x={l.x}
            y={172}
            fontSize="8"
            letterSpacing="1"
            fill={stage === i ? "#5eead4" : "#5b6178"}
            fontFamily="IBM Plex Mono, monospace"
            style={{ transition: "fill 0.4s", textTransform: "uppercase" }}
          >
            {l.name.toUpperCase()}
          </text>
        ))}
      </svg>

      <div className="mt-3 font-mono text-[11px] leading-relaxed text-ink-dim">
        <span className="text-signal">layer {stage + 1}/6 ▸ {layers[stage].name.toLowerCase()}</span>
        {" — "}
        {
          [
            "raw pixels enter the network",
            "filters pick out edges and textures",
            "pooling keeps the strongest signal",
            "deeper filters combine into shapes",
            "features are flattened and weighed",
            "class scores come out the other end",
          ][stage]
        }
      </div>
    </div>
  );
}

/* -------------------------------- Container ------------------------------- */

const tabs = [
  { id: "llm", label: "LLM", sub: "Transformer" },
  { id: "cnn", label: "CNN", sub: "Convolutional" },
];

export default function NeuralModels() {
  const [tab, setTab] = useState("llm");
  const [manual, setManual] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (manual || tick === 0 || tick % AUTO_SWITCH_TICKS !== 0) return;
    setTab((t) => (t === "llm" ? "cnn" : "llm"));
  }, [tick, manual]);

  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(94,234,212,0.10),rgba(139,124,246,0.06)_50%,transparent_75%)] blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-line bg-void/80 backdrop-blur">
        <div className="flex items-center gap-2 border-b border-line p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setManual(true);
              }}
              className={cn(
                "flex flex-1 items-baseline justify-center gap-2 rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors",
                tab === t.id
                  ? "bg-signal/10 text-signal shadow-[inset_0_0_0_1px_rgba(94,234,212,0.35)]"
                  : "text-ink-faint hover:text-ink-dim"
              )}
            >
              <span className="text-sm font-medium">{t.label}</span>
              <span className="hidden text-[10px] opacity-70 sm:inline">{t.sub}</span>
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px]"
            >
              {tab === "llm" ? <LLMPanel tick={tick} /> : <CNNPanel tick={tick} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-line px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-ink-faint sm:px-6">
          Illustrative visualization · simplified, not a live model
        </div>
      </div>
    </div>
  );
}
