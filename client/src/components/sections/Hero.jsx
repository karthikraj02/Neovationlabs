import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Button from "../ui/Button";
import Container from "../ui/Container";

const nodes = [
  { x: 60, y: 60 }, { x: 220, y: 30 }, { x: 340, y: 110 },
  { x: 120, y: 170 }, { x: 300, y: 230 }, { x: 60, y: 280 },
  { x: 380, y: 280 }, { x: 200, y: 330 },
];

const edges = [
  [0, 1], [1, 2], [0, 3], [1, 3], [3, 4], [2, 4],
  [3, 5], [4, 6], [3, 7], [4, 7],
];

function NetworkVisual() {
  return (
    <svg
      viewBox="0 0 420 380"
      className="h-full w-full"
      role="img"
      aria-label="Animated diagram of an intelligent network of connected nodes"
    >
      <defs>
        <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8b7cf6" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {edges.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="url(#edgeGrad)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}

      {edges.map(([a, b], i) => (
        <motion.circle
          key={`pulse-${i}`}
          r="2.2"
          fill="#5eead4"
          initial={{ opacity: 0 }}
          animate={{
            cx: [nodes[a].x, nodes[b].x],
            cy: [nodes[a].y, nodes[b].y],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.6,
            delay: 2 + i * 0.5,
            repeat: Infinity,
            repeatDelay: edges.length * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}

      {nodes.map((n, i) => (
        <motion.g key={i}>
          <motion.circle
            cx={n.x}
            cy={n.y}
            r={i === 3 || i === 4 ? 5 : 3.4}
            fill="#06070a"
            stroke={i === 3 || i === 4 ? "#5eead4" : "#5b6178"}
            strokeWidth="1.4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.07 }}
          />
          {(i === 3 || i === 4) && (
            <motion.circle
              cx={n.x}
              cy={n.y}
              r={5}
              fill="none"
              stroke="#5eead4"
              strokeWidth="1"
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 2.4 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </motion.g>
      ))}
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-void pt-16 md:pt-20">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-signal/5 blur-[120px]" />

      <Container className="relative grid items-center gap-14 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex items-center gap-2 border-l-2 border-signal pl-3 font-mono text-xs uppercase tracking-[0.2em] text-signal"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
            System status: engineering AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance font-display text-[2.6rem] font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-[3.6rem]"
          >
            Build What's <span className="text-signal">Next</span> With AI.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-lg text-balance text-lg leading-relaxed text-ink-dim"
          >
            NeovationLabs engineers intelligent software, AI systems, autonomous
            workflows, and data infrastructure for businesses ready to
            operate at the next level.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button to="/contact" variant="primary">
              Start a Project
            </Button>
            <Button to="/services" variant="secondary" withArrow={false}>
              Explore Services
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto aspect-square w-full max-w-md"
        >
          <NetworkVisual />
        </motion.div>
      </Container>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className="text-ink-faint" />
        </motion.div>
      </motion.div>
    </section>
  );
}
