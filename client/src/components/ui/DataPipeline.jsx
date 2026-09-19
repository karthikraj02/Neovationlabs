// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const sources = ["CRM", "ERP", "APIs", "Databases", "Files", "Streams"];
const stages = [
  { name: "Ingestion", note: "Collected from every source" },
  { name: "Processing", note: "Cleaned and normalized" },
  { name: "Data Lake / Warehouse", note: "Stored, governed, queryable" },
  { name: "Feature Engineering", note: "Signals extracted" },
  { name: "AI / ML", note: "Models trained and served" },
  { name: "Business Intelligence", note: "Decisions surfaced" },
];

const N = stages.length;
const GRAY = [91, 97, 120];
const VIOLET = [139, 124, 246];
const TEAL = [94, 234, 212];

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
const colorAt = (t) =>
  t < 0.4 ? mix(GRAY, VIOLET, smooth(0.05, 0.4, t)) : mix(VIOLET, TEAL, smooth(0.4, 0.85, t));
const gate = (i) => (i + 0.5) / N;

const newParticle = (t = 0.01) => ({
  t,
  v: 0.075 + Math.random() * 0.035,
  off: Math.random() * 2 - 1,
  ph: Math.random() * Math.PI * 2,
  rot: Math.random() * Math.PI * 2,
});

export default function DataPipeline() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRefs = useRef([]);
  const inView = useInView(wrapRef, { margin: "80px" });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !inView) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let raf = 0;
    let last = performance.now();
    let spawnAcc = 0;
    let outGlow = 0;
    const flash = Array(N).fill(0);
    const shown = Array(N).fill(-1);
    const particles = Array.from({ length: 80 }, () => newParticle(Math.random() * 0.98));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(performance.now(), 0);
    });
    ro.observe(canvas);

    function draw(now, dt) {
      const cy = H / 2;
      const amp = H * 0.4;
      ctx.clearRect(0, 0, W, H);

      // ordered lanes, fading in once data has been structured
      for (let k = -2; k <= 2; k += 1) {
        const grad = ctx.createLinearGradient(W * 0.38, 0, W * 0.98, 0);
        grad.addColorStop(0, "rgba(94,234,212,0)");
        grad.addColorStop(1, "rgba(94,234,212,0.10)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        // lanes converge with the funnel
        const sx = (t) => {
          const s = 1 - 0.14 * [0, 1, 2, 3, 4].reduce((a, i) => a + smooth(gate(i) - 0.025, gate(i) + 0.025, t), 0);
          return cy + k * 0.5 * amp * s;
        };
        ctx.moveTo(W * 0.38, sx(0.38));
        for (let x = 0.4; x <= 1.0001; x += 0.02) ctx.lineTo(W * x, sx(x));
        ctx.stroke();
      }

      // stage gates
      for (let i = 0; i < N; i += 1) {
        flash[i] = Math.max(0, flash[i] - dt * 3.4);
        const gx = gate(i) * W;
        const a = 0.14 + flash[i] * 0.8;
        ctx.strokeStyle = `rgba(94,234,212,${a})`;
        ctx.lineWidth = 1 + flash[i] * 1.5;
        ctx.shadowColor = "rgba(94,234,212,0.9)";
        ctx.shadowBlur = flash[i] * 14;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(gx, 8);
        ctx.lineTo(gx, H - 8);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        const f = Math.round(flash[i] * 50) / 50;
        if (f !== shown[i]) {
          shown[i] = f;
          const el = stageRefs.current[i];
          if (el) {
            el.style.borderColor = `rgba(94,234,212,${0.14 + f * 0.75})`;
            el.style.backgroundColor = `rgba(94,234,212,${f * 0.09})`;
            el.style.boxShadow = f > 0.02 ? `0 0 ${Math.round(f * 26)}px rgba(94,234,212,${f * 0.28})` : "none";
          }
        }
      }

      // output glow on the right edge
      outGlow = Math.max(0, outGlow - dt * 1.6);
      const og = ctx.createRadialGradient(W, cy, 0, W, cy, H * 0.55);
      og.addColorStop(0, `rgba(94,234,212,${0.1 + outGlow * 0.4})`);
      og.addColorStop(1, "rgba(94,234,212,0)");
      ctx.fillStyle = og;
      ctx.fillRect(W - H * 0.6, 0, H * 0.6, H);

      // particles
      for (let n = particles.length - 1; n >= 0; n -= 1) {
        const p = particles[n];
        const prev = p.t;
        const nearest = Math.min(...[0, 1, 2, 3, 4, 5].map((i) => Math.abs(p.t - gate(i))));
        p.t += p.v * dt * (0.5 + 0.5 * Math.min(1, nearest / 0.045));

        for (let i = 0; i < N; i += 1) {
          if (prev < gate(i) && p.t >= gate(i)) flash[i] = Math.min(1, flash[i] + 0.2);
        }
        if (prev < 0.985 && p.t >= 0.985) outGlow = Math.min(1, outGlow + 0.22);
        if (p.t > 1.01) {
          particles.splice(n, 1);
          continue;
        }

        const t = p.t;
        const s =
          1 -
          0.14 * [0, 1, 2, 3, 4].reduce((a, i) => a + smooth(gate(i) - 0.025, gate(i) + 0.025, t), 0) -
          0.25 * smooth(gate(5) - 0.025, gate(5) + 0.025, t);
        const q = smooth(gate(2) - 0.03, gate(3), t); // structured after the warehouse
        const offE = lerp(p.off, Math.round(p.off * 2) / 2, q);
        const jit = (1 - q) * Math.max(s, 0.3) * 7;
        const x = t * W;
        const y = cy + offE * amp * s + Math.sin(now / 280 + p.ph) * jit;

        const [r, g, b] = colorAt(t);
        const size = 5 - 2.2 * smooth(0.1, 0.7, t);
        const alpha = Math.min(1, t * 12) * (t > 0.96 ? Math.max(0, (1.01 - t) / 0.05) : 1);

        if (q > 0.3) {
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.28 * alpha * q})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - 16 * q, y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot + (now / 420) * (1 - q));
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        if (t > 0.4) {
          ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
          ctx.shadowBlur = 8 * smooth(0.4, 0.85, t);
        }
        const rad = lerp(0.6, size / 2, smooth(0.3, 0.6, t));
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-size / 2, -size / 2, size, size, rad);
        else ctx.rect(-size / 2, -size / 2, size, size);
        ctx.fill();
        ctx.restore();
      }
    }

    if (reduce) {
      draw(performance.now(), 0);
      return () => ro.disconnect();
    }

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      spawnAcc += dt;
      while (spawnAcc > 0.085) {
        spawnAcc -= 0.085;
        particles.push(newParticle());
      }
      draw(now, dt);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView]);

  return (
    <div ref={wrapRef} className="space-y-6">
      <div>
        <div className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
          Data sources
        </div>
        <div className="flex flex-wrap gap-2">
          {sources.map((s, i) => (
            <motion.span
              key={s}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="chip-emit rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-xs text-ink-dim"
              style={{ animationDelay: `${i * 0.45}s` }}
            >
              {s}
            </motion.span>
          ))}
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-xl border border-line-soft bg-void/60"
        role="img"
        aria-label="Animated illustration: messy raw data particles flow through six stages and emerge as ordered, refined signal"
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute left-3 top-2 z-10 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
          Raw
        </div>
        <div className="pointer-events-none absolute right-3 top-2 z-10 font-mono text-[10px] uppercase tracking-widest text-signal">
          Refined
        </div>
        <canvas ref={canvasRef} className="relative block h-[210px] w-full md:h-[250px]" />
      </div>

      <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-0">
        {stages.map((s, i) => (
          <li key={s.name} className="lg:px-1.5">
            <motion.div
              ref={(el) => {
                stageRefs.current[i] = el;
              }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-xl border border-line-soft bg-surface px-3 py-3 transition-[background-color,border-color,box-shadow] duration-200"
            >
              <div className="font-mono text-[10px] text-signal">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-1 font-mono text-xs leading-snug text-ink">{s.name}</div>
              <div className="mt-1 text-[11px] leading-snug text-ink-faint">{s.note}</div>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  );
}
