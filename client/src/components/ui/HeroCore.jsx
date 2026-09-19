// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";

const N = 150;
const LINK = 0.44;
const SIGNAL_EVERY = 2.1;
const SIGNAL_LEN = 1.15;

const TEAL = [94, 234, 212];
const VIOLET = [139, 124, 246];
const mixc = (t) => VIOLET.map((v, i) => Math.round(v + (TEAL[i] - v) * t));

/* ------------------------------ capability chips ------------------------------ */

function GenAIVisual() {
  return (
    <div className="mt-2 space-y-1">
      {[100, 72, 88].map((w, i) => (
        <div key={w} className="h-[3px] rounded-full bg-line" style={{ width: `${w}%` }}>
          <div
            className="hc-line h-full origin-left rounded-full bg-signal/80"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        </div>
      ))}
    </div>
  );
}

function VisionVisual() {
  return (
    <div className="relative mt-2 h-[22px] overflow-hidden rounded-[3px] border border-signal/35">
      <div className="hc-scan absolute inset-x-0 h-px bg-signal shadow-[0_0_6px_rgba(94,234,212,0.9)]" />
      <span className="absolute left-1 top-1 h-1.5 w-1.5 border-l border-t border-signal/70" />
      <span className="absolute bottom-1 right-1 h-1.5 w-1.5 border-b border-r border-signal/70" />
    </div>
  );
}

function DataVisual() {
  return (
    <div className="mt-2 flex h-[22px] items-end gap-1">
      {[0, 0.25, 0.5, 0.15, 0.4, 0.65, 0.3].map((d, i) => (
        <span
          key={i}
          className="hc-bar h-full w-1.5 origin-bottom rounded-[1px] bg-gradient-to-t from-pulse to-signal"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </div>
  );
}

function AgentVisual() {
  return (
    <div className="relative mt-2 flex h-[22px] items-center justify-between">
      <span className="absolute inset-x-1 top-1/2 h-px bg-line" />
      {[0, 1, 2].map((n) => (
        <span key={n} className="relative h-2 w-2 rounded-full border border-signal/70 bg-void" />
      ))}
      <span className="hc-flow absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_6px_rgba(94,234,212,1)]" />
    </div>
  );
}

const chips = [
  { label: "Generative AI", visual: <GenAIVisual />, pos: "left-[2%] top-[4%]", anchor: [0.2, 0.13], float: "0s" },
  { label: "Computer Vision", visual: <VisionVisual />, pos: "right-[2%] top-[13%]", anchor: [0.8, 0.22], float: "-1.5s" },
  { label: "Data Engineering", visual: <DataVisual />, pos: "left-[2%] bottom-[13%]", anchor: [0.2, 0.78], float: "-3s" },
  { label: "AI Agents", visual: <AgentVisual />, pos: "right-[2%] bottom-[4%]", anchor: [0.8, 0.87], float: "-4.5s" },
];

/* ---------------------------------- component --------------------------------- */

export default function HeroCore() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const chipRefs = useRef([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let R = 0;
    let raf = 0;
    let visible = true;
    let time = 0;
    let last = performance.now();
    let sigTimer = 0.9;
    let sigChip = 0;
    let sig = null;
    const flash = chips.map(() => 0);
    const shown = chips.map(() => -1);
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    // Fibonacci sphere of nodes, lightly jittered
    const pts = Array.from({ length: N }, (_, i) => {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      const k = 0.95 + Math.random() * 0.1;
      return { x: Math.cos(th) * r * k, y: y * k, z: Math.sin(th) * r * k, glow: 0 };
    });
    const adj = pts.map(() => []);
    const edges = [];
    for (let i = 0; i < N; i += 1) {
      for (let j = i + 1; j < N; j += 1) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y, pts[i].z - pts[j].z);
        if (d < LINK) {
          edges.push([i, j]);
          adj[i].push(j);
          adj[j].push(i);
        }
      }
    }
    const sx = new Float32Array(N);
    const sy = new Float32Array(N);
    const dp = new Float32Array(N);

    const newPulse = () => {
      const a = Math.floor(Math.random() * N);
      const nb = adj[a];
      return { a, b: nb.length ? nb[Math.floor(Math.random() * nb.length)] : a, prev: -1, t: Math.random(), speed: 0.8 + Math.random() * 0.9 };
    };
    const pulses = Array.from({ length: 16 }, newPulse);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      R = Math.min(W, H) * 0.3;
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(0);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(wrap);

    const onMove = (e) => {
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const ring = (rx, ry, rot, a0, a1, alpha, dash) => {
      ctx.save();
      ctx.strokeStyle = `rgba(94,234,212,${alpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rot, a0, a1);
      ctx.stroke();
      ctx.restore();
    };
    const ringPoint = (rx, ry, rot, a) => {
      const x = rx * Math.cos(a);
      const y = ry * Math.sin(a);
      return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
    };
    const bez = (p, ax, ay, kx, ky) => {
      const u = 1 - p;
      return [u * u * cx + 2 * u * p * kx + p * p * ax, u * u * cy + 2 * u * p * ky + p * p * ay];
    };

    function draw(dt) {
      time += dt;
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3);

      const rotY = time * 0.16 + mouse.x * 0.9;
      const rotX = -0.32 + mouse.y * 0.5;
      const cY = Math.cos(rotY);
      const sY = Math.sin(rotY);
      const cX = Math.cos(rotX);
      const sX = Math.sin(rotX);

      ctx.clearRect(0, 0, W, H);

      // breathing core glow
      const breathe = 0.5 + 0.5 * Math.sin(time * 1.4);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
      g.addColorStop(0, `rgba(94,234,212,${0.2 + breathe * 0.1})`);
      g.addColorStop(0.35, "rgba(139,124,246,0.10)");
      g.addColorStop(1, "rgba(94,234,212,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // back halves of the orbit rings
      ring(R * 1.42, R * 0.44, -0.38, Math.PI, Math.PI * 2, 0.16, [2, 7]);
      ring(R * 1.24, R * 0.34, 0.55, Math.PI, Math.PI * 2, 0.12, [1, 6]);

      // project
      for (let i = 0; i < N; i += 1) {
        const p = pts[i];
        const x1 = p.x * cY + p.z * sY;
        const z1 = -p.x * sY + p.z * cY;
        const y2 = p.y * cX - z1 * sX;
        const z2 = p.y * sX + z1 * cX;
        const sc = 1 + z2 * 0.16;
        sx[i] = cx + x1 * R * sc;
        sy[i] = cy + y2 * R * sc;
        dp[i] = (z2 + 1) / 2;
        p.glow = Math.max(0, p.glow - dt * 1.6);
      }

      // edges
      ctx.lineWidth = 1;
      for (let e = 0; e < edges.length; e += 1) {
        const [i, j] = edges[e];
        const d = (dp[i] + dp[j]) / 2;
        const [r, gg, b] = mixc(d);
        ctx.strokeStyle = `rgba(${r},${gg},${b},${0.05 + d * d * 0.28})`;
        ctx.beginPath();
        ctx.moveTo(sx[i], sy[i]);
        ctx.lineTo(sx[j], sy[j]);
        ctx.stroke();
      }

      // travelling pulses
      for (let n = 0; n < pulses.length; n += 1) {
        const p = pulses[n];
        p.t += p.speed * dt;
        if (p.t >= 1) {
          pts[p.b].glow = 1;
          const from = p.a;
          p.a = p.b;
          const nb = adj[p.a];
          const opts = nb.filter((k) => k !== from);
          const pool = opts.length ? opts : nb;
          p.b = pool.length ? pool[Math.floor(Math.random() * pool.length)] : p.a;
          p.prev = from;
          p.t = 0;
        }
        const x = sx[p.a] + (sx[p.b] - sx[p.a]) * p.t;
        const y = sy[p.a] + (sy[p.b] - sy[p.a]) * p.t;
        const d = dp[p.a] + (dp[p.b] - dp[p.a]) * p.t;
        const tx = sx[p.a] + (sx[p.b] - sx[p.a]) * Math.max(0, p.t - 0.35);
        const ty = sy[p.a] + (sy[p.b] - sy[p.a]) * Math.max(0, p.t - 0.35);
        const tg = ctx.createLinearGradient(tx, ty, x, y);
        tg.addColorStop(0, "rgba(94,234,212,0)");
        tg.addColorStop(1, `rgba(94,234,212,${0.35 + d * 0.6})`);
        ctx.strokeStyle = tg;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // nodes
      for (let i = 0; i < N; i += 1) {
        const d = dp[i];
        const gl = pts[i].glow;
        const [r, gg, b] = mixc(Math.min(1, d + gl * 0.6));
        const size = 1 + d * 1.7 + gl * 1.8;
        ctx.fillStyle = `rgba(${r},${gg},${b},${0.3 + d * 0.6 + gl * 0.3})`;
        if (gl > 0.05) {
          ctx.shadowColor = "rgba(94,234,212,0.95)";
          ctx.shadowBlur = 10 * gl;
        }
        ctx.beginPath();
        ctx.arc(sx[i], sy[i], size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // front halves of the rings + orbiting beads
      ring(R * 1.42, R * 0.44, -0.38, 0, Math.PI, 0.34, [2, 7]);
      ring(R * 1.24, R * 0.34, 0.55, 0, Math.PI, 0.26, [1, 6]);
      [
        [R * 1.42, R * 0.44, -0.38, time * 0.55, 3.2],
        [R * 1.24, R * 0.34, 0.55, -time * 0.8 + 2, 2.6],
      ].forEach(([rx, ry, rot, a, s]) => {
        const [x, y] = ringPoint(rx, ry, rot, a);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(94,234,212,1)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // signal from the core to a capability card
      sigTimer -= dt;
      if (!sig && sigTimer <= 0) {
        sig = { k: sigChip, t: 0 };
        sigChip = (sigChip + 1) % chips.length;
        sigTimer = SIGNAL_EVERY;
      }
      if (sig) {
        sig.t += dt / SIGNAL_LEN;
        const [fx, fy] = chips[sig.k].anchor;
        const ax = fx * W;
        const ay = fy * H;
        const mx = (cx + ax) / 2;
        const my = (cy + ay) / 2;
        const len = Math.hypot(ax - cx, ay - cy);
        const kx = mx + ((ay - cy) / len) * len * 0.22;
        const ky = my - ((ax - cx) / len) * len * 0.22;
        const p = Math.min(1, sig.t);
        const e = 1 - Math.pow(1 - p, 3);

        // faint guide
        ctx.strokeStyle = `rgba(94,234,212,${0.16 * Math.sin(Math.PI * p)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(kx, ky, ax, ay);
        ctx.stroke();

        // comet trail + head
        for (let s = 0; s < 14; s += 1) {
          const q = Math.max(0, e - s * 0.018);
          const [x, y] = bez(q, ax, ay, kx, ky);
          ctx.fillStyle = `rgba(94,234,212,${(1 - s / 14) * 0.7})`;
          ctx.beginPath();
          ctx.arc(x, y, 3.2 - s * 0.18, 0, Math.PI * 2);
          ctx.fill();
        }
        const [hx, hy] = bez(e, ax, ay, kx, ky);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(94,234,212,1)";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(hx, hy, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (sig.t >= 1) {
          flash[sig.k] = 1;
          sig = null;
        }
      }

      for (let k = 0; k < chips.length; k += 1) {
        flash[k] = Math.max(0, flash[k] - dt * 1.3);
        const f = Math.round(flash[k] * 25) / 25;
        if (f !== shown[k]) {
          shown[k] = f;
          const el = chipRefs.current[k];
          if (el) {
            el.style.borderColor = `rgba(94,234,212,${0.16 + f * 0.8})`;
            el.style.boxShadow = f > 0.02 ? `0 0 ${Math.round(6 + f * 30)}px rgba(94,234,212,${f * 0.35})` : "none";
          }
        }
      }
    }

    if (reduceMotion) {
      draw(0);
    } else {
      const frame = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (visible) draw(dt);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="Animated illustration of a rotating neural network core sending signals to generative AI, computer vision, data engineering, and AI agents"
      className="relative aspect-square w-full"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {chips.map((c, i) => (
        <div
          key={c.label}
          ref={(el) => {
            chipRefs.current[i] = el;
          }}
          className={cn(
            "hc-float absolute z-10 w-[41%] rounded-xl border border-line bg-surface/85 px-2.5 py-2.5 backdrop-blur-md sm:w-[36%] sm:px-3",
            c.pos
          )}
          style={{ animationDelay: c.float }}
        >
          <div className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-ink-dim sm:text-[10px] sm:tracking-[0.14em]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-signal" />
            <span className="truncate">{c.label}</span>
          </div>
          {c.visual}
        </div>
      ))}
    </div>
  );
}
