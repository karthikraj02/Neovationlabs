import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";

const PROMPT = ["Build", "what's", "next"];

// One entry per decoding pass: the candidates the model scores, top pick first.
const STEPS = [
  [["with", 0.74], ["using", 0.18], ["for", 0.08]],
  [["AI", 0.86], ["agents", 0.09], ["data", 0.05]],
  [[".", 0.91], ["today", 0.06], ["!", 0.03]],
];

const CYCLE_MS = 3400;
const EASE = [0.16, 1, 0.3, 1];

const LAYERS = ["embed", "attn", "ffn", "logits"];
const UNITS = 8;
const W = 360;
const H = 150;
const X0 = 58;
const LAYER_DELAY = 0.28;

const nodeAt = (layer, unit) => ({
  x: X0 + (unit * (W - X0 - 10)) / (UNITS - 1),
  y: 12 + (layer * (H - 24)) / (LAYERS.length - 1),
});

// Deterministic pseudo-random subset so each pass lights a different route.
const isActive = (pass, layer, unit) => (pass * 7 + layer * 11 + unit * 3) % 5 < 2;

const units = Array.from({ length: UNITS }, (_, i) => i);

function Network({ pass, running }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id="llmEdge" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={H}>
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#8b7cf6" />
        </linearGradient>
      </defs>

      {LAYERS.map((name, l) => (
        <text key={name} x="0" y={nodeAt(l, 0).y + 3} fontSize="9" className="fill-ink-faint font-mono">
          {name}
        </text>
      ))}

      {LAYERS.slice(1).map((_, l) =>
        units.map((a) =>
          units.map((b) => {
            const p = nodeAt(l, a);
            const q = nodeAt(l + 1, b);
            return (
              <line key={`e-${l}-${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#1c202b" strokeWidth="0.6" />
            );
          })
        )
      )}

      {running &&
        LAYERS.slice(1).flatMap((_, l) =>
          units.flatMap((a) =>
            units
              .filter((b) => Math.abs(a - b) <= 2 && isActive(pass, l, a) && isActive(pass, l + 1, b))
              .map((b) => {
                const p = nodeAt(l, a);
                const q = nodeAt(l + 1, b);
                return (
                  <motion.line
                    key={`a-${pass}-${l}-${a}-${b}`}
                    x1={p.x}
                    y1={p.y}
                    x2={q.x}
                    y2={q.y}
                    stroke="url(#llmEdge)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 0.9, 0.35] }}
                    transition={{ duration: 0.5, delay: 0.15 + l * LAYER_DELAY, ease: "easeOut" }}
                  />
                );
              })
          )
        )}

      {LAYERS.map((_, l) =>
        units.map((u) => {
          const { x, y } = nodeAt(l, u);
          return (
            <g key={`n-${l}-${u}`}>
              <circle cx={x} cy={y} r="3" fill="#06070a" stroke="#5b6178" strokeWidth="1" />
              {running && isActive(pass, l, u) && (
                <motion.circle
                  key={pass}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#5eead4"
                  style={{ filter: "drop-shadow(0 0 4px rgba(94,234,212,0.8))" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.45] }}
                  transition={{ duration: 0.6, delay: 0.1 + l * LAYER_DELAY }}
                />
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

const token = "inline-flex h-[22px] items-center rounded-md border px-2 font-mono text-[11px]";
const label = "font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint";

export default function LLMVisual() {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setTick((t) => t + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const phase = tick % (STEPS.length + 1);
  const candidates = STEPS[phase];
  const generated = STEPS.slice(0, phase).map(([[top]]) => top);

  return (
    <div
      role="img"
      aria-label="Animated diagram of a language model generating text one token at a time"
      className="relative rounded-2xl border border-line bg-surface/70 p-5 shadow-[0_0_80px_-24px_rgba(94,234,212,0.25)] backdrop-blur sm:p-6"
    >
      <div aria-hidden="true">
        <div className={cn(label, "flex items-center justify-between")}>
          <span className="flex items-center gap-2 text-signal">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
            model.generate()
          </span>
          <span>temp 0.7 · top-p 0.9</span>
        </div>

        <div className={cn(label, "mt-5")}>Context</div>
        <div className="mt-2 flex min-h-[3.25rem] flex-wrap content-start items-center gap-1.5">
          {PROMPT.map((t) => (
            <span key={t} className={cn(token, "border-line bg-void text-ink-dim")}>
              {t}
            </span>
          ))}
          <AnimatePresence>
            {generated.map((t, i) => (
              <motion.span
                key={`gen-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={cn(token, "border-signal-dim bg-signal/10 text-signal")}
              >
                {t}
              </motion.span>
            ))}
          </AnimatePresence>
          {candidates && (
            <motion.span
              className="h-4 w-1.5 bg-signal"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
            />
          )}
        </div>

        <div className="mt-4 border-y border-line/60 py-4">
          <Network pass={tick} running={Boolean(candidates)} />
        </div>

        <div className={cn(label, "mt-4 flex items-center justify-between")}>
          <span>Next token</span>
          <span>{candidates ? `step ${phase + 1}/${STEPS.length}` : "<eos>"}</span>
        </div>
        <div className="mt-3 h-[4.75rem]">
          <AnimatePresence mode="wait">
            {candidates ? (
              <motion.div key={`p-${tick}`} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-2.5">
                {candidates.map(([t, p], k) => (
                  <div key={t} className="grid grid-cols-[4rem_1fr_2.5rem] items-center gap-3 font-mono text-[11px]">
                    <span className={k === 0 ? "text-ink" : "text-ink-faint"}>{t}</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line">
                      <motion.div
                        className={cn("h-full rounded-full", k === 0 ? "bg-signal" : "bg-ink-faint/50")}
                        initial={{ width: 0 }}
                        animate={{ width: `${p * 100}%` }}
                        transition={{ duration: 0.7, delay: 1.2 + k * 0.08, ease: EASE }}
                      />
                    </div>
                    <motion.span
                      className="text-right text-ink-faint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4 + k * 0.08 }}
                    >
                      {p.toFixed(2)}
                    </motion.span>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full items-center gap-2 font-mono text-[11px] text-ink-dim"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                Sequence complete · {STEPS.length} tokens generated
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
